import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-coming-soon-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 overflow-y-auto" (click)="close()">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80"></div>

        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" (click)="$event.stopPropagation()">
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 sm:mx-0 sm:h-10 sm:w-10">
                <span class="text-2xl">{{ icon }}</span>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 class="text-lg leading-6 font-bold text-gray-900 dark:text-white">
                  {{ title }}
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ description }}
                  </p>
                </div>
                <div class="mt-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <p class="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2">🚀 Coming Soon</p>
                  <p class="text-xs text-gray-700 dark:text-gray-300">
                    This feature is currently under development and will be available in a future release.
                  </p>
                </div>
                <div *ngIf="plannedFeatures.length > 0" class="mt-4">
                  <p class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Planned Features:</p>
                  <ul class="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li *ngFor="let feature of plannedFeatures" class="flex items-start">
                      <span class="text-purple-500 mr-2">✓</span>
                      <span>{{ feature }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              (click)="close()"
              class="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-sm font-medium text-white hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-xs transition-all duration-200">
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ComingSoonModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Feature Coming Soon';
  @Input() description = 'This feature is currently in development.';
  @Input() icon = '🚧';
  @Input() plannedFeatures: string[] = [];
  @Output() closeModal = new EventEmitter<void>();

  close() {
    this.isOpen = false;
    this.closeModal.emit();
  }
}
