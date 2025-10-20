import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService } from '../../../core/services/settings.service';
import { ProfileSettingsComponent } from './profile-settings.component';

@Component({
  selector: 'app-super-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ProfileSettingsComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  readonly activeTab = signal('profile');
  readonly saving = signal(false);
  readonly savedMessage = signal('');
  readonly loading = signal(true);
  readonly testingEmail = signal(false);
  readonly emailTestMessage = signal('');
  
  settingsForm!: FormGroup;

  readonly generalSettings = signal({
    platformName: 'Exits LMS',
    platformUrl: 'https://exits-lms.com',
    supportEmail: 'support@exits-lms.com',
    timezone: 'UTC',
    currency: 'PHP'
  });

  readonly emailSettings = signal({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    senderEmail: 'noreply@exits-lms.com',
    senderName: 'Exits LMS',
    enableEmailNotifications: true
  });

  readonly securitySettings = signal({
    enableTwoFactor: false,
    passwordMinLength: 8,
    sessionTimeout: 30,
    loginAttempts: 5,
    enableApiKeys: true
  });

  readonly features = signal({
    moneyLoan: true,
    bnpl: true,
    advancedAnalytics: true,
    apiAccess: true,
    customBranding: false
  });

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  initializeForm(): void {
    this.settingsForm = this.fb.group({
      platformName: [this.generalSettings().platformName, Validators.required],
      platformUrl: [this.generalSettings().platformUrl, [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      supportEmail: [this.generalSettings().supportEmail, [Validators.required, Validators.email]],
      timezone: [this.generalSettings().timezone],
      currency: [this.generalSettings().currency],
      smtpHost: [this.emailSettings().smtpHost],
      smtpPort: [this.emailSettings().smtpPort],
      senderEmail: [this.emailSettings().senderEmail, Validators.email],
      senderName: [this.emailSettings().senderName],
      enableTwoFactor: [this.securitySettings().enableTwoFactor],
      passwordMinLength: [this.securitySettings().passwordMinLength, [Validators.required, Validators.min(6)]],
      sessionTimeout: [this.securitySettings().sessionTimeout, Validators.required],
      loginAttempts: [this.securitySettings().loginAttempts, Validators.required],
      enableApiKeys: [this.securitySettings().enableApiKeys]
    });
  }

  loadSettings(): void {
    this.loading.set(true);
    this.settingsService.getSettings().subscribe({
      next: (response) => {
        if (response.success && response.settings) {
          const settings = response.settings as Record<string, any>;

          // Update general settings
          this.generalSettings.set({
            platformName: settings['platform_name'] || 'Exits LMS',
            platformUrl: settings['platform_url'] || 'https://exits-lms.com',
            supportEmail: settings['support_email'] || 'support@exits-lms.com',
            timezone: settings['timezone'] || 'UTC',
            currency: settings['currency'] || 'PHP'
          });

          // Update email settings
          this.emailSettings.set({
            smtpHost: settings['smtp_host'] || 'smtp.gmail.com',
            smtpPort: settings['smtp_port'] || 587,
            senderEmail: settings['sender_email'] || 'noreply@exits-lms.com',
            senderName: settings['sender_name'] || 'Exits LMS',
            enableEmailNotifications: settings['enable_email_notifications'] ?? true
          });

          // Update security settings
          this.securitySettings.set({
            enableTwoFactor: settings['enable_two_factor'] ?? false,
            passwordMinLength: settings['password_min_length'] || 8,
            sessionTimeout: settings['session_timeout'] || 30,
            loginAttempts: settings['login_attempts'] || 5,
            enableApiKeys: settings['enable_api_keys'] ?? true
          });

          // Update feature settings
          this.features.set({
            moneyLoan: settings['money_loan_enabled'] ?? true,
            bnpl: settings['bnpl_enabled'] ?? true,
            advancedAnalytics: settings['advanced_analytics_enabled'] ?? true,
            apiAccess: settings['enable_api_keys'] ?? true,
            customBranding: settings['custom_branding_enabled'] ?? false
          });

          // Update form with loaded settings
          this.initializeForm();
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading settings:', error);
        this.loading.set(false);
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }

  toggleFeature(feature: string): void {
    const current = this.features();
    const updated = {
      ...current,
      [feature]: !current[feature as keyof typeof current]
    };
    this.features.set(updated);

    // Update the corresponding form control or API
    const featureMap: Record<string, string> = {
      moneyLoan: 'money_loan_enabled',
      bnpl: 'bnpl_enabled',
      advancedAnalytics: 'advanced_analytics_enabled',
      customBranding: 'custom_branding_enabled'
    };

    const settingKey = featureMap[feature];
    if (settingKey) {
      this.settingsService.updateSetting(settingKey, updated[feature as keyof typeof updated]).subscribe({
        error: (error) => {
          console.error('Error updating feature:', error);
        }
      });
    }
  }

  saveSettings(): void {
    if (!this.settingsForm.valid) return;

    this.saving.set(true);
    this.savedMessage.set('');

    const formValue = this.settingsForm.value;

    const settingsToUpdate = {
      platform_name: formValue.platformName,
      platform_url: formValue.platformUrl,
      support_email: formValue.supportEmail,
      timezone: formValue.timezone,
      currency: formValue.currency,
      smtp_host: formValue.smtpHost,
      smtp_port: formValue.smtpPort,
      sender_email: formValue.senderEmail,
      sender_name: formValue.senderName,
      enable_two_factor: formValue.enableTwoFactor,
      password_min_length: formValue.passwordMinLength,
      session_timeout: formValue.sessionTimeout,
      login_attempts: formValue.loginAttempts,
      enable_api_keys: formValue.enableApiKeys
    };

    this.settingsService.updateSettings(settingsToUpdate).subscribe({
      next: (response) => {
        if (response.success) {
          // Update local signals with new values
          this.generalSettings.set({
            platformName: formValue.platformName,
            platformUrl: formValue.platformUrl,
            supportEmail: formValue.supportEmail,
            timezone: formValue.timezone,
            currency: formValue.currency
          });

          this.emailSettings.set({
            smtpHost: formValue.smtpHost,
            smtpPort: formValue.smtpPort,
            senderEmail: formValue.senderEmail,
            senderName: formValue.senderName,
            enableEmailNotifications: true
          });

          this.securitySettings.set({
            enableTwoFactor: formValue.enableTwoFactor,
            passwordMinLength: formValue.passwordMinLength,
            sessionTimeout: formValue.sessionTimeout,
            loginAttempts: formValue.loginAttempts,
            enableApiKeys: formValue.enableApiKeys
          });

          this.saving.set(false);
          this.savedMessage.set('✓ Settings saved successfully');

          setTimeout(() => {
            this.savedMessage.set('');
          }, 3000);
        }
      },
      error: (error) => {
        console.error('Error saving settings:', error);
        this.savedMessage.set('✗ Failed to save settings');
        this.saving.set(false);

        setTimeout(() => {
          this.savedMessage.set('');
        }, 3000);
      }
    });
  }

  testEmailConnection(): void {
    if (!this.settingsForm.valid) return;

    const formValue = this.settingsForm.value;

    this.testingEmail.set(true);
    this.emailTestMessage.set('');

    this.settingsService.testEmailConnection({
      smtpHost: formValue.smtpHost,
      smtpPort: formValue.smtpPort,
      senderEmail: formValue.senderEmail
    }).subscribe({
      next: (response) => {
        this.testingEmail.set(false);
        this.emailTestMessage.set('✓ Email connection successful');

        setTimeout(() => {
          this.emailTestMessage.set('');
        }, 3000);
      },
      error: (error) => {
        this.testingEmail.set(false);
        this.emailTestMessage.set('✗ Email connection failed: ' + (error.error?.error || error.message));

        setTimeout(() => {
          this.emailTestMessage.set('');
        }, 3000);
      }
    });
  }
}
