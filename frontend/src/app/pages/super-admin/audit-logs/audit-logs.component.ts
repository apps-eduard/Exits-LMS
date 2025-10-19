import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReplacePipe, FilterByStatusPipe } from './audit-logs.pipes';

interface AuditLog {
  id: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  status: 'success' | 'failed' | 'pending';
  ip_address: string;
  timestamp: string;
}

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, ReplacePipe, FilterByStatusPipe],
  templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.scss'
})
export class AuditLogsComponent implements OnInit {
  readonly auditLogs = signal<AuditLog[]>([]);
  readonly filteredLogs = signal<AuditLog[]>([]);
  readonly loading = signal(true);
  readonly searchTerm = signal('');
  readonly filterAction = signal('all');
  readonly filterStatus = signal('all');
  readonly filterDateRange = signal('today');

  ngOnInit(): void {
    this.loadAuditLogs();
  }

  loadAuditLogs(): void {
    this.loading.set(true);
    // Mock data - replace with actual API call
    setTimeout(() => {
      const mockLogs: AuditLog[] = [
        {
          id: '1',
          user: 'admin@platform.com',
          action: 'CREATE_TENANT',
          resource: 'Tenant',
          details: 'Created new tenant: Tech Corp Inc',
          status: 'success',
          ip_address: '192.168.1.1',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString()
        },
        {
          id: '2',
          user: 'admin@platform.com',
          action: 'UPDATE_TENANT',
          resource: 'Tenant',
          details: 'Updated subscription plan to Premium',
          status: 'success',
          ip_address: '192.168.1.1',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString()
        },
        {
          id: '3',
          user: 'viewer@platform.com',
          action: 'VIEW_REPORT',
          resource: 'Report',
          details: 'Accessed platform analytics',
          status: 'success',
          ip_address: '192.168.1.50',
          timestamp: new Date(Date.now() - 30 * 60000).toISOString()
        },
        {
          id: '4',
          user: 'admin@platform.com',
          action: 'DELETE_USER',
          resource: 'User',
          details: 'Deleted user: test@example.com',
          status: 'success',
          ip_address: '192.168.1.1',
          timestamp: new Date(Date.now() - 60 * 60000).toISOString()
        },
        {
          id: '5',
          user: 'admin@platform.com',
          action: 'LOGIN_FAILED',
          resource: 'Authentication',
          details: 'Failed login attempt',
          status: 'failed',
          ip_address: '192.168.1.100',
          timestamp: new Date(Date.now() - 2 * 3600000).toISOString()
        }
      ];

      this.auditLogs.set(mockLogs);
      this.filteredLogs.set(mockLogs);
      this.loading.set(false);
    }, 1000);
  }

  onSearch(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.auditLogs();

    // Search filter
    if (this.searchTerm()) {
      filtered = filtered.filter(log =>
        log.user.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        log.action.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        log.details.toLowerCase().includes(this.searchTerm().toLowerCase())
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
