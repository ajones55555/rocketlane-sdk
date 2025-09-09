export interface User {
  emailId: string;
  userId: number;
  firstName: string;
  lastName?: string;
}

export interface Project {
  projectId: number;
  projectName: string;
}

export interface TaskStatus {
  value: number;
  label: string;
}

export interface TaskField {
  fieldId: string;
  fieldName: string;
  value: unknown;
  type: string;
}

export interface Task {
  taskId: number;
  taskName: string;
  startDate?: string;
  dueDate?: string;
  startDateActual?: string;
  dueDateActual?: string;
  archived: boolean;
  effortInMinutes?: number;
  createdAt: number;
  updatedAt: number;
  createdBy: User;
  updatedBy: User;
  project: Project;
  status: TaskStatus;
  fields: TaskField[];
  private: boolean;
  assignees?: User[];
  followers?: User[];
  dependencies?: TaskDependency[];
  phase?: Phase;
  type?: 'Task' | 'Milestone';
  atRisk?: boolean;
  description?: string;
  priority?: TaskPriority;
  progress?: number;
  tags?: string[];
  billable?: boolean;
  csatEnabled?: boolean;
  timeEntryCategory?: string;
  taskPrivateNote?: string;
  parent?: Task;
}

export interface TaskDependency {
  dependentTaskId: number;
  dependentTaskName: string;
  dependencyType: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
}

export interface Phase {
  phaseId: number;
  phaseName: string;
}

export interface TaskPriority {
  value: number;
  label: string;
}

export interface TasksListResponse {
  data: Task[];
  pagination: {
    pageSize: number;
    hasMore: boolean;
    totalRecordCount: number;
    nextPage?: string;
    nextPageToken?: string;
  };
}

export interface CreateTaskRequest {
  taskName: string;
  projectId: number;
  phaseId?: number;
  startDate?: string;
  dueDate?: string;
  effortInMinutes?: number;
  assignees?: number[];
  followers?: number[];
  type?: 'Task' | 'Milestone';
  priority?: number;
  description?: string;
  private?: boolean;
  fields?: Record<string, unknown>;
  tags?: string[];
  [key: string]: unknown;
}

export interface UpdateTaskRequest {
  taskName?: string;
  startDate?: string;
  dueDate?: string;
  effortInMinutes?: number;
  status?: number;
  priority?: number;
  description?: string;
  private?: boolean;
  atRisk?: boolean;
  progress?: number;
  fields?: Record<string, unknown>;
  tags?: string[];
  [key: string]: unknown;
}

export interface TasksQueryParams {
  pageSize?: number;
  pageToken?: string;
  projectId?: number;
  phaseId?: number;
  assigneeId?: number;
  status?: number;
  type?: 'Task' | 'Milestone';
  startDateFrom?: string;
  startDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  archived?: boolean;
  private?: boolean;
  search?: string;
  sortBy?: 'taskName' | 'startDate' | 'dueDate' | 'createdAt' | 'updatedAt' | 'status' | 'priority';
  sortOrder?: 'asc' | 'desc';
  includeFields?: string;
  [key: string]: unknown;
}

export interface AddAssigneesRequest {
  assignees: number[];
  [key: string]: unknown;
}

export interface RemoveAssigneesRequest {
  assignees: number[];
  [key: string]: unknown;
}

export interface AddFollowersRequest {
  followers: number[];
  [key: string]: unknown;
}

export interface RemoveFollowersRequest {
  followers: number[];
  [key: string]: unknown;
}

export interface AddDependenciesRequest {
  dependencies: {
    taskId: number;
    dependencyType: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  }[];
  [key: string]: unknown;
}

export interface RemoveDependenciesRequest {
  dependencies: number[];
  [key: string]: unknown;
}

export interface MoveTaskToPhaseRequest {
  phaseId: number;
  position?: number;
  [key: string]: unknown;
}

export interface BulkUpdateTasksRequest {
  taskIds: number[];
  updates: UpdateTaskRequest;
  [key: string]: unknown;
}