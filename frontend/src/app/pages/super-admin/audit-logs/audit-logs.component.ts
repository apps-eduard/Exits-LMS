import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ReplacePipe, FilterByStatusPipe } from './audit-logs.pipes';

interface AuditLog {
  id: string;
  user_email?: string;
  first_name?: string;
  last_name?: string;
  action: string;
  resource: string;
  details?: string;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  status?: 'success' | 'failed' | 'pending';
}

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, ReplacePipe, FilterByStatusPipe],
  templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.scss'
})
export class AuditLogsComponent implements OnInit {
  private http = inject(HttpClient);

  readonly auditLogs = signal<AuditLog[]>([]);
  readonly filteredLogs = signal<AuditLog[]>([]);
  readonly loading = signal(true);
  readonly searchTerm = signal('');
  readonly filterAction = signal('all');
  readonly filterStatus = signal('all');
  readonly filterDateRange = signal('30');

  ngOnInit(): void {
    this.loadAuditLogs();
  }

  loadAuditLogs(): void {
    this.loading.set(true);
    const days = this.filterDateRange() || '30';
    
    this.http.get<any>(`/api/users/audit?days=${days}`)
      .subscribe({
        next: (response) => {
          if (response.auditLogs && Array.isArray(response.auditLogs)) {
            // Transform API response to component interface
            const transformedLogs = response.auditLogs.map((log: any) => ({
              id: log.id,
              user_email: log.user_email || 'System',
              first_name: log.first_name,
              last_name: log.last_name,
              action: log.action,
              resource: log.resource,
              details: log.details ? (typeof log.details === 'string' ? log.details : JSON.stringify(log.details)) : '',
              resource_id: log.resource_id,
              ip_address: log.ip_address || 'N/A',
              user_agent: log.user_agent,
              created_at: log.created_at,
              status: 'success' as const
            }));
            
            this.auditLogs.set(transformedLogs);
            this.filteredLogs.set(transformedLogs);
          }
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Failed to load audit logs:', error);
          this.loading.set(false);
        }
      });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterActionChange(value: string): void {
    this.filterAction.set(value);
    this.applyFilters();
  }

  onFilterStatusChange(value: string): void {
    this.filterStatus.set(value);
    this.applyFilters();
  }

  onFilterDateRangeChange(value: string): void {
    this.filterDateRange.set(value);
    this.loadAuditLogs();
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.onSearch();
  }

  applyFilters(): void {
    let filtered = this.auditLogs();

    // Search filter
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(log =>
        (log.user_email && log.user_email.toLowerCase().includes(term)) ||
        (log.action && log.action.toLowerCase().includes(term)) ||
        (log.details && log.details.toLowerCase().includes(term)) ||
        (log.resource && log.resource.toLowerCase().includes(term))
      );
    }

    // Action filter
    if (this.filterAction() !== 'all') {
      filtered = filtered.filter(log => log.action === this.filterAction());
    }

    // Status filter
    if (this.filterStatus() !== 'all') {
      filtered = filtered.filter(log => log.status === this.filterStatus());
    }

    this.filteredLogs.set(filtered);
  }

  getActionColor(action: string): string {
    if (action.includes('CREATE')) return 'bg-green-900/30 text-green-400';
    if (action.includes('UPDATE')) return 'bg-blue-900/30 text-blue-400';
    if (action.includes('DELETE')) return 'bg-red-900/30 text-red-400';
    if (action.includes('LOGIN')) return 'bg-purple-900/30 text-purple-400';
    if (action.includes('VIEW')) return 'bg-cyan-900/30 text-cyan-400';
    return 'bg-gray-700/30 text-gray-400';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'success':
        return 'bg-green-900/30 border border-green-700 text-green-400';
      case 'failed':
        return 'bg-red-900/30 border border-red-700 text-red-400';
      case 'pending':
        return 'bg-yellow-900/30 border border-yellow-700 text-yellow-400';
      default:
        return 'bg-gray-700/30 border border-gray-600 text-gray-400';
    }
  }

  getResourceIcon(resource: string): string {
    switch (resource) {
      case 'Tenant':
        return '🏢';
      case 'User':
        return '👤';
      case 'Report':
        return '📊';
      case 'Authentication':
        return '🔐';
      default:
        return '📝';
    }
  }

  exportLogs(): void {
    // TODO: Implement CSV export
    console.log('Exporting logs...');
  }
}
