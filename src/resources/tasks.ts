import { HttpClient } from '../utils/http-client';
import {
  Task,
  TasksListResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  TasksQueryParams,
  AddAssigneesRequest,
  RemoveAssigneesRequest,
  AddFollowersRequest,
  RemoveFollowersRequest,
  AddDependenciesRequest,
  RemoveDependenciesRequest,
  MoveTaskToPhaseRequest,
  BulkUpdateTasksRequest,
} from '../types/tasks';

export class TasksResource {
  constructor(private httpClient: HttpClient) {}

  async list(params?: TasksQueryParams): Promise<TasksListResponse> {
    return this.httpClient.get<TasksListResponse>('/api/1.0/tasks', params);
  }

  async get(taskId: number): Promise<Task> {
    return this.httpClient.get<Task>(`/api/1.0/tasks/${taskId}`);
  }

  async create(data: CreateTaskRequest): Promise<Task> {
    return this.httpClient.post<Task>('/api/1.0/tasks', data);
  }

  async update(taskId: number, data: UpdateTaskRequest): Promise<Task> {
    return this.httpClient.put<Task>(`/api/1.0/tasks/${taskId}`, data);
  }

  async delete(taskId: number): Promise<void> {
    return this.httpClient.delete<void>(`/api/1.0/tasks/${taskId}`);
  }

  async addAssignees(taskId: number, data: AddAssigneesRequest): Promise<Task> {
    return this.httpClient.post<Task>(`/api/1.0/tasks/${taskId}/assignees`, data);
  }

  async removeAssignees(taskId: number, data: RemoveAssigneesRequest): Promise<Task> {
    return this.httpClient.delete<Task>(`/api/1.0/tasks/${taskId}/assignees`, data);
  }

  async addFollowers(taskId: number, data: AddFollowersRequest): Promise<Task> {
    return this.httpClient.post<Task>(`/api/1.0/tasks/${taskId}/followers`, data);
  }

  async removeFollowers(taskId: number, data: RemoveFollowersRequest): Promise<Task> {
    return this.httpClient.delete<Task>(`/api/1.0/tasks/${taskId}/followers`, data);
  }

  async addDependencies(taskId: number, data: AddDependenciesRequest): Promise<Task> {
    return this.httpClient.post<Task>(`/api/1.0/tasks/${taskId}/dependencies`, data);
  }

  async removeDependencies(taskId: number, data: RemoveDependenciesRequest): Promise<Task> {
    return this.httpClient.delete<Task>(`/api/1.0/tasks/${taskId}/dependencies`, data);
  }

  async moveToPhase(taskId: number, data: MoveTaskToPhaseRequest): Promise<Task> {
    return this.httpClient.post<Task>(`/api/1.0/tasks/${taskId}/move`, data);
  }

  async duplicate(taskId: number, projectId?: number): Promise<Task> {
    const params = projectId ? { projectId } : undefined;
    return this.httpClient.post<Task>(`/api/1.0/tasks/${taskId}/duplicate`, undefined, params);
  }

  async archive(taskId: number): Promise<Task> {
    return this.httpClient.post<Task>(`/api/1.0/tasks/${taskId}/archive`);
  }

  async unarchive(taskId: number): Promise<Task> {
    return this.httpClient.post<Task>(`/api/1.0/tasks/${taskId}/unarchive`);
  }

  async bulkUpdate(data: BulkUpdateTasksRequest): Promise<Task[]> {
    return this.httpClient.put<Task[]>('/api/1.0/tasks/bulk', data);
  }

  async bulkDelete(taskIds: number[]): Promise<void> {
    return this.httpClient.delete<void>('/api/1.0/tasks/bulk', { taskIds });
  }

  async getByProject(projectId: number, params?: Omit<TasksQueryParams, 'projectId'>): Promise<TasksListResponse> {
    return this.list({ ...params, projectId });
  }

  async getByPhase(phaseId: number, params?: Omit<TasksQueryParams, 'phaseId'>): Promise<TasksListResponse> {
    return this.list({ ...params, phaseId });
  }

  async getByAssignee(assigneeId: number, params?: Omit<TasksQueryParams, 'assigneeId'>): Promise<TasksListResponse> {
    return this.list({ ...params, assigneeId });
  }

  async search(query: string, params?: Omit<TasksQueryParams, 'search'>): Promise<TasksListResponse> {
    return this.list({ ...params, search: query });
  }
}