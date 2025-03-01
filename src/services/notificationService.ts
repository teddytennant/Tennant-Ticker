import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';
import { User } from './authService';

const API_URL = import.meta.env.VITE_API_URL;

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  priority: NotificationPriority;
  status: NotificationStatus;
  data?: any;
  actions?: NotificationAction[];
  expiresAt?: Date;
  userId: string;
}

export type NotificationType =
  | 'price_alert'
  | 'news'
  | 'portfolio'
  | 'trade'
  | 'system'
  | 'security'
  | 'subscription'
  | 'watchlist'
  | 'earnings'
  | 'dividend';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type NotificationStatus = 'unread' | 'read' | 'archived' | 'deleted';

export interface NotificationAction {
  label: string;
  action: string;
  url?: string;
  data?: any;
}

export interface PriceAlert {
  symbol: string;
  condition: 'above' | 'below' | 'percent_change';
  value: number;
  triggered: boolean;
  createdAt: Date;
  lastTriggered?: Date;
  frequency: 'once' | 'always';
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  priceAlerts: boolean;
  newsAlerts: boolean;
  portfolioAlerts: boolean;
  tradeAlerts: boolean;
  systemAlerts: boolean;
  doNotDisturb: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  alertSound: boolean;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  priceAlerts: PriceAlert[];
  preferences: NotificationPreferences;
  isConnected: boolean;
  error: string | null;
}

class NotificationService {
  private socket: Socket | null = null;
  private state = new BehaviorSubject<NotificationState>({
    notifications: [],
    unreadCount: 0,
    priceAlerts: [],
    preferences: {
      email: true,
      push: true,
      inApp: true,
      priceAlerts: true,
      newsAlerts: true,
      portfolioAlerts: true,
      tradeAlerts: true,
      systemAlerts: true,
      doNotDisturb: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      alertSound: true
    },
    isConnected: false,
    error: null
  });

  constructor() {
    this.initializeNotifications();
    this.requestNotificationPermission();
  }

  private async initializeNotifications() {
    try {
      // Initialize WebSocket connection
      this.socket = io(`${API_URL}/notifications`, {
        transports: ['websocket'],
        autoConnect: false
      });

      this.setupSocketListeners();
      await this.loadNotificationPreferences();
      await this.loadPriceAlerts();
      await this.loadNotificationHistory();

      this.socket.connect();
    } catch (error) {
      console.error('Error initializing notifications:', error);
      this.setError('Failed to initialize notifications');
    }
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.setState({ isConnected: true, error: null });
    });

    this.socket.on('disconnect', () => {
      this.setState({ isConnected: false });
    });

    this.socket.on('notification', (notification: Notification) => {
      this.handleNewNotification(notification);
    });

    this.socket.on('price_alert', (alert: PriceAlert) => {
      this.handlePriceAlert(alert);
    });

    this.socket.on('error', (error: Error) => {
      console.error('Socket error:', error);
      this.setError('Connection error occurred');
    });
  }

  private async requestNotificationPermission() {
    try {
      if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.registerServiceWorker();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }

  private async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/notification-worker.js');
      console.log('ServiceWorker registered:', registration);
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
    }
  }

  private async loadNotificationPreferences() {
    try {
      const response = await fetch(`${API_URL}/notifications/preferences`, {
        credentials: 'include'
      });
      const preferences = await response.json();
      this.setState({ preferences });
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  }

  private async loadPriceAlerts() {
    try {
      const response = await fetch(`${API_URL}/notifications/price-alerts`, {
        credentials: 'include'
      });
      const priceAlerts = await response.json();
      this.setState({ priceAlerts });
    } catch (error) {
      console.error('Error loading price alerts:', error);
    }
  }

  private async loadNotificationHistory() {
    try {
      const response = await fetch(`${API_URL}/notifications/history`, {
        credentials: 'include'
      });
      const { notifications, unreadCount } = await response.json();
      this.setState({ notifications, unreadCount });
    } catch (error) {
      console.error('Error loading notification history:', error);
    }
  }

  private handleNewNotification(notification: Notification) {
    const { notifications, unreadCount } = this.state.value;
    
    // Update state with new notification
    this.setState({
      notifications: [notification, ...notifications],
      unreadCount: unreadCount + 1
    });

    // Show browser notification if enabled
    this.showBrowserNotification(notification);

    // Play sound if enabled
    if (this.state.value.preferences.alertSound) {
      this.playNotificationSound(notification.priority);
    }
  }

  private handlePriceAlert(alert: PriceAlert) {
    const { priceAlerts } = this.state.value;
    const updatedAlerts = priceAlerts.map(a => 
      a.symbol === alert.symbol ? { ...a, ...alert } : a
    );

    this.setState({ priceAlerts: updatedAlerts });

    // Create notification for triggered alert
    if (alert.triggered) {
      const notification: Notification = {
        id: crypto.randomUUID(),
        type: 'price_alert',
        title: `Price Alert: ${alert.symbol}`,
        message: this.formatPriceAlertMessage(alert),
        timestamp: new Date(),
        priority: 'high',
        status: 'unread',
        data: alert,
        userId: this.getCurrentUserId()
      };

      this.handleNewNotification(notification);
    }
  }

  private formatPriceAlertMessage(alert: PriceAlert): string {
    const condition = alert.condition === 'percent_change' 
      ? `${alert.value}% change`
      : `${alert.condition} ${alert.value}`;
    return `${alert.symbol} has triggered your price alert: ${condition}`;
  }

  private showBrowserNotification(notification: Notification) {
    if (!this.shouldShowNotification(notification)) return;

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.png',
        tag: notification.id,
        data: notification
      });
    }
  }

  private shouldShowNotification(notification: Notification): boolean {
    const { preferences } = this.state.value;
    if (!preferences.inApp) return false;

    // Check do not disturb settings
    if (preferences.doNotDisturb.enabled) {
      const now = new Date();
      const [startHour, startMinute] = preferences.doNotDisturb.startTime.split(':').map(Number);
      const [endHour, endMinute] = preferences.doNotDisturb.endTime.split(':').map(Number);
      
      const start = new Date(now);
      start.setHours(startHour, startMinute, 0);
      
      const end = new Date(now);
      end.setHours(endHour, endMinute, 0);

      if (now >= start && now <= end) return false;
    }

    // Check notification type preferences
    switch (notification.type) {
      case 'price_alert':
        return preferences.priceAlerts;
      case 'news':
        return preferences.newsAlerts;
      case 'portfolio':
        return preferences.portfolioAlerts;
      case 'trade':
        return preferences.tradeAlerts;
      case 'system':
        return preferences.systemAlerts;
      default:
        return true;
    }
  }

  private playNotificationSound(priority: NotificationPriority) {
    const sound = new Audio(this.getSoundForPriority(priority));
    sound.play().catch(console.error);
  }

  private getSoundForPriority(priority: NotificationPriority): string {
    switch (priority) {
      case 'urgent':
        return '/sounds/urgent.mp3';
      case 'high':
        return '/sounds/high.mp3';
      case 'medium':
        return '/sounds/medium.mp3';
      default:
        return '/sounds/low.mp3';
    }
  }

  // Public API
  async createPriceAlert(alert: Omit<PriceAlert, 'triggered' | 'createdAt'>): Promise<PriceAlert> {
    try {
      const response = await fetch(`${API_URL}/notifications/price-alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(alert)
      });

      const newAlert = await response.json();
      const { priceAlerts } = this.state.value;
      this.setState({ priceAlerts: [...priceAlerts, newAlert] });
      return newAlert;
    } catch (error) {
      console.error('Error creating price alert:', error);
      throw error;
    }
  }

  async updatePriceAlert(alertId: string, updates: Partial<PriceAlert>): Promise<PriceAlert> {
    try {
      const response = await fetch(`${API_URL}/notifications/price-alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      });

      const updatedAlert = await response.json();
      const { priceAlerts } = this.state.value;
      this.setState({
        priceAlerts: priceAlerts.map(alert => 
          alert.symbol === updatedAlert.symbol ? updatedAlert : alert
        )
      });
      return updatedAlert;
    } catch (error) {
      console.error('Error updating price alert:', error);
      throw error;
    }
  }

  async deletePriceAlert(alertId: string): Promise<void> {
    try {
      await fetch(`${API_URL}/notifications/price-alerts/${alertId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const { priceAlerts } = this.state.value;
      this.setState({
        priceAlerts: priceAlerts.filter(alert => alert.symbol !== alertId)
      });
    } catch (error) {
      console.error('Error deleting price alert:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'POST',
        credentials: 'include'
      });

      const { notifications, unreadCount } = this.state.value;
      this.setState({
        notifications: notifications.map(n =>
          n.id === notificationId ? { ...n, status: 'read' } : n
        ),
        unreadCount: Math.max(0, unreadCount - 1)
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      await fetch(`${API_URL}/notifications/mark-all-read`, {
        method: 'POST',
        credentials: 'include'
      });

      const { notifications } = this.state.value;
      this.setState({
        notifications: notifications.map(n => ({ ...n, status: 'read' })),
        unreadCount: 0
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async updatePreferences(updates: Partial<NotificationPreferences>): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/notifications/preferences`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      });

      const updatedPreferences = await response.json();
      this.setState({ preferences: updatedPreferences });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  async clearNotifications(): Promise<void> {
    try {
      await fetch(`${API_URL}/notifications/clear`, {
        method: 'POST',
        credentials: 'include'
      });

      this.setState({
        notifications: [],
        unreadCount: 0
      });
    } catch (error) {
      console.error('Error clearing notifications:', error);
      throw error;
    }
  }

  // State management
  private setState(partialState: Partial<NotificationState>) {
    this.state.next({
      ...this.state.value,
      ...partialState
    });
  }

  private setError(error: string) {
    this.setState({ error });
  }

  getState() {
    return this.state.asObservable();
  }

  private getCurrentUserId(): string {
    // This should be implemented to get the current user's ID from your auth service
    return 'current-user-id';
  }

  // Cleanup
  destroy() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const notificationService = new NotificationService(); 