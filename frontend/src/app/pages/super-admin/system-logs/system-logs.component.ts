import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TitleCasePipe } from '@angular/common';
import { FilterByLevelPipe } from './system-logs.pipes';

interface SystemLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'SUCCESS';
  message: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  duration?: string;
  details?: string;
  source: 'HTTP' | 'DATABASE' | 'AUTH' | 'RBAC' | 'SYSTEM';
}

@Component({
  selector: 'app-system-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, TitleCasePipe, FilterByLevelPipe],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 animate-fade-in p-6 lg:p-8">
      <!-- Error Alert -->
      <div *ngIf="error()" class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 rounded-lg p-4 mb-6">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-red-600 dark:text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
          </svg>
          <div>
            <p class="text-red-800 dark:text-red-200 font-semibold">Error Loading System Logs</p>
            <p class="text-red-700 dark:text-red-300 text-sm mt-1">{{ error() }}</p>
          </div>
        </div>
      </div>

      <!-- Page Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">📝 System Logs</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-2">Real-time application logs, errors, and system events</p>
        </div>
        <button (click)="refreshLogs()" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-medium rounded-lg transition">
          🔄 Refresh
        </button>
      </div>

      <!-- Filters Section -->
      <div class="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <!-- Search -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
            <div class="relative">
              <input
                type="text"
                [value]="searchTerm()"
                (input)="onSearchChange($any($event.target).value)"
                placeholder="Search by message, endpoint..."
                class="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
              <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>

          <!-- Level Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Level</label>
            <select 
              [value]="filterLevel()"
              (change)="onFilterLevelChange($any($event.target).value)"
              class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:border-purple-500 focus:outline-none"
              title="Filter by log level">
              <option value="all">All Levels</option>
              <option value="INFO">Info</option>
              <option value="WARN">Warning</option>
              <option value="ERROR">Error</option>
              <option value="DEBUG">Debug</option>
              <option value="SUCCESS">Success</option>
            </select>
          </div>

          <!-- Source Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Source</label>
            <select 
              [value]="filterSource()"
              (change)="onFilterSourceChange($any($event.target).value)"
              class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:border-purple-500 focus:outline-none"
              title="Filter by source">
              <option value="all">All Sources</option>
              <option value="HTTP">HTTP</option>
              <option value="DATABASE">Database</option>
              <option value="AUTH">Auth</option>
              <option value="RBAC">RBAC</option>
              <option value="SYSTEM">System</option>
            </select>
          </div>

          <!-- Limit Rows -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Show</label>
            <select 
              [value]="rowLimit()"
              (change)="onRowLimitChange($any($event.target).value)"
              class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:border-purple-500 focus:outline-none"
              title="Limit rows displayed">
              <option value="25">Last 25</option>
              <option value="50">Last 50</option>
              <option value="100">Last 100</option>
              <option value="250">Last 250</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Mock Data Notice -->
      <div *ngIf="systemLogs().length === 0" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg p-4 mb-6 text-sm text-blue-800 dark:text-blue-300">
        <strong>ℹ️ Note:</strong> No system logs available yet. Perform actions in the system to generate logs.
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-12">
        <div class="flex items-center justify-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading() && filteredLogs().length === 0" class="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center">
        <div class="text-4xl mb-3">📋</div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">No logs found</h3>
        <p class="text-gray-600 dark:text-gray-400 mt-2">Try adjusting your filters or search criteria</p>
      </div>

      <!-- System Logs List -->
      <div *ngIf="!loading() && filteredLogs().length > 0" class="space-y-3">
        <div *ngFor="let log of filteredLogs()" class="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-purple-300 dark:hover:border-purple-500/50 transition">
          <div class="flex items-start gap-4">
            <!-- Level Icon -->
            <div class="text-xl flex-shrink-0">{{ getLevelIcon(log.level) }}</div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-4 mb-2 flex-wrap">
                <div>
                  <h3 class="font-semibold text-gray-900 dark:text-white">
                    {{ log.message }}
                  </h3>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ log.source }} · {{ log.timestamp }}</p>
                </div>
                <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                      [ngClass]="getLevelColor(log.level)">
                  {{ log.level }}
                </span>
              </div>

              <!-- Details Row -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div *ngIf="log.endpoint">
                  <span class="text-gray-500 dark:text-gray-400">Endpoint:</span>
                  <p class="text-gray-700 dark:text-gray-300 font-mono">{{ log.endpoint }}</p>
                </div>
                <div *ngIf="log.method">
                  <span class="text-gray-500 dark:text-gray-400">Method:</span>
                  <p class="text-gray-700 dark:text-gray-300">{{ log.method }}</p>
                </div>
                <div *ngIf="log.statusCode">
                  <span class="text-gray-500 dark:text-gray-400">Status:</span>
                  <p class="text-gray-700 dark:text-gray-300">{{ log.statusCode }}</p>
                </div>
                <div *ngIf="log.duration">
                  <span class="text-gray-500 dark:text-gray-400">Duration:</span>
                  <p class="text-gray-700 dark:text-gray-300">{{ log.duration }}</p>
                </div>
              </div>

              <!-- Details JSON -->
              <div *ngIf="log.details" class="mt-2 p-2 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700/30 text-xs font-mono text-gray-600 dark:text-gray-400 max-h-24 overflow-auto">
                {{ log.details }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Footer -->
      <div class="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
          <div class="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{{ (filteredLogs() | filterByLevel: 'SUCCESS').length }}</div>
          <div class="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Successful</div>
        </div>
        <div class="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
          <div class="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{{ (filteredLogs() | filterByLevel: 'INFO').length }}</div>
          <div class="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Info</div>
        </div>
        <div class="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
          <div class="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">{{ (filteredLogs() | filterByLevel: 'WARN').length }}</div>
          <div class="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Warnings</div>
        </div>
        <div class="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
          <div class="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">{{ (filteredLogs() | filterByLevel: 'ERROR').length }}</div>
          <div class="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Errors</div>
        </div>
        <div class="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
          <div class="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">{{ filteredLogs().length }}</div>
          <div class="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Logs</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    // Card styling
    .card {
      background: linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.8) 100%);
      border: 1px solid rgba(75, 85, 99, 0.4);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
    }

    .card-log {
      background: linear-gradient(135deg, rgba(31, 41, 55, 0.6) 0%, rgba(17, 24, 39, 0.6) 100%);
      border: 1px solid rgba(75, 85, 99, 0.3);
      border-radius: 12px;
      padding: 16px;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease-out;

      &:hover {
        border-color: rgba(100, 120, 140, 0.6);
        background: linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.8) 100%);
      }
    }

    // Input field styling
    .input-field {
      width: 100%;
      padding: 10px 12px 10px 40px;
      background: rgba(31, 41, 55, 0.6);
      border: 1px solid rgba(75, 85, 99, 0.4);
      border-radius: 8px;
      color: white;
      font-size: 14px;
      transition: all 0.3s ease-out;

      &::placeholder {
        color: rgb(107, 114, 128);
      }

      &:focus {
        outline: none;
        background: rgba(31, 41, 55, 0.8);
        border-color: rgba(147, 197, 253, 0.5);
        box-shadow: 0 0 12px rgba(59, 130, 246, 0.2);
      }

      option {
        background: rgb(31, 41, 55);
        color: white;
      }
    }

    // Button styling
    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: linear-gradient(135deg, rgba(75, 85, 99, 0.6), rgba(55, 65, 81, 0.6));
      color: white;
      border: 1px solid rgba(100, 120, 140, 0.4);
      font-weight: 600;
      font-size: 14px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease-out;

      &:hover {
        transform: translateY(-2px);
        border-color: rgba(147, 197, 253, 0.5);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
      }
    }

    // Stat Card
    .stat-card {
      background: linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.8) 100%);
      border: 1px solid rgba(75, 85, 99, 0.4);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      backdrop-filter: blur(10px);

      .stat-number {
        font-size: 28px;
        font-weight: 700;
        color: rgb(196, 181, 253);
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 12px;
        font-weight: 500;
        color: rgb(156, 163, 175);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    // Animation
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }
  `]
})
export class SystemLogsComponent implements OnInit {
  private http = inject(HttpClient);

  readonly systemLogs = signal<SystemLog[]>([]);
  readonly filteredLogs = signal<SystemLog[]>([]);
  readonly loading = signal(true);
  readonly searchTerm = signal('');
  readonly filterLevel = signal('all');
  readonly filterSource = signal('all');
  readonly rowLimit = signal('50');
  readonly error = signal<string | null>(null);
  readonly usingMockData = signal(false);

  ngOnInit(): void {
    this.loadSystemLogs();
  }

  loadSystemLogs(): void {
    this.loading.set(true);
    this.error.set(null);
    this.usingMockData.set(false);
    const days = this.filterLevel() === 'all' ? '7' : '30';
    const limit = this.rowLimit() || '50';
    
    console.log(`[SystemLogs] Loading logs from API... (days=${days}, limit=${limit})`);
    
    this.http.get<any>(`/api/users/system-logs?days=${days}&limit=${limit}`)
      .subscribe({
        next: (response) => {
          console.log('[SystemLogs] API response received:', response);
          if (response.systemLogs && Array.isArray(response.systemLogs)) {
            console.log(`[SystemLogs] Successfully loaded ${response.systemLogs.length} logs`);
            this.systemLogs.set(response.systemLogs);
            this.filteredLogs.set(response.systemLogs);
          } else {
            this.error.set('Invalid response from server');
            console.error('[SystemLogs] Invalid response structure:', response);
          }
          this.loading.set(false);
        },
        error: (error) => {
          console.error('[SystemLogs] API Error:', error);
          
          let errorMessage = 'Failed to load system logs';
          if (error.status === 401) {
            errorMessage = 'Unauthorized: Your session may have expired. Please log in again.';
          } else if (error.status === 403) {
            errorMessage = 'Forbidden: You do not have permission to view system logs.';
          } else if (error.status === 0) {
            errorMessage = 'Unable to connect to server. Is the backend running?';
          } else if (error.error?.error) {
            errorMessage = error.error.error;
          }
          
          this.error.set(errorMessage);
          this.loading.set(false);
          
          console.warn(`[SystemLogs] Skipping mock data fallback. Actual error: ${errorMessage}`);
        }
      });
  }

  generateMockLogs(): SystemLog[] {
    const endpoints = [
      'GET /api/users',
      'POST /api/tenants',
      'GET /api/roles',
      'PUT /api/users/123',
      'DELETE /api/users/456',
      'GET /api/permissions',
      'POST /api/roles/:id/permissions'
    ];

    const messages = [
      'Database connected successfully',
      'User authentication successful',
      'Permission check passed',
      'Tenant created successfully',
      'Role updated',
      'Database query executed',
      'Request processed',
      'Middleware validation passed'
    ];

    const sources: SystemLog['source'][] = ['HTTP', 'DATABASE', 'AUTH', 'RBAC', 'SYSTEM'];
    const levels: SystemLog['level'][] = ['INFO', 'WARN', 'ERROR', 'DEBUG', 'SUCCESS'];

    const logs: SystemLog[] = [];
    const now = new Date();

    for (let i = 0; i < 100; i++) {
      const timestamp = new Date(now.getTime() - i * 5000);
      logs.push({
        id: `log-${i}`,
        timestamp: timestamp.toISOString(),
        level: levels[Math.floor(Math.random() * levels.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
        method: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'][Math.floor(Math.random() * 5)],
        statusCode: [200, 201, 400, 401, 403, 404, 500][Math.floor(Math.random() * 7)],
        duration: `${Math.random() * 100 + 5}ms`,
        source: sources[Math.floor(Math.random() * sources.length)],
        details: JSON.stringify({
          userId: `user-${Math.floor(Math.random() * 100)}`,
          action: ['READ', 'CREATE', 'UPDATE', 'DELETE'][Math.floor(Math.random() * 4)]
        })
      });
    }

    return logs;
  }

  refreshLogs(): void {
    this.loadSystemLogs();
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterLevelChange(value: string): void {
    this.filterLevel.set(value);
    this.applyFilters();
  }

  onFilterSourceChange(value: string): void {
    this.filterSource.set(value);
    this.applyFilters();
  }

  onRowLimitChange(value: string): void {
    this.rowLimit.set(value);
    this.applyFilters();
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.onSearch();
  }

  applyFilters(): void {
    let filtered = this.systemLogs();

    // Search filter
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(log =>
        (log.message && log.message.toLowerCase().includes(term)) ||
        (log.endpoint && log.endpoint.toLowerCase().includes(term)) ||
        (log.details && log.details.toLowerCase().includes(term))
      );
    }

    // Level filter
    if (this.filterLevel() !== 'all') {
      filtered = filtered.filter(log => log.level === this.filterLevel());
    }

    // Source filter
    if (this.filterSource() !== 'all') {
      filtered = filtered.filter(log => log.source === this.filterSource());
    }

    // Limit rows
    const limit = parseInt(this.rowLimit()) || 50;
    filtered = filtered.slice(0, limit);

    this.filteredLogs.set(filtered);
  }

  getLevelIcon(level: string): string {
    switch (level) {
      case 'SUCCESS': return '✅';
      case 'INFO': return 'ℹ️';
      case 'WARN': return '⚠️';
      case 'ERROR': return '❌';
      case 'DEBUG': return '🔍';
      default: return '📝';
    }
  }

  getLevelColor(level: string): string {
    switch (level) {
      case 'SUCCESS':
        return 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400';
      case 'INFO':
        return 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-400';
      case 'WARN':
        return 'bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400';
      case 'ERROR':
        return 'bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400';
      case 'DEBUG':
        return 'bg-cyan-100 dark:bg-cyan-900/30 border border-cyan-200 dark:border-cyan-700 text-cyan-700 dark:text-cyan-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-400';
    }
  }
}
