import { Component, OnInit, signal, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
  styles: []
})
export class AppComponent implements OnInit {
  title = 'Exits LMS';
  isDarkMode = signal<boolean>(true);

  constructor() {
    // Apply theme change effect
    effect(() => {
      this.applyTheme(this.isDarkMode());
    });
  }

  ngOnInit() {
    // Get theme from localStorage or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const isDark = savedTheme === 'dark';
    this.isDarkMode.set(isDark);
    this.applyTheme(isDark);
  }

  toggleTheme(): void {
    this.isDarkMode.set(!this.isDarkMode());
  }

  private applyTheme(isDark: boolean) {
    const html = document.documentElement;
    const body = document.body;
    
    if (isDark) {
      html.classList.add('dark');
      body.classList.add('dark');
      html.style.colorScheme = 'dark';
      body.style.backgroundColor = '#111827';
      body.style.color = '#f3f4f6';
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      body.classList.remove('dark');
      html.style.colorScheme = 'light';
      body.style.backgroundColor = '#f9fafb';
      body.style.color = '#111827';
      localStorage.setItem('theme', 'light');
    }
  }
}
