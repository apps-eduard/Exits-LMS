import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface MetricCard {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: 'blue' | 'purple' | 'green' | 'orange';
  subtext?: string;
}

interface RecentActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  icon: string;
  amount?: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  color: 'blue' | 'purple' | 'green';
  link: string;
  badge?: string;
}

interface ChartDataPoint {
  label: string;
  value: number;
  color: string;
}

interface TopCustomer {
  name: string;
  initials: string;
  color: string;
  loans: number;
  portfolio: string;
  status: 'perfect' | 'good' | 'warning';
  statusLabel: string;
}

@Component({
  selector: 'app-tenant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class TenantDashboardComponent {
  readonly metrics = signal<MetricCard[]>([
    {
      title: 'Active Loans',
      value: '1,245',
      change: '+12.5%',
      changeType: 'increase',
      icon: '📊',
      color: 'blue',
      subtext: 'From last month'
    },
    {
      title: 'Pawn Items',
      value: '856',
      change: '+18.3%',
      changeType: 'increase',
      icon: '�',
      color: 'purple',
      subtext: 'Active pawns'
    },
    {
      title: 'BNPL Orders',
      value: '342',
      change: '+9.6%',
      changeType: 'increase',
      icon: '🛒',
      color: 'green',
      subtext: 'This month'
    },
    {
      title: 'Portfolio',
      value: '₱2.5M',
      change: '+8.2%',
      changeType: 'increase',
      icon: '💰',
      color: 'orange',
      subtext: 'Growing steadily'
    }
  ]);

  readonly monthlyData = signal<ChartDataPoint[]>([
    { label: 'Jan', value: 65, color: 'from-blue-400' },
    { label: 'Feb', value: 72, color: 'from-blue-500' },
    { label: 'Mar', value: 68, color: 'from-blue-400' },
    { label: 'Apr', value: 80, color: 'from-purple-500' },
    { label: 'May', value: 85, color: 'from-purple-600' },
    { label: 'Jun', value: 92, color: 'from-purple-600' }
  ]);

  readonly loanStatusData = signal<ChartDataPoint[]>([
    { label: 'Active', value: 892, color: 'bg-green-500' },
    { label: 'Pending', value: 156, color: 'bg-yellow-500' },
    { label: 'Completed', value: 197, color: 'bg-blue-500' }
  ]);

  readonly recentActivities = signal<RecentActivity[]>([
    {
      id: '1',
      title: 'Loan Disbursed',
      description: 'Loan #LN-2025-001 disbursed to Maria Santos',
      timestamp: '2 hours ago',
      status: 'completed',
      icon: '💸',
      amount: '₱50,000'
    },
    {
      id: '2',
      title: 'Payment Received',
      description: 'Loan #LN-2025-012 - Payment received from John Doe',
      timestamp: '4 hours ago',
      status: 'completed',
      icon: '💳',
      amount: '₱5,000'
    },
    {
      id: '3',
      title: 'Approval Requested',
      description: 'Loan #LN-2025-045 - Awaiting your approval',
      timestamp: '6 hours ago',
      status: 'pending',
      icon: '📋',
      amount: '₱75,000'
    },
    {
      id: '4',
      title: 'Payment Overdue',
      description: 'Loan #LN-2025-003 - Payment overdue by 3 days',
      timestamp: '1 day ago',
      status: 'failed',
      icon: '⚠️',
      amount: '₱8,500'
    }
  ]);

  readonly quickActions = signal<QuickAction[]>([
    {
      title: 'New Money Loan',
      description: 'Create a new loan application',
      icon: '➕',
      color: 'blue',
      link: '/tenant/money-loan/new',
      badge: 'Money Loan'
    },
    {
      title: 'Pawn Item',
      description: 'Create new pawn transaction',
      icon: '�',
      color: 'purple',
      link: '/tenant/pawnshop/new'
    },
    {
      title: 'BNPL Order',
      description: 'Create BNPL transaction',
      icon: '�',
      color: 'green',
      link: '/tenant/bnpl/new'
    }
  ]);

  readonly topCustomers = signal<TopCustomer[]>([
    {
      name: 'Maria Santos',
      initials: 'MS',
      color: 'blue',
      loans: 5,
      portfolio: '₱85,000',
      status: 'perfect',
      statusLabel: 'Perfect Payment'
    },
    {
      name: 'Juan Cruz',
      initials: 'JC',
      color: 'purple',
      loans: 3,
      portfolio: '₱62,500',
      status: 'perfect',
      statusLabel: 'Perfect Payment'
    },
    {
      name: 'Angela Rodriguez',
      initials: 'AR',
      color: 'green',
      loans: 2,
      portfolio: '₱45,000',
      status: 'warning',
      statusLabel: '1 Day Late'
    }
  ]);

  getMaxValue(): number {
    return Math.max(...this.monthlyData().map(d => d.value));
  }

  getChartHeight(value: number): number {
    const max = this.getMaxValue();
    return (value / max) * 100;
  }

  getTotalLoans(): number {
    return this.loanStatusData().reduce((sum, item) => sum + item.value, 0);
  }

  getPercentage(value: number): number {
    return Math.round((value / this.getTotalLoans()) * 100);
  }
}
