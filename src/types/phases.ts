export interface Phase {
  phaseId: number;
  phaseName: string;
  description?: string;
  projectId: number;
  position: number;
  startDate?: string;
  dueDate?: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  color?: string;
  archived: boolean;
  taskCount?: number;
  completedTaskCount?: number;
  progress?: number;
  createdAt: number;
  createdBy: {
    userId: number;
    firstName: string;
    lastName?: string;
  };
  updatedAt?: number;
  updatedBy?: {
    userId: number;
    firstName: string;
    lastName?: string;
  };
}

export interface PhasesListResponse {
  data: Phase[];
  pagination: {
    pageSize: number;
    hasMore: boolean;
    totalRecordCount: number;
    nextPage?: string;
    nextPageToken?: string;
  };
}

export interface CreatePhaseRequest {
  phaseName: string;
  projectId: number;
  description?: string;
  startDate?: string;
  dueDate?: string;
  color?: string;
  position?: number;
  [key: string]: unknown;
}

export interface UpdatePhaseRequest {
  phaseName?: string;
  description?: string;
  startDate?: string;
  dueDate?: string;
  color?: string;
  status?: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  [key: string]: unknown;
}

export interface PhasesQueryParams {
  pageSize?: number;
  pageToken?: string;
  projectId?: number;
  status?: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  archived?: boolean;
  startDateFrom?: string;
  startDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
  sortBy?: 'phaseName' | 'startDate' | 'dueDate' | 'createdAt' | 'updatedAt' | 'position' | 'status';
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface ReorderPhasesRequest {
  phaseIds: number[];
  [key: string]: unknown;
}

export interface BulkUpdatePhasesRequest {
  phaseIds: number[];
  updates: UpdatePhaseRequest;
  [key: string]: unknown;
}

export interface DuplicatePhaseRequest {
  newPhaseName: string;
  projectId?: number;
  includeTasks?: boolean;
  [key: string]: unknown;
}