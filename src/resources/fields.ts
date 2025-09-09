import { HttpClient } from '../utils/http-client';
import {
  Field,
  FieldsListResponse,
  CreateFieldRequest,
  UpdateFieldRequest,
  FieldsQueryParams,
  FieldOption,
  CreateFieldOptionRequest,
  UpdateFieldOptionRequest,
  BulkUpdateFieldOptionsRequest,
  EntityFieldValues,
  UpdateEntityFieldsRequest,
} from '../types/fields';

export class FieldsResource {
  constructor(private httpClient: HttpClient) {}

  // Field Management
  async list(params?: FieldsQueryParams): Promise<FieldsListResponse> {
    return this.httpClient.get<FieldsListResponse>('/api/1.0/fields', params);
  }

  async get(fieldId: string): Promise<Field> {
    return this.httpClient.get<Field>(`/api/1.0/fields/${fieldId}`);
  }

  async create(data: CreateFieldRequest): Promise<Field> {
    return this.httpClient.post<Field>('/api/1.0/fields', data);
  }

  async update(fieldId: string, data: UpdateFieldRequest): Promise<Field> {
    return this.httpClient.put<Field>(`/api/1.0/fields/${fieldId}`, data);
  }

  async delete(fieldId: string): Promise<void> {
    return this.httpClient.delete<void>(`/api/1.0/fields/${fieldId}`);
  }

  async activate(fieldId: string): Promise<Field> {
    return this.httpClient.post<Field>(`/api/1.0/fields/${fieldId}/activate`);
  }

  async deactivate(fieldId: string): Promise<Field> {
    return this.httpClient.post<Field>(`/api/1.0/fields/${fieldId}/deactivate`);
  }

  async reorder(fieldIds: string[]): Promise<Field[]> {
    return this.httpClient.post<Field[]>('/api/1.0/fields/reorder', { fieldIds });
  }

  // Field Options Management
  async getOptions(fieldId: string): Promise<FieldOption[]> {
    return this.httpClient.get<FieldOption[]>(`/api/1.0/fields/${fieldId}/options`);
  }

  async createOption(fieldId: string, data: CreateFieldOptionRequest): Promise<FieldOption> {
    return this.httpClient.post<FieldOption>(`/api/1.0/fields/${fieldId}/options`, data);
  }

  async updateOption(fieldId: string, optionId: string, data: UpdateFieldOptionRequest): Promise<FieldOption> {
    return this.httpClient.put<FieldOption>(`/api/1.0/fields/${fieldId}/options/${optionId}`, data);
  }

  async deleteOption(fieldId: string, optionId: string): Promise<void> {
    return this.httpClient.delete<void>(`/api/1.0/fields/${fieldId}/options/${optionId}`);
  }

  async bulkUpdateOptions(fieldId: string, data: BulkUpdateFieldOptionsRequest): Promise<FieldOption[]> {
    return this.httpClient.put<FieldOption[]>(`/api/1.0/fields/${fieldId}/options/bulk`, data);
  }

  async reorderOptions(fieldId: string, optionIds: string[]): Promise<FieldOption[]> {
    return this.httpClient.post<FieldOption[]>(`/api/1.0/fields/${fieldId}/options/reorder`, { optionIds });
  }

  // Entity Field Values
  async getEntityFields(entityType: 'task' | 'project' | 'user' | 'time_entry', entityId: number): Promise<EntityFieldValues> {
    return this.httpClient.get<EntityFieldValues>(`/api/1.0/${entityType}s/${entityId}/fields`);
  }

  async updateEntityFields(entityType: 'task' | 'project' | 'user' | 'time_entry', entityId: number, data: UpdateEntityFieldsRequest): Promise<EntityFieldValues> {
    return this.httpClient.put<EntityFieldValues>(`/api/1.0/${entityType}s/${entityId}/fields`, data);
  }

  // Helper methods for filtering
  async getByType(type: 'text' | 'textarea' | 'number' | 'date' | 'datetime' | 'boolean' | 'select' | 'multiselect' | 'user' | 'email' | 'url' | 'currency', params?: Omit<FieldsQueryParams, 'type'>): Promise<FieldsListResponse> {
    return this.list({ ...params, type });
  }

  async getByEntity(entity: 'task' | 'project' | 'user' | 'time_entry', params?: Omit<FieldsQueryParams, 'entity'>): Promise<FieldsListResponse> {
    return this.list({ ...params, entity });
  }

  async getActive(params?: Omit<FieldsQueryParams, 'active'>): Promise<FieldsListResponse> {
    return this.list({ ...params, active: true });
  }

  async getInactive(params?: Omit<FieldsQueryParams, 'active'>): Promise<FieldsListResponse> {
    return this.list({ ...params, active: false });
  }

  async getRequired(params?: Omit<FieldsQueryParams, 'required'>): Promise<FieldsListResponse> {
    return this.list({ ...params, required: true });
  }

  async getOptional(params?: Omit<FieldsQueryParams, 'required'>): Promise<FieldsListResponse> {
    return this.list({ ...params, required: false });
  }

  async search(query: string, params?: Omit<FieldsQueryParams, 'search'>): Promise<FieldsListResponse> {
    return this.list({ ...params, search: query });
  }

  // Specific entity field helpers
  async getTaskFields(params?: Omit<FieldsQueryParams, 'entity'>): Promise<FieldsListResponse> {
    return this.getByEntity('task', params);
  }

  async getProjectFields(params?: Omit<FieldsQueryParams, 'entity'>): Promise<FieldsListResponse> {
    return this.getByEntity('project', params);
  }

  async getUserFields(params?: Omit<FieldsQueryParams, 'entity'>): Promise<FieldsListResponse> {
    return this.getByEntity('user', params);
  }

  async getTimeEntryFields(params?: Omit<FieldsQueryParams, 'entity'>): Promise<FieldsListResponse> {
    return this.getByEntity('time_entry', params);
  }

  // Field type helpers
  async getSelectFields(params?: Omit<FieldsQueryParams, 'type'>): Promise<FieldsListResponse> {
    return this.getByType('select', params);
  }

  async getMultiselectFields(params?: Omit<FieldsQueryParams, 'type'>): Promise<FieldsListResponse> {
    return this.getByType('multiselect', params);
  }

  async getTextFields(params?: Omit<FieldsQueryParams, 'type'>): Promise<FieldsListResponse> {
    return this.getByType('text', params);
  }

  async getDateFields(params?: Omit<FieldsQueryParams, 'type'>): Promise<FieldsListResponse> {
    return this.getByType('date', params);
  }

  async getNumberFields(params?: Omit<FieldsQueryParams, 'type'>): Promise<FieldsListResponse> {
    return this.getByType('number', params);
  }
}