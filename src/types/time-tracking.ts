export interface TimeEntryUser {
  emailId: string;
  userId: number;
  firstName: string;
  lastName?: string;
}

export interface TimeEntryProject {
  projectId: number;
  projectName: string;
}

export interface TimeEntryPhase {
  phaseId: number;
  phaseName: string;
}

export interface TimeEntryCategory {
  categoryId: number;
  categoryName: string;
}

export interface TimeEntry {
  timeEntryId: number;
  date: string;
  minutes: number;
  project: TimeEntryProject;
  projectPhase?: TimeEntryPhase;
  createdAt: number;
  updatedAt: number;
  billable: boolean;
  user: TimeEntryUser;
  category: TimeEntryCategory;
  description?: string;
  task?: {
    taskId: number;
    taskName: string;
  };
  approved?: boolean;
  approvedBy?: TimeEntryUser;
  approvedAt?: number;
  invoiced?: boolean;
  rate?: number;
  amount?: number;
  currency?: string;
  fields?: Record<string, unknown>;
}

export interface TimeEntriesListResponse {
  data: TimeEntry[];
  pagination: {
    pageSize: number;
    hasMore: boolean;
    totalRecordCount: number;
    nextPage?: string;
    nextPageToken?: string;
  };
}

export interface CreateTimeEntryRequest {
  date: string;
  minutes: number;
  projectId: number;
  phaseId?: number;
  taskId?: number;
  categoryId: number;
  billable?: boolean;
  description?: string;
  userId?: number;
  fields?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface UpdateTimeEntryRequest {
  date?: string;
  minutes?: number;
  projectId?: number;
  phaseId?: number;
  taskId?: number;
  categoryId?: number;
  billable?: boolean;
  description?: string;
  fields?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface TimeEntriesQueryParams {
  pageSize?: number;
  pageToken?: string;
  projectId?: number;
  phaseId?: number;
  taskId?: number;
  userId?: number;
  categoryId?: number;
  billable?: boolean;
  approved?: boolean;
  invoiced?: boolean;
  dateFrom?: string;
  dateTo?: string;
  createdFrom?: string;
  createdTo?: string;
  search?: string;
  sortBy?: 'date' | 'minutes' | 'createdAt' | 'updatedAt' | 'project' | 'user';
  sortOrder?: 'asc' | 'desc';
  includeFields?: string;
  [key: string]: unknown;
}

export interface BulkCreateTimeEntriesRequest {
  entries: CreateTimeEntryRequest[];
  [key: string]: unknown;
}

export interface BulkUpdateTimeEntriesRequest {
  timeEntryIds: number[];
  updates: UpdateTimeEntryRequest;
  [key: string]: unknown;
}

export interface BulkDeleteTimeEntriesRequest {
  timeEntryIds: number[];
  [key: string]: unknown;
}

export interface ApproveTimeEntriesRequest {
  timeEntryIds: number[];
  [key: string]: unknown;
}

export interface RejectTimeEntriesRequest {
  timeEntryIds: number[];
  reason?: string;
  [key: string]: unknown;
}

export interface TimeEntryCategory {
  categoryId: number;
  categoryName: string;
  description?: string;
  active?: boolean;
  billable?: boolean;
  rate?: number;
  currency?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface TimeEntryCategoriesListResponse {
  data: TimeEntryCategory[];
  pagination: {
    pageSize: number;
    hasMore: boolean;
    totalRecordCount: number;
    nextPage?: string;
    nextPageToken?: string;
  };
}

export interface CreateTimeEntryCategoryRequest {
  categoryName: string;
  description?: string;
  billable?: boolean;
  rate?: number;
  currency?: string;
  [key: string]: unknown;
}

export interface UpdateTimeEntryCategoryRequest {
  categoryName?: string;
  description?: string;
  billable?: boolean;
  rate?: number;
  currency?: string;
  active?: boolean;
  [key: string]: unknown;
}

export interface TimeEntryReport {
  totalMinutes: number;
  totalBillableMinutes: number;
  totalNonBillableMinutes: number;
  totalAmount?: number;
  currency?: string;
  breakdown: {
    byProject: Array<{
      project: TimeEntryProject;
      minutes: number;
      billableMinutes: number;
      amount?: number;
    }>;
    byUser: Array<{
      user: TimeEntryUser;
      minutes: number;
      billableMinutes: number;
      amount?: number;
    }>;
    byCategory: Array<{
      category: TimeEntryCategory;
      minutes: number;
      billableMinutes: number;
      amount?: number;
    }>;
  };
}

export interface TimeEntryReportParams {
  projectId?: number;
  userId?: number;
  categoryId?: number;
  dateFrom?: string;
  dateTo?: string;
  billable?: boolean;
  approved?: boolean;
  groupBy?: 'project' | 'user' | 'category' | 'date';
  [key: string]: unknown;
}