import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { RocketlaneConfig, RocketlaneError, RequestConfig } from '../types/common';

export class HttpClient {
  private client: AxiosInstance;
  private config: RocketlaneConfig;

  constructor(config: RocketlaneConfig) {
    this.config = {
      baseUrl: 'https://api.rocketlane.com',
      timeout: 30000,
      retries: 3,
      ...config,
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        const rocketlaneError: RocketlaneError = new Error(
          error.response?.data?.message || error.message || 'An error occurred'
        );
        
        rocketlaneError.statusCode = error.response?.status;
        rocketlaneError.response = error.response;
        
        return Promise.reject(rocketlaneError);
      }
    );

    this.client.interceptors.request.use((config) => {
      config.metadata = { startTime: Date.now() };
      return config;
    });
  }

  async request<T>(config: RequestConfig): Promise<T> {
    const axiosConfig: AxiosRequestConfig = {
      method: config.method,
      url: config.url,
      data: config.data,
      params: config.params,
      headers: config.headers,
    };

    let attempts = 0;
    let lastError: RocketlaneError;

    while (attempts < (this.config.retries || 1)) {
      try {
        const response = await this.client.request<T>(axiosConfig);
        return response.data;
      } catch (error) {
        lastError = error as RocketlaneError;
        attempts++;
        
        if (attempts < (this.config.retries || 1) && this.shouldRetry(error as RocketlaneError)) {
          await this.delay(Math.pow(2, attempts) * 1000);
          continue;
        }
        break;
      }
    }

    throw lastError!;
  }

  private shouldRetry(error: RocketlaneError): boolean {
    if (!error.statusCode) return true;
    return error.statusCode >= 500 || error.statusCode === 429;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    return this.request<T>({
      method: 'GET',
      url,
      ...(params && { params }),
    });
  }

  async post<T>(url: string, data?: unknown, params?: Record<string, unknown>): Promise<T> {
    return this.request<T>({
      method: 'POST',
      url,
      ...(data !== undefined && { data }),
      ...(params && { params }),
    });
  }

  async put<T>(url: string, data?: unknown, params?: Record<string, unknown>): Promise<T> {
    return this.request<T>({
      method: 'PUT',
      url,
      ...(data !== undefined && { data }),
      ...(params && { params }),
    });
  }

  async patch<T>(url: string, data?: unknown, params?: Record<string, unknown>): Promise<T> {
    return this.request<T>({
      method: 'PATCH',
      url,
      ...(data !== undefined && { data }),
      ...(params && { params }),
    });
  }

  async delete<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    return this.request<T>({
      method: 'DELETE',
      url,
      ...(params && { params }),
    });
  }
}