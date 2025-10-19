import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Customer List</h2>
      <p class="text-gray-600 dark:text-gray-400">Money-Loan module coming soon...</p>
    </div>
  `
})
export class CustomerListComponent {}
