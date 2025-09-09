import { HttpClient } from '../utils/http-client';
import {
  TimeEntry,
  TimeEntriesListResponse,
  CreateTimeEntryRequest,
  UpdateTimeEntryRequest,
  TimeEntriesQueryParams,
  BulkCreateTimeEntriesRequest,
  BulkUpdateTimeEntriesRequest,
  BulkDeleteTimeEntriesRequest,
  ApproveTimeEntriesRequest,
  RejectTimeEntriesRequest,
  TimeEntryCategory,
  TimeEntryCategoriesListResponse,
  CreateTimeEntryCategoryRequest,
  UpdateTimeEntryCategoryRequest,
  TimeEntryReport,
  TimeEntryReportParams,
} from '../types/time-tracking';

export class TimeTrackingResource {
  constructor(private httpClient: HttpClient) {}

  // Time Entries
  async list(params?: TimeEntriesQueryParams): Promise<TimeEntriesListResponse> {
    return this.httpClient.get<TimeEntriesListResponse>('/api/1.0/time-entries', params);
  }

  async get(timeEntryId: number): Promise<TimeEntry> {
    return this.httpClient.get<TimeEntry>(`/api/1.0/time-entries/${timeEntryId}`);
  }

  async create(data: CreateTimeEntryRequest): Promise<TimeEntry> {
    return this.httpClient.post<TimeEntry>('/api/1.0/time-entries', data);
  }

  async update(timeEntryId: number, data: UpdateTimeEntryRequest): Promise<TimeEntry> {
    return this.httpClient.put<TimeEntry>(`/api/1.0/time-entries/${timeEntryId}`, data);
  }

  async delete(timeEntryId: number): Promise<void> {
    return this.httpClient.delete<void>(`/api/1.0/time-entries/${timeEntryId}`);
  }

  async bulkCreate(data: BulkCreateTimeEntriesRequest): Promise<TimeEntry[]> {
    return this.httpClient.post<TimeEntry[]>('/api/1.0/time-entries/bulk', data);
  }

  async bulkUpdate(data: BulkUpdateTimeEntriesRequest): Promise<TimeEntry[]> {
    return this.httpClient.put<TimeEntry[]>('/api/1.0/time-entries/bulk', data);
  }

  async bulkDelete(data: BulkDeleteTimeEntriesRequest): Promise<void> {
    return this.httpClient.delete<void>('/api/1.0/time-entries/bulk', data);
  }

  async approve(data: ApproveTimeEntriesRequest): Promise<TimeEntry[]> {
    return this.httpClient.post<TimeEntry[]>('/api/1.0/time-entries/approve', data);
  }

  async reject(data: RejectTimeEntriesRequest): Promise<TimeEntry[]> {
    return this.httpClient.post<TimeEntry[]>('/api/1.0/time-entries/reject', data);
  }

  // Time Entry Categories
  async getCategories(): Promise<TimeEntryCategoriesListResponse> {
    return this.httpClient.get<TimeEntryCategoriesListResponse>('/api/1.0/time-entry-categories');
  }

  async getCategory(categoryId: number): Promise<TimeEntryCategory> {
    return this.httpClient.get<TimeEntryCategory>(`/api/1.0/time-entry-categories/${categoryId}`);
  }

  async createCategory(data: CreateTimeEntryCategoryRequest): Promise<TimeEntryCategory> {
    return this.httpClient.post<TimeEntryCategory>('/api/1.0/time-entry-categories', data);
  }

  async updateCategory(categoryId: number, data: UpdateTimeEntryCategoryRequest): Promise<TimeEntryCategory> {
    return this.httpClient.put<TimeEntryCategory>(`/api/1.0/time-entry-categories/${categoryId}`, data);
  }

  async deleteCategory(categoryId: number): Promise<void> {
    return this.httpClient.delete<void>(`/api/1.0/time-entry-categories/${categoryId}`);
  }

  // Helper methods for filtering
  async getByProject(projectId: number, params?: Omit<TimeEntriesQueryParams, 'projectId'>): Promise<TimeEntriesListResponse> {
    return this.list({ ...params, projectId });
  }

  async getByUser(userId: number, params?: Omit<TimeEntriesQueryParams, 'userId'>): Promise<TimeEntriesListResponse> {
    return this.list({ ...params, userId });
  }

  async getByPhase(phaseId: number, params?: Omit<TimeEntriesQueryParams, 'phaseId'>): Promise<TimeEntriesListResponse> {
    return this.list({ ...params, phaseId });
  }

  async getByTask(taskId: number, params?: Omit<TimeEntriesQueryParams, 'taskId'>): Promise<TimeEntriesListResponse> {
    return this.list({ ...params, taskId });
  }

  async getByCategory(categoryId: number, params?: Omit<TimeEntriesQueryParams, 'categoryId'>): Promise<TimeEntriesListResponse> {
    return this.list({ ...params, categoryId });
  }

  async getBillable(params?: Omit<TimeEntriesQueryParams, 'billable'>): Promise<TimeEntriesListResponse> {
    return this.list({ ...params, billable: true });
  }

  async getNonBillable(params?: Omit<TimeEntriesQueryParams, 'billable'>): Promise<TimeEntriesListResponse> {
    return this.list({ ...params, billable: false });
  }

  async getApproved(params?: Omit<TimeEntriesQueryParams, 'approved'>): Promise<TimeEntriesListResponse> {
    return this.list({ ...params, approved: true });
  }

  async getPending(params?: Omit<TimeEntriesQueryParams, 'approved'>): Promise<TimeEntriesListResponse> {
    return this.list({ ...params, approved: false });
  }

  async getByDateRange(dateFrom: string, dateTo: string, params?: Omit<TimeEntriesQueryParams, 'dateFrom' | 'dateTo'>): Promise<TimeEntriesListResponse> {
    return this.list({ ...params, dateFrom, dateTo });
  }

  async search(query: string, params?: Omit<TimeEntriesQueryParams, 'search'>): Promise<TimeEntriesListResponse> {
    return this.list({ ...params, search: query });
  }

  // Reporting
  async getReport(params?: TimeEntryReportParams): Promise<TimeEntryReport> {
    return this.httpClient.get<TimeEntryReport>('/api/1.0/time-entries/report', params);
  }

  async exportReport(params?: TimeEntryReportParams & { format?: 'csv' | 'xlsx' }): Promise<Blob> {
    return this.httpClient.get<Blob>('/api/1.0/time-entries/export', params);
  }

  // Timer functionality (if supported)
  async startTimer(data: { projectId: number; phaseId?: number; taskId?: number; categoryId: number; description?: string }): Promise<{ timerId: string; startedAt: number }> {
    return this.httpClient.post('/api/1.0/time-entries/timer/start', data);
  }

  async stopTimer(timerId: string): Promise<TimeEntry> {
    return this.httpClient.post<TimeEntry>(`/api/1.0/time-entries/timer/${timerId}/stop`);
  }

  async pauseTimer(timerId: string): Promise<{ timerId: string; pausedAt: number }> {
    return this.httpClient.post(`/api/1.0/time-entries/timer/${timerId}/pause`);
  }

  async resumeTimer(timerId: string): Promise<{ timerId: string; resumedAt: number }> {
    return this.httpClient.post(`/api/1.0/time-entries/timer/${timerId}/resume`);
  }

  async getActiveTimer(): Promise<{ timerId: string; startedAt: number; totalMinutes: number } | null> {
    return this.httpClient.get('/api/1.0/time-entries/timer/active');
  }
}