export interface RocketlaneConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RocketlanePagination {
  pageSize: number;
  hasMore: boolean;
  totalRecordCount: number;
  nextPage?: string;
  nextPageToken?: string;
}

export interface BasePaginatedResponse<T> {
  data: T[];
  pagination: RocketlanePagination;
}

export interface PaginationOptions {
  pageSize?: number;
  pageToken?: string;
  [key: string]: unknown;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filter?: Record<string, unknown>;
}

export interface RocketlaneError extends Error {
  statusCode?: number;
  response?: {
    data?: unknown;
    status?: number;
    statusText?: string;
  };
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RequestConfig {
  method: HttpMethod;
  url: string;
  data?: unknown;
  params?: Record<string, unknown> | undefined;
  headers?: Record<string, string>;
}