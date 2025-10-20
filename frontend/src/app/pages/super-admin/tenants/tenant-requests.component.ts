import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tenant-requests',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Page Header -->
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">📋 Tenant Requests</h1>
          <p class="text-gray-600 dark:text-gray-400">Review and approve new tenant applications</p>
        </div>

        <!-- Coming Soon Card -->
        <div class="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-8 text-center border border-purple-200 dark:border-purple-800">
          <div class="text-6xl mb-4">🚧</div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Coming Soon</h2>
          <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            This feature is under development. You'll be able to review and approve tenant registration requests here.
          </p>
        </div>
      </div>
    </div>
  `
})
export class TenantRequestsComponent {}
