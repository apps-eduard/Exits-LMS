import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService } from '../../../core/services/settings.service';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables?: string[];
  category: 'onboarding' | 'notifications' | 'alerts' | 'system';
  isEnabled: boolean;
  lastModified?: Date;
}

@Component({
  selector: 'app-email-templates',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './email-templates.component.html',
  styleUrl: './email-templates.component.scss'
})
export class EmailTemplatesComponent implements OnInit {
  readonly templates = signal<EmailTemplate[]>([]);
  readonly selectedTemplate = signal<EmailTemplate | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly savedMessage = signal('');
  readonly editMode = signal(false);
  readonly searchTerm = signal('');

  templateForm!: FormGroup;

  readonly categories = ['onboarding', 'notifications', 'alerts', 'system'];

  // Default templates
  readonly defaultTemplates: EmailTemplate[] = [
    {
      id: '1',
      name: 'Welcome Email',
      subject: 'Welcome to Exits LMS - {{organizationName}}',
      body: `Hello {{firstName}},

Welcome to Exits LMS! We're excited to have you on board.

Your account has been successfully created. You can now log in with your credentials.

Login URL: {{loginUrl}}
Username: {{email}}

If you have any questions, feel free to reach out to our support team.

Best regards,
{{organizationName}} Team`,
      variables: ['firstName', 'organizationName', 'loginUrl', 'email'],
      category: 'onboarding',
      isEnabled: true
    },
    {
      id: '2',
      name: 'Password Reset',
      subject: 'Password Reset Request - {{organizationName}}',
      body: `Hello {{firstName}},

We received a request to reset your password. Click the link below to create a new password:

Reset Link: {{resetLink}}

This link will expire in 24 hours.

If you didn't request this, please ignore this email.

Best regards,
{{organizationName}} Team`,
      variables: ['firstName', 'organizationName', 'resetLink'],
      category: 'system',
      isEnabled: true
    },
    {
      id: '3',
      name: 'Loan Application Approved',
      subject: 'Your Loan Application Has Been Approved - {{organizationName}}',
      body: `Hello {{firstName}},

Good news! Your loan application has been approved.

Loan Details:
- Amount: {{loanAmount}}
- Term: {{loanTerm}} months
- Interest Rate: {{interestRate}}%
- Approval Date: {{approvalDate}}

You can view your loan details and accept the terms here: {{loanLink}}

If you have any questions, please contact our support team.

Best regards,
{{organizationName}} Team`,
      variables: ['firstName', 'organizationName', 'loanAmount', 'loanTerm', 'interestRate', 'approvalDate', 'loanLink'],
      category: 'notifications',
      isEnabled: true
    },
    {
      id: '4',
      name: 'Payment Reminder',
      subject: 'Payment Reminder - {{organizationName}}',
      body: `Hello {{firstName}},

This is a reminder that your payment is due on {{dueDate}}.

Payment Details:
- Amount Due: {{amountDue}}
- Due Date: {{dueDate}}
- Reference: {{paymentReference}}

Please make your payment before the due date to avoid penalties.

Pay Now: {{paymentLink}}

Best regards,
{{organizationName}} Team`,
      variables: ['firstName', 'organizationName', 'dueDate', 'amountDue', 'paymentReference', 'paymentLink'],
      category: 'alerts',
      isEnabled: true
    }
  ];

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadTemplates();
  }

  initializeForm(): void {
    this.templateForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      subject: ['', [Validators.required, Validators.minLength(10)]],
      body: ['', [Validators.required, Validators.minLength(50)]],
      category: ['onboarding', Validators.required],
      isEnabled: [true]
    });
  }

  loadTemplates(): void {
    this.loading.set(true);
    // In a real implementation, load from backend
    // For now, use default templates
    this.templates.set(this.defaultTemplates);
    this.loading.set(false);
  }

  selectTemplate(template: EmailTemplate): void {
    this.selectedTemplate.set(template);
    this.editMode.set(false);
    this.templateForm.reset(template);
  }

  editTemplate(): void {
    this.editMode.set(true);
    if (this.selectedTemplate()) {
      this.templateForm.patchValue(this.selectedTemplate()!);
    }
  }

  saveTemplate(): void {
    if (!this.templateForm.valid || !this.selectedTemplate()) return;

    this.saving.set(true);
    this.savedMessage.set('');

    const formValue = this.templateForm.value;
    const updatedTemplate: EmailTemplate = {
      ...this.selectedTemplate()!,
      ...formValue
    };

    // Simulate API call
    setTimeout(() => {
      const templates = this.templates();
      const index = templates.findIndex(t => t.id === updatedTemplate.id);
      if (index >= 0) {
        templates[index] = updatedTemplate;
        this.templates.set([...templates]);
        this.selectedTemplate.set(updatedTemplate);
      }

      this.saving.set(false);
      this.editMode.set(false);
      this.savedMessage.set('✓ Template saved successfully');

      setTimeout(() => {
        this.savedMessage.set('');
      }, 3000);
    }, 500);
  }

  cancelEdit(): void {
    this.editMode.set(false);
    if (this.selectedTemplate()) {
      this.templateForm.reset(this.selectedTemplate()!);
    }
  }

  toggleTemplate(template: EmailTemplate): void {
    const updatedTemplate = { ...template, isEnabled: !template.isEnabled };
    const templates = this.templates();
    const index = templates.findIndex(t => t.id === template.id);
    if (index >= 0) {
      templates[index] = updatedTemplate;
      this.templates.set([...templates]);
      if (this.selectedTemplate()?.id === template.id) {
        this.selectedTemplate.set(updatedTemplate);
      }
    }
  }

  previewTemplate(): void {
    if (!this.selectedTemplate()) return;
    const template = this.selectedTemplate()!;
    const preview = `
Subject: ${template.subject}
---
${template.body}
    `;
    alert(preview);
  }

  get filteredTemplates(): EmailTemplate[] {
    const search = this.searchTerm().toLowerCase();
    return this.templates().filter(t =>
      t.name.toLowerCase().includes(search) ||
      t.subject.toLowerCase().includes(search)
    );
  }

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      onboarding: 'bg-blue-900/30 border border-blue-700 text-blue-400',
      notifications: 'bg-green-900/30 border border-green-700 text-green-400',
      alerts: 'bg-orange-900/30 border border-orange-700 text-orange-400',
      system: 'bg-purple-900/30 border border-purple-700 text-purple-400'
    };
    return colors[category] || 'bg-gray-900/30 border border-gray-700 text-gray-400';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.templateForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.templateForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return `${fieldName} is required`;
    if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;

    return 'Invalid field';
  }
}
