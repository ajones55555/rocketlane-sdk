import { BaseResource } from '../utils/base-resource';

export interface TimeOff {
  timeOffId: number;
  userId: number;
  userFirstName: string;
  userLastName?: string;
  startDate: string;
  endDate: string;
  type: 'vacation' | 'sick' | 'personal' | 'holiday' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  approvedBy?: {
    userId: number;
    firstName: string;
    lastName?: string;
  };
  createdAt: number;
  updatedAt: number;
}

export interface TimeOffsListResponse {
  data: TimeOff[];
  pagination: {
    pageSize: number;
    hasMore: boolean;
    totalRecordCount: number;
    nextPage?: string;
    nextPageToken?: string;
  };
}

export interface CreateTimeOffRequest {
  startDate: string;
  endDate: string;
  type: 'vacation' | 'sick' | 'personal' | 'holiday' | 'other';
  reason?: string;
  userId?: number;
  [key: string]: unknown;
}

export interface UpdateTimeOffRequest {
  startDate?: string;
  endDate?: string;
  type?: 'vacation' | 'sick' | 'personal' | 'holiday' | 'other';
  reason?: string;
  status?: 'pending' | 'approved' | 'rejected';
  [key: string]: unknown;
}

export interface TimeOffsQueryParams {
  pageSize?: number;
  pageToken?: string;
  userId?: number;
  type?: 'vacation' | 'sick' | 'personal' | 'holiday' | 'other';
  status?: 'pending' | 'approved' | 'rejected';
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  sortBy?: 'startDate' | 'endDate' | 'createdAt' | 'updatedAt' | 'status';
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

export class TimeOffsResource extends BaseResource {

  async list(params?: TimeOffsQueryParams): Promise<TimeOffsListResponse> {
    return this.httpClient.get<TimeOffsListResponse>('/api/1.0/time-offs', params);
  }

  async getTimeOff(timeOffId: number): Promise<TimeOff> {
    return this.httpClient.get<TimeOff>(`/api/1.0/time-offs/${timeOffId}`);
  }

  async create(data: CreateTimeOffRequest): Promise<TimeOff> {
    return this.httpClient.post<TimeOff>('/api/1.0/time-offs', data);
  }

  async update(timeOffId: number, data: UpdateTimeOffRequest): Promise<TimeOff> {
    return this.httpClient.put<TimeOff>(`/api/1.0/time-offs/${timeOffId}`, data);
  }

  async deleteResource(timeOffId: number): Promise<void> {
    return this.httpClient.delete<void>(`/api/1.0/time-offs/${timeOffId}`);
  }

  async approve(timeOffId: number): Promise<TimeOff> {
    return this.httpClient.post<TimeOff>(`/api/1.0/time-offs/${timeOffId}/approve`);
  }

  async reject(timeOffId: number, reason?: string): Promise<TimeOff> {
    return this.httpClient.post<TimeOff>(`/api/1.0/time-offs/${timeOffId}/reject`, { reason });
  }

  async getByUser(userId: number, params?: Omit<TimeOffsQueryParams, 'userId'>): Promise<TimeOffsListResponse> {
    return this.list({ ...params, userId });
  }

  async getByStatus(status: 'pending' | 'approved' | 'rejected', params?: Omit<TimeOffsQueryParams, 'status'>): Promise<TimeOffsListResponse> {
    return this.list({ ...params, status });
  }

  async getByType(type: 'vacation' | 'sick' | 'personal' | 'holiday' | 'other', params?: Omit<TimeOffsQueryParams, 'type'>): Promise<TimeOffsListResponse> {
    return this.list({ ...params, type });
  }

  async getPending(params?: Omit<TimeOffsQueryParams, 'status'>): Promise<TimeOffsListResponse> {
    return this.getByStatus('pending', params);
  }

  async getApproved(params?: Omit<TimeOffsQueryParams, 'status'>): Promise<TimeOffsListResponse> {
    return this.getByStatus('approved', params);
  }

  async getRejected(params?: Omit<TimeOffsQueryParams, 'status'>): Promise<TimeOffsListResponse> {
    return this.getByStatus('rejected', params);
  }

  // Pagination helper methods
  async getNextPage(response: TimeOffsListResponse, originalParams?: TimeOffsQueryParams): Promise<TimeOffsListResponse | null> {
    return this.getNextPageInternal(response, originalParams || {}, this.list.bind(this));
  }

  async getAllTimeOffs(params?: TimeOffsQueryParams): Promise<TimeOff[]> {
    return this.getAllPages(params || {}, this.list.bind(this));
  }

  iterateTimeOffPages(params?: TimeOffsQueryParams): AsyncGenerator<TimeOffsListResponse, void, unknown> {
    return this.iteratePages(params || {}, this.list.bind(this));
  }

  iterateTimeOffs(params?: TimeOffsQueryParams): AsyncGenerator<TimeOff, void, unknown> {
    return this.iterateItems(params || {}, this.list.bind(this));
  }
}