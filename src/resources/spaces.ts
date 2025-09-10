import { BaseResource } from '../utils/base-resource';

export interface Space {
  spaceId: number;
  spaceName: string;
  description?: string;
  type: 'project' | 'team' | 'company' | 'personal';
  visibility: 'public' | 'private' | 'restricted';
  ownerId: number;
  ownerFirstName: string;
  ownerLastName?: string;
  members: Array<{
    userId: number;
    firstName: string;
    lastName?: string;
    role: string;
  }>;
  projectId?: number;
  archived: boolean;
  createdAt: number;
  createdBy: {
    userId: number;
    firstName: string;
    lastName?: string;
  };
  updatedAt: number;
  updatedBy: {
    userId: number;
    firstName: string;
    lastName?: string;
  };
}

export interface SpacesListResponse {
  data: Space[];
  pagination: {
    pageSize: number;
    hasMore: boolean;
    totalRecordCount: number;
    nextPage?: string;
    nextPageToken?: string;
  };
}

export interface CreateSpaceRequest {
  spaceName: string;
  description?: string;
  type: 'project' | 'team' | 'company' | 'personal';
  visibility: 'public' | 'private' | 'restricted';
  projectId?: number;
  members?: number[];
  [key: string]: unknown;
}

export interface UpdateSpaceRequest {
  spaceName?: string;
  description?: string;
  visibility?: 'public' | 'private' | 'restricted';
  [key: string]: unknown;
}

export interface SpacesQueryParams {
  pageSize?: number;
  pageToken?: string;
  type?: 'project' | 'team' | 'company' | 'personal';
  visibility?: 'public' | 'private' | 'restricted';
  ownerId?: number;
  projectId?: number;
  archived?: boolean;
  search?: string;
  sortBy?: 'spaceName' | 'type' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface AddSpaceMembersRequest {
  members: Array<{
    userId: number;
    role: string;
  }>;
  [key: string]: unknown;
}

export interface RemoveSpaceMembersRequest {
  members: number[];
  [key: string]: unknown;
}

export class SpacesResource extends BaseResource {

  async list(params?: SpacesQueryParams): Promise<SpacesListResponse> {
    return this.httpClient.get<SpacesListResponse>('/api/1.0/spaces', params);
  }

  async getSpace(spaceId: number): Promise<Space> {
    return this.httpClient.get<Space>(`/api/1.0/spaces/${spaceId}`);
  }

  async create(data: CreateSpaceRequest): Promise<Space> {
    return this.httpClient.post<Space>('/api/1.0/spaces', data);
  }

  async update(spaceId: number, data: UpdateSpaceRequest): Promise<Space> {
    return this.httpClient.put<Space>(`/api/1.0/spaces/${spaceId}`, data);
  }

  async deleteResource(spaceId: number): Promise<void> {
    return this.httpClient.delete<void>(`/api/1.0/spaces/${spaceId}`);
  }

  async archive(spaceId: number): Promise<Space> {
    return this.httpClient.post<Space>(`/api/1.0/spaces/${spaceId}/archive`);
  }

  async unarchive(spaceId: number): Promise<Space> {
    return this.httpClient.post<Space>(`/api/1.0/spaces/${spaceId}/unarchive`);
  }

  async addMembers(spaceId: number, data: AddSpaceMembersRequest): Promise<Space> {
    return this.httpClient.post<Space>(`/api/1.0/spaces/${spaceId}/members`, data);
  }

  async removeMembers(spaceId: number, data: RemoveSpaceMembersRequest): Promise<Space> {
    return this.httpClient.delete<Space>(`/api/1.0/spaces/${spaceId}/members`, data);
  }

  async getByType(type: 'project' | 'team' | 'company' | 'personal', params?: Omit<SpacesQueryParams, 'type'>): Promise<SpacesListResponse> {
    return this.list({ ...params, type });
  }

  async getByVisibility(visibility: 'public' | 'private' | 'restricted', params?: Omit<SpacesQueryParams, 'visibility'>): Promise<SpacesListResponse> {
    return this.list({ ...params, visibility });
  }

  async getByOwner(ownerId: number, params?: Omit<SpacesQueryParams, 'ownerId'>): Promise<SpacesListResponse> {
    return this.list({ ...params, ownerId });
  }

  async getByProject(projectId: number, params?: Omit<SpacesQueryParams, 'projectId'>): Promise<SpacesListResponse> {
    return this.list({ ...params, projectId });
  }

  async getPublic(params?: Omit<SpacesQueryParams, 'visibility'>): Promise<SpacesListResponse> {
    return this.getByVisibility('public', params);
  }

  async getPrivate(params?: Omit<SpacesQueryParams, 'visibility'>): Promise<SpacesListResponse> {
    return this.getByVisibility('private', params);
  }

  async search(query: string, params?: Omit<SpacesQueryParams, 'search'>): Promise<SpacesListResponse> {
    return this.list({ ...params, search: query });
  }

  // Pagination helper methods
  async getNextPage(response: SpacesListResponse, originalParams?: SpacesQueryParams): Promise<SpacesListResponse | null> {
    return this.getNextPageInternal(response, originalParams || {}, this.list.bind(this));
  }

  async getAllSpaces(params?: SpacesQueryParams): Promise<Space[]> {
    return this.getAllPages(params || {}, this.list.bind(this));
  }

  iterateSpacePages(params?: SpacesQueryParams): AsyncGenerator<SpacesListResponse, void, unknown> {
    return this.iteratePages(params || {}, this.list.bind(this));
  }

  iterateSpaces(params?: SpacesQueryParams): AsyncGenerator<Space, void, unknown> {
    return this.iterateItems(params || {}, this.list.bind(this));
  }
}