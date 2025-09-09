import { HttpClient } from '../utils/http-client';
import {
  Project,
  ProjectsListResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectsQueryParams,
  AddProjectMembersRequest,
  RemoveProjectMembersRequest,
  ImportTemplateRequest,
  AssignPlaceholderRequest,
  UnassignPlaceholderRequest,
} from '../types/projects';

export class ProjectsResource {
  constructor(private httpClient: HttpClient) {}

  async list(params?: ProjectsQueryParams): Promise<ProjectsListResponse> {
    return this.httpClient.get<ProjectsListResponse>('/api/1.0/projects', params);
  }

  async get(projectId: number, includeFields?: string): Promise<Project> {
    const params = includeFields ? { includeFields } : undefined;
    return this.httpClient.get<Project>(`/api/1.0/projects/${projectId}`, params);
  }

  async create(data: CreateProjectRequest): Promise<Project> {
    return this.httpClient.post<Project>('/api/1.0/projects', data);
  }

  async update(projectId: number, data: UpdateProjectRequest): Promise<Project> {
    return this.httpClient.put<Project>(`/api/1.0/projects/${projectId}`, data);
  }

  async delete(projectId: number): Promise<void> {
    return this.httpClient.delete<void>(`/api/1.0/projects/${projectId}`);
  }

  async archive(projectId: number): Promise<Project> {
    return this.httpClient.post<Project>(`/api/1.0/projects/${projectId}/archive`);
  }

  async unarchive(projectId: number): Promise<Project> {
    return this.httpClient.post<Project>(`/api/1.0/projects/${projectId}/unarchive`);
  }

  async addMembers(projectId: number, data: AddProjectMembersRequest): Promise<Project> {
    return this.httpClient.post<Project>(`/api/1.0/projects/${projectId}/members`, data);
  }

  async removeMembers(projectId: number, data: RemoveProjectMembersRequest): Promise<Project> {
    return this.httpClient.delete<Project>(`/api/1.0/projects/${projectId}/members`, data);
  }

  async importTemplate(projectId: number, data: ImportTemplateRequest): Promise<Project> {
    return this.httpClient.post<Project>(`/api/1.0/projects/${projectId}/import-template`, data);
  }

  async assignPlaceholder(projectId: number, data: AssignPlaceholderRequest): Promise<Project> {
    return this.httpClient.post<Project>(`/api/1.0/projects/${projectId}/placeholders/assign`, data);
  }

  async unassignPlaceholder(projectId: number, data: UnassignPlaceholderRequest): Promise<Project> {
    return this.httpClient.post<Project>(`/api/1.0/projects/${projectId}/placeholders/unassign`, data);
  }

  async duplicate(projectId: number, newProjectName: string): Promise<Project> {
    return this.httpClient.post<Project>(`/api/1.0/projects/${projectId}/duplicate`, {
      projectName: newProjectName,
    });
  }

  async getByCompany(companyId: number, params?: Omit<ProjectsQueryParams, 'companyId'>): Promise<ProjectsListResponse> {
    return this.list({ ...params, companyId });
  }

  async getByOwner(ownerId: number, params?: Omit<ProjectsQueryParams, 'ownerId'>): Promise<ProjectsListResponse> {
    return this.list({ ...params, ownerId });
  }

  async search(query: string, params?: Omit<ProjectsQueryParams, 'search'>): Promise<ProjectsListResponse> {
    return this.list({ ...params, search: query });
  }
}