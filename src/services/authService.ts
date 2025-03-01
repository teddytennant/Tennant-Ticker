import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject } from 'rxjs';

const API_URL = import.meta.env.VITE_API_URL;
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  subscription: SubscriptionTier;
  preferences: UserPreferences;
  createdAt: Date;
  lastLogin: Date;
}

export type UserRole = 'admin' | 'premium' | 'basic' | 'guest';

export type Permission =
  | 'view_market_data'
  | 'view_portfolio'
  | 'trade'
  | 'view_analytics'
  | 'view_news'
  | 'manage_users'
  | 'manage_settings'
  | 'access_api';

export type SubscriptionTier = 'free' | 'plus' | 'pro';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    priceAlerts: boolean;
    newsAlerts: boolean;
    portfolioAlerts: boolean;
  };
  defaultView: 'portfolio' | 'market' | 'news';
  watchlist: string[];
  chartPreferences: {
    timeframe: string;
    indicators: string[];
    colors: {
      up: string;
      down: string;
      neutral: string;
    };
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

class AuthService {
  private state = new BehaviorSubject<AuthState>({
    user: null,
    token: localStorage.getItem(AUTH_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  private refreshTokenTimeout: number | null = null;

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        const user = await this.validateAndRefreshToken(token);
        if (user) {
          this.setAuthState({ user, isAuthenticated: true, isLoading: false });
        } else {
          this.clearAuth();
        }
      } else {
        this.setAuthState({ isLoading: false });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      this.clearAuth();
    }
  }

  async login(email: string, password: string): Promise<User> {
    try {
      this.setAuthState({ isLoading: true, error: null });

      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      const { user, token, refreshToken } = response.data;

      this.setTokens(token, refreshToken);
      this.setAuthState({
        user,
        token,
        refreshToken,
        isAuthenticated: true,
        isLoading: false
      });

      this.startRefreshTokenTimer();
      return user;
    } catch (error: any) {
      this.setAuthState({
        isLoading: false,
        error: error.response?.data?.message || 'Login failed'
      });
      throw error;
    }
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<User> {
    try {
      this.setAuthState({ isLoading: true, error: null });

      const response = await axios.post(`${API_URL}/auth/register`, userData);
      const { user, token, refreshToken } = response.data;

      this.setTokens(token, refreshToken);
      this.setAuthState({
        user,
        token,
        refreshToken,
        isAuthenticated: true,
        isLoading: false
      });

      this.startRefreshTokenTimer();
      return user;
    } catch (error: any) {
      this.setAuthState({
        isLoading: false,
        error: error.response?.data?.message || 'Registration failed'
      });
      throw error;
    }
  }

  async logout() {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        await axios.post(`${API_URL}/auth/logout`, { refreshToken });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      this.clearAuth();
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${API_URL}/auth/refresh`, {
        refreshToken
      });

      const { token: newToken, refreshToken: newRefreshToken } = response.data;
      this.setTokens(newToken, newRefreshToken);
      this.startRefreshTokenTimer();

      return newToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.clearAuth();
      return null;
    }
  }

  private async validateAndRefreshToken(token: string): Promise<User | null> {
    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      const isExpired = decoded.exp * 1000 < Date.now();

      if (isExpired) {
        const newToken = await this.refreshToken();
        if (!newToken) return null;
        return this.getUserFromToken(newToken);
      }

      return this.getUserFromToken(token);
    } catch (error) {
      console.error('Error validating token:', error);
      return null;
    }
  }

  private getUserFromToken(token: string): User | null {
    try {
      const decoded = jwtDecode<any>(token);
      return {
        id: decoded.sub,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        role: decoded.role,
        permissions: decoded.permissions,
        subscription: decoded.subscription,
        preferences: decoded.preferences,
        createdAt: new Date(decoded.createdAt),
        lastLogin: new Date(decoded.lastLogin)
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  private setTokens(token: string, refreshToken: string) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  private clearAuth() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    if (this.refreshTokenTimeout) {
      window.clearTimeout(this.refreshTokenTimeout);
      this.refreshTokenTimeout = null;
    }
    this.setAuthState({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false
    });
  }

  private startRefreshTokenTimer() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return;

    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      const expires = new Date(decoded.exp * 1000);
      const timeout = expires.getTime() - Date.now() - (60 * 1000); // Refresh 1 minute before expiry

      if (this.refreshTokenTimeout) {
        window.clearTimeout(this.refreshTokenTimeout);
      }

      this.refreshTokenTimeout = window.setTimeout(() => this.refreshToken(), timeout);
    } catch (error) {
      console.error('Error starting refresh timer:', error);
    }
  }

  private setAuthState(partialState: Partial<AuthState>) {
    const currentState = this.state.value;
    this.state.next({
      ...currentState,
      ...partialState
    });
  }

  // Public methods for accessing auth state
  getState() {
    return this.state.asObservable();
  }

  getCurrentUser(): User | null {
    return this.state.value.user;
  }

  isAuthenticated(): boolean {
    return this.state.value.isAuthenticated;
  }

  hasPermission(permission: Permission): boolean {
    const user = this.state.value.user;
    return user?.permissions.includes(permission) || false;
  }

  hasRole(role: UserRole): boolean {
    return this.state.value.user?.role === role;
  }

  // User preference management
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const response = await axios.patch(
        `${API_URL}/users/preferences`,
        preferences,
        {
          headers: { Authorization: `Bearer ${this.state.value.token}` }
        }
      );

      const user = this.state.value.user;
      if (user) {
        this.setAuthState({
          user: {
            ...user,
            preferences: {
              ...user.preferences,
              ...response.data
            }
          }
        });
      }

      return response.data;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  // Password management
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await axios.post(
        `${API_URL}/auth/change-password`,
        {
          currentPassword,
          newPassword
        },
        {
          headers: { Authorization: `Bearer ${this.state.value.token}` }
        }
      );
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/auth/reset-password-request`, { email });
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        newPassword
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  // Session management
  async revokeAllSessions(): Promise<void> {
    try {
      await axios.post(
        `${API_URL}/auth/revoke-all-sessions`,
        {},
        {
          headers: { Authorization: `Bearer ${this.state.value.token}` }
        }
      );
      this.clearAuth();
    } catch (error) {
      console.error('Error revoking sessions:', error);
      throw error;
    }
  }
}

export const authService = new AuthService(); 