import { BaseResource } from '../utils/base-resource';
import {
  Phase,
  PhasesListResponse,
  CreatePhaseRequest,
  UpdatePhaseRequest,
  PhasesQueryParams,
  ReorderPhasesRequest,
  BulkUpdatePhasesRequest,
  DuplicatePhaseRequest,
} from '../types/phases';

export class PhasesResource extends BaseResource {

  async list(params?: PhasesQueryParams): Promise<PhasesListResponse> {
    return this.httpClient.get<PhasesListResponse>('/api/1.0/phases', params);
  }

  async getPhase(phaseId: number): Promise<Phase> {
    return this.httpClient.get<Phase>(`/api/1.0/phases/${phaseId}`);
  }

  async create(data: CreatePhaseRequest): Promise<Phase> {
    return this.httpClient.post<Phase>('/api/1.0/phases', data);
  }

  async update(phaseId: number, data: UpdatePhaseRequest): Promise<Phase> {
    return this.httpClient.put<Phase>(`/api/1.0/phases/${phaseId}`, data);
  }

  async deleteResource(phaseId: number): Promise<void> {
    return this.httpClient.delete<void>(`/api/1.0/phases/${phaseId}`);
  }

  async archive(phaseId: number): Promise<Phase> {
    return this.httpClient.post<Phase>(`/api/1.0/phases/${phaseId}/archive`);
  }

  async unarchive(phaseId: number): Promise<Phase> {
    return this.httpClient.post<Phase>(`/api/1.0/phases/${phaseId}/unarchive`);
  }

  async duplicate(phaseId: number, data: DuplicatePhaseRequest): Promise<Phase> {
    return this.httpClient.post<Phase>(`/api/1.0/phases/${phaseId}/duplicate`, data);
  }

  async reorder(data: ReorderPhasesRequest): Promise<Phase[]> {
    return this.httpClient.post<Phase[]>('/api/1.0/phases/reorder', data);
  }

  async bulkUpdate(data: BulkUpdatePhasesRequest): Promise<Phase[]> {
    return this.httpClient.put<Phase[]>('/api/1.0/phases/bulk', data);
  }

  async bulkDelete(phaseIds: number[]): Promise<void> {
    return this.httpClient.delete<void>('/api/1.0/phases/bulk', { phaseIds });
  }

  // Helper methods for filtering
  async getByProject(projectId: number, params?: Omit<PhasesQueryParams, 'projectId'>): Promise<PhasesListResponse> {
    return this.list({ ...params, projectId });
  }

  async getByStatus(status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold', params?: Omit<PhasesQueryParams, 'status'>): Promise<PhasesListResponse> {
    return this.list({ ...params, status });
  }

  async getActive(params?: Omit<PhasesQueryParams, 'archived'>): Promise<PhasesListResponse> {
    return this.list({ ...params, archived: false });
  }

  async getArchived(params?: Omit<PhasesQueryParams, 'archived'>): Promise<PhasesListResponse> {
    return this.list({ ...params, archived: true });
  }

  async search(query: string, params?: Omit<PhasesQueryParams, 'search'>): Promise<PhasesListResponse> {
    return this.list({ ...params, search: query });
  }

  async getNotStarted(params?: Omit<PhasesQueryParams, 'status'>): Promise<PhasesListResponse> {
    return this.getByStatus('Not Started', params);
  }

  async getInProgress(params?: Omit<PhasesQueryParams, 'status'>): Promise<PhasesListResponse> {
    return this.getByStatus('In Progress', params);
  }

  async getCompleted(params?: Omit<PhasesQueryParams, 'status'>): Promise<PhasesListResponse> {
    return this.getByStatus('Completed', params);
  }

  async getOnHold(params?: Omit<PhasesQueryParams, 'status'>): Promise<PhasesListResponse> {
    return this.getByStatus('On Hold', params);
  }

  async getByDateRange(startDateFrom: string, startDateTo: string, params?: Omit<PhasesQueryParams, 'startDateFrom' | 'startDateTo'>): Promise<PhasesListResponse> {
    return this.list({ ...params, startDateFrom, startDateTo });
  }

  // Pagination helper methods
  async getNextPage(response: PhasesListResponse, originalParams?: PhasesQueryParams): Promise<PhasesListResponse | null> {
    return this.getNextPageInternal(response, originalParams || {}, this.list.bind(this));
  }

  async getAllPhases(params?: PhasesQueryParams): Promise<Phase[]> {
    return this.getAllPages(params || {}, this.list.bind(this));
  }

  iteratePhasePages(params?: PhasesQueryParams): AsyncGenerator<PhasesListResponse, void, unknown> {
    return this.iteratePages(params || {}, this.list.bind(this));
  }

  iteratePhases(params?: PhasesQueryParams): AsyncGenerator<Phase, void, unknown> {
    return this.iterateItems(params || {}, this.list.bind(this));
  }
}