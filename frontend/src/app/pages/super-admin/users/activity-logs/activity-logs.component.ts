import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface ActivityLog {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  description: string;
  entity_type: string;
  entity_id: string;
  details: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

@Component({
  selector: 'app-activity-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './activity-logs.component.html',
  styleUrls: ['./activity-logs.component.scss']
})
export class ActivityLogsComponent implements OnInit {
  readonly activities = signal<ActivityLog[]>([]);
  readonly loading = signal(false);
  readonly searchUser = signal('');
  readonly filterAction = signal('all');
  readonly filterEntity = signal('all');
  readonly dateRange = signal('7days');

  private apiUrl = `${environment.apiUrl}/users/activity`;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadActivities();
  }

  loadActivities(): void {
    this.loading.set(true);
    
    const params: any = {};
    if (this.searchUser()) params.user = this.searchUser();
    if (this.filterAction() !== 'all') params.action = this.filterAction();
    if (this.filterEntity() !== 'all') params.entity = this.filterEntity();
    if (this.dateRange() !== 'all') params.days = this.dateRange().replace('days', '');

    this.http.get<any>(this.apiUrl, { params }).subscribe({
      next: (response) => {
        if (response.success) {
          this.activities.set(response.activities || []);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading activity logs:', error);
        this.loading.set(false);
      }
    });
  }

  onFilter(): void {
    this.loadActivities();
  }

  clearFilters(): void {
    this.searchUser.set('');
    this.filterAction.set('all');
    this.filterEntity.set('all');
    this.dateRange.set('7days');
    this.loadActivities();
  }

  getActionIcon(action: string): string {
    switch (action.toUpperCase()) {
      case 'LOGIN': return '🔓';
      case 'LOGOUT': return '🔒';
      case 'CREATE': return '➕';
      case 'UPDATE': return '✏️';
      case 'DELETE': return '🗑️';
      case 'EXPORT': return '📥';
      case 'IMPORT': return '📤';
      default: return '📝';
    }
  }

  getActionColor(action: string): string {
    switch (action.toUpperCase()) {
      case 'LOGIN': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'LOGOUT': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'CREATE': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'UPDATE': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      case 'DELETE': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }

  formatTimeAgo(date: string): string {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  viewDetails(activity: ActivityLog): void {
    console.log('Activity details:', activity);
    // TODO: Implement details modal
  }
}
