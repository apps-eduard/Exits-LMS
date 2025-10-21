import { Injectable, signal } from '@angular/core';

export interface ComingSoonFeature {
  title: string;
  description: string;
  icon: string;
  plannedFeatures: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ComingSoonService {
  readonly isModalOpen = signal(false);
  readonly currentFeature = signal<ComingSoonFeature | null>(null);

  // Feature definitions
  private readonly features: Record<string, ComingSoonFeature> = {
    'performance-metrics': {
      title: 'Performance Metrics',
      description: 'Monitor system performance, API response times, database metrics, and resource utilization in real-time.',
      icon: '⚡',
      plannedFeatures: [
        'Real-time API response time monitoring',
        'Database query performance tracking',
        'CPU and memory usage charts',
        'Request rate analytics',
        'Custom metric dashboards'
      ]
    },
    'error-logs': {
      title: 'Error Logs',
      description: 'View and analyze application errors, exceptions, and system issues with advanced filtering and search.',
      icon: '🐛',
      plannedFeatures: [
        'Error log aggregation and search',
        'Stack trace visualization',
        'Error frequency analytics',
        'Automatic error categorization',
        'Email alerts for critical errors'
      ]
    },
    'background-jobs': {
      title: 'Background Jobs',
      description: 'Manage and monitor scheduled tasks, automated processes, and background job queues.',
      icon: '⚙️',
      plannedFeatures: [
        'Job scheduling and management',
        'Queue monitoring and control',
        'Job execution history',
        'Failed job retry mechanisms',
        'Custom job creation'
      ]
    },
    'notifications': {
      title: 'Notifications',
      description: 'Centralized notification management for system alerts, updates, and announcements.',
      icon: '📬',
      plannedFeatures: [
        'Push notification system',
        'Email and SMS integration',
        'Notification templates',
        'User notification preferences',
        'Scheduled announcements'
      ]
    },
    'alerts': {
      title: 'Alerts',
      description: 'Configure and manage system alerts, threshold monitoring, and automated notifications.',
      icon: '🔔',
      plannedFeatures: [
        'Custom alert rules',
        'Threshold-based monitoring',
        'Alert escalation workflows',
        'Multi-channel notifications',
        'Alert history and analytics'
      ]
    },
    'announcements': {
      title: 'Announcements',
      description: 'Create and broadcast important announcements to users and tenants across the platform.',
      icon: '📨',
      plannedFeatures: [
        'Rich text announcement editor',
        'Targeted user groups',
        'Scheduled publishing',
        'Read receipts tracking',
        'Announcement templates'
      ]
    },
    'subscriptions': {
      title: 'Subscriptions',
      description: 'Manage tenant subscriptions, billing cycles, and subscription plans.',
      icon: '💳',
      plannedFeatures: [
        'Subscription lifecycle management',
        'Automated billing processes',
        'Usage-based pricing',
        'Subscription analytics',
        'Payment gateway integration'
      ]
    },
    'subscription-plans': {
      title: 'Subscription Plans',
      description: 'Create and manage subscription tiers, pricing models, and feature sets.',
      icon: '📦',
      plannedFeatures: [
        'Tiered pricing plans',
        'Feature-based access control',
        'Custom plan creation',
        'Trial period management',
        'Plan comparison tools'
      ]
    },
    'invoices': {
      title: 'Invoices',
      description: 'Generate, manage, and track invoices for tenant subscriptions and services.',
      icon: '🧾',
      plannedFeatures: [
        'Automated invoice generation',
        'PDF invoice download',
        'Payment status tracking',
        'Invoice templates',
        'Tax calculation support'
      ]
    },
    'payments': {
      title: 'Payments',
      description: 'Process and track subscription payments, refunds, and payment history.',
      icon: '💵',
      plannedFeatures: [
        'Multiple payment gateway support',
        'Payment reconciliation',
        'Refund processing',
        'Payment analytics',
        'Failed payment recovery'
      ]
    },
    'system-analytics': {
      title: 'System Analytics',
      description: 'Comprehensive analytics dashboard for platform-wide insights and trends.',
      icon: '📈',
      plannedFeatures: [
        'User activity analytics',
        'Tenant growth metrics',
        'Revenue analytics',
        'Usage trends visualization',
        'Custom report builder'
      ]
    },
    'revenue-reports': {
      title: 'Revenue Reports',
      description: 'Detailed revenue tracking, forecasting, and financial reporting.',
      icon: '💰',
      plannedFeatures: [
        'Monthly revenue reports',
        'Revenue by tenant analysis',
        'Revenue forecasting',
        'Payment method breakdown',
        'Export to Excel/PDF'
      ]
    },
    'user-activity-reports': {
      title: 'User Activity Reports',
      description: 'Track user engagement, login patterns, and activity across the platform.',
      icon: '👥',
      plannedFeatures: [
        'Active user metrics',
        'Login frequency analytics',
        'Feature usage tracking',
        'User retention analysis',
        'Activity heatmaps'
      ]
    },
    'tenant-usage-reports': {
      title: 'Tenant Usage Reports',
      description: 'Monitor tenant resource consumption, feature adoption, and usage patterns.',
      icon: '🏢',
      plannedFeatures: [
        'Resource usage tracking',
        'Feature adoption metrics',
        'Storage and bandwidth monitoring',
        'API usage analytics',
        'Usage-based billing reports'
      ]
    }
  };

  showComingSoon(featureKey: string) {
    const feature = this.features[featureKey];
    if (feature) {
      this.currentFeature.set(feature);
      this.isModalOpen.set(true);
    } else {
      // Default coming soon message
      this.currentFeature.set({
        title: 'Coming Soon',
        description: 'This feature is currently under development and will be available in a future release.',
        icon: '🚧',
        plannedFeatures: []
      });
      this.isModalOpen.set(true);
    }
  }

  closeModal() {
    this.isModalOpen.set(false);
    setTimeout(() => this.currentFeature.set(null), 300);
  }
}
