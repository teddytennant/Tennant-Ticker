import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { BehaviorSubject } from 'rxjs';
import { authService } from './authService';

const API_URL = import.meta.env.VITE_API_URL;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

interface CacheItem<T> {
  data: T;
  timestamp: number;
  etag?: string;
}

interface RequestState {
  loading: boolean;
  error: string | null;
  pendingRequests: number;
}

interface RetryConfig {
  maxRetries?: number;
  delayMs?: number;
  shouldRetry?: (error: AxiosError) => boolean;
}

class ApiService {
  private axiosInstance: AxiosInstance;
  private cache: Map<string, CacheItem<any>> = new Map();
  private state = new BehaviorSubject<RequestState>({
    loading: false,
    error: null,
    pendingRequests: 0
  });

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        this.incrementPendingRequests();

        // Add authentication token
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add cache control headers
        const cacheKey = this.getCacheKey(config);
        const cachedItem = this.cache.get(cacheKey);
        if (cachedItem?.etag) {
          config.headers['If-None-Match'] = cachedItem.etag;
        }

        return config;
      },
      (error) => {
        this.decrementPendingRequests();
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        this.decrementPendingRequests();

        // Cache the response if appropriate
        if (this.isCacheable(response.config)) {
          const cacheKey = this.getCacheKey(response.config);
          this.cache.set(cacheKey, {
            data: response.data,
            timestamp: Date.now(),
            etag: response.headers.etag
          });
        }

        return response;
      },
      async (error: AxiosError) => {
        this.decrementPendingRequests();

        // Handle 304 Not Modified
        if (error.response?.status === 304) {
          const cacheKey = this.getCacheKey(error.config!);
          const cachedItem = this.cache.get(cacheKey);
          if (cachedItem) {
            return Promise.resolve({
              ...error.response,
              data: cachedItem.data,
              status: 200,
              statusText: 'OK (from cache)'
            });
          }
        }

        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
          try {
            const newToken = await authService.refreshToken();
            if (newToken && error.config) {
              error.config.headers.Authorization = `Bearer ${newToken}`;
              return this.axiosInstance.request(error.config);
            }
          } catch (refreshError) {
            authService.logout();
            return Promise.reject(error);
          }
        }

        this.setError(this.formatError(error));
        return Promise.reject(error);
      }
    );
  }

  private incrementPendingRequests() {
    const currentState = this.state.value;
    this.state.next({
      ...currentState,
      loading: true,
      pendingRequests: currentState.pendingRequests + 1
    });
  }

  private decrementPendingRequests() {
    const currentState = this.state.value;
    const pendingRequests = Math.max(0, currentState.pendingRequests - 1);
    this.state.next({
      ...currentState,
      loading: pendingRequests > 0,
      pendingRequests
    });
  }

  private setError(error: string | null) {
    const currentState = this.state.value;
    this.state.next({
      ...currentState,
      error
    });
  }

  private formatError(error: AxiosError): string {
    if (error.response) {
      const data = error.response.data as any;
      return data.message || data.error || 'An error occurred';
    }
    if (error.request) {
      return 'No response received from server';
    }
    return error.message || 'Unknown error occurred';
  }

  private getCacheKey(config: AxiosRequestConfig): string {
    const { method, url, params, data } = config;
    return JSON.stringify({
      method: method?.toLowerCase(),
      url,
      params,
      data
    });
  }

  private isCacheable(config: AxiosRequestConfig): boolean {
    return (
      (config.method?.toLowerCase() === 'get' || config.method?.toLowerCase() === 'head') &&
      !config.headers?.['Cache-Control']?.includes('no-cache')
    );
  }

  private isResponseValid(cacheItem: CacheItem<any>): boolean {
    return Date.now() - cacheItem.timestamp < CACHE_DURATION;
  }

  private async retryRequest<T>(
    config: AxiosRequestConfig,
    retryConfig: RetryConfig = {}
  ): Promise<AxiosResponse<T>> {
    const {
      maxRetries = MAX_RETRIES,
      delayMs = RETRY_DELAY,
      shouldRetry = (error: AxiosError) => {
        const status = error.response?.status;
        return (
          !status || // Network error
          status === 408 || // Request timeout
          status === 429 || // Too many requests
          (status >= 500 && status <= 599) // Server errors
        );
      }
    } = retryConfig;

    let lastError: AxiosError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.axiosInstance.request<T>(config);
      } catch (error) {
        lastError = error as AxiosError;
        if (
          attempt === maxRetries || // Max retries reached
          !shouldRetry(lastError) || // Error shouldn't be retried
          lastError.response?.status === 401 // Auth error (handled by interceptor)
        ) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
      }
    }
    throw lastError!;
  }

  // Public API methods
  async get<T>(url: string, config: AxiosRequestConfig = {}): Promise<T> {
    const cacheKey = this.getCacheKey({ ...config, url, method: 'get' });
    const cachedItem = this.cache.get(cacheKey);

    if (cachedItem && this.isResponseValid(cachedItem)) {
      return cachedItem.data;
    }

    const response = await this.retryRequest<T>({
      ...config,
      url,
      method: 'get'
    });

    return response.data;
  }

  async post<T>(url: string, data?: any, config: AxiosRequestConfig = {}): Promise<T> {
    const response = await this.retryRequest<T>({
      ...config,
      url,
      method: 'post',
      data
    });
    return response.data;
  }

  async put<T>(url: string, data?: any, config: AxiosRequestConfig = {}): Promise<T> {
    const response = await this.retryRequest<T>({
      ...config,
      url,
      method: 'put',
      data
    });
    return response.data;
  }

  async patch<T>(url: string, data?: any, config: AxiosRequestConfig = {}): Promise<T> {
    const response = await this.retryRequest<T>({
      ...config,
      url,
      method: 'patch',
      data
    });
    return response.data;
  }

  async delete<T>(url: string, config: AxiosRequestConfig = {}): Promise<T> {
    const response = await this.retryRequest<T>({
      ...config,
      url,
      method: 'delete'
    });
    return response.data;
  }

  // Cache management
  clearCache(url?: string) {
    if (url) {
      const cacheKey = this.getCacheKey({ url, method: 'get' });
      this.cache.delete(cacheKey);
    } else {
      this.cache.clear();
    }
  }

  // State management
  getState() {
    return this.state.asObservable();
  }

  isLoading(): boolean {
    return this.state.value.loading;
  }

  getError(): string | null {
    return this.state.value.error;
  }

  // Batch requests
  async batch<T>(requests: AxiosRequestConfig[]): Promise<T[]> {
    return Promise.all(
      requests.map(config => this.retryRequest<T>(config).then(response => response.data))
    );
  }

  // Upload files
  async upload(
    url: string,
    files: File[],
    onProgress?: (percentage: number) => void,
    config: AxiosRequestConfig = {}
  ): Promise<any> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    return this.post(url, formData, {
      ...config,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentage);
        }
      }
    });
  }

  // Download files
  async download(
    url: string,
    filename: string,
    onProgress?: (percentage: number) => void,
    config: AxiosRequestConfig = {}
  ): Promise<void> {
    const response = await this.axiosInstance({
      ...config,
      url,
      method: 'get',
      responseType: 'blob',
      onDownloadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentage);
        }
      }
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  // WebSocket connection helper
  createWebSocket(path: string): WebSocket {
    const token = localStorage.getItem('auth_token');
    const ws = new WebSocket(`${API_URL.replace('http', 'ws')}${path}`);
    
    ws.onopen = () => {
      if (token) {
        ws.send(JSON.stringify({ type: 'auth', token }));
      }
    };

    return ws;
  }
}

export const apiService = new ApiService(); 