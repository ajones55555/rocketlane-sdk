import { BaseResource } from '../utils/base-resource';

export interface ResourceAllocation {
  allocationId: number;
  projectId: number;
  projectName: string;
  userId: number;
  userFirstName: string;
  userLastName?: string;
  allocatedMinutes: number;
  startDate: string;
  endDate: string;
  createdAt: number;
  updatedAt: number;
}

export interface ResourceAllocationsListResponse {
  data: ResourceAllocation[];
  pagination: {
    pageSize: number;
    hasMore: boolean;
    totalRecordCount: number;
    nextPage?: string;
    nextPageToken?: string;
  };
}

export interface ResourceAllocationsQueryParams {
  pageSize?: number;
  pageToken?: string;
  projectId?: number;
  userId?: number;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  sortBy?: 'startDate' | 'endDate' | 'allocatedMinutes' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

export class ResourceAllocationsResource extends BaseResource {

  async list(params?: ResourceAllocationsQueryParams): Promise<ResourceAllocationsListResponse> {
    return this.httpClient.get<ResourceAllocationsListResponse>('/api/1.0/resource-allocations', params);
  }

  async getResourceAllocation(allocationId: number): Promise<ResourceAllocation> {
    return this.httpClient.get<ResourceAllocation>(`/api/1.0/resource-allocations/${allocationId}`);
  }

  async getByProject(projectId: number, params?: Omit<ResourceAllocationsQueryParams, 'projectId'>): Promise<ResourceAllocationsListResponse> {
    return this.list({ ...params, projectId });
  }

  async getByUser(userId: number, params?: Omit<ResourceAllocationsQueryParams, 'userId'>): Promise<ResourceAllocationsListResponse> {
    return this.list({ ...params, userId });
  }

  async getByDateRange(startDateFrom: string, startDateTo: string, params?: Omit<ResourceAllocationsQueryParams, 'startDateFrom' | 'startDateTo'>): Promise<ResourceAllocationsListResponse> {
    return this.list({ ...params, startDateFrom, startDateTo });
  }

  // Pagination helper methods
  async getNextPage(response: ResourceAllocationsListResponse, originalParams?: ResourceAllocationsQueryParams): Promise<ResourceAllocationsListResponse | null> {
    return this.getNextPageInternal(response, originalParams || {}, this.list.bind(this));
  }

  async getAllResourceAllocations(params?: ResourceAllocationsQueryParams): Promise<ResourceAllocation[]> {
    return this.getAllPages(params || {}, this.list.bind(this));
  }

  iterateResourceAllocationPages(params?: ResourceAllocationsQueryParams): AsyncGenerator<ResourceAllocationsListResponse, void, unknown> {
    return this.iteratePages(params || {}, this.list.bind(this));
  }

  iterateResourceAllocations(params?: ResourceAllocationsQueryParams): AsyncGenerator<ResourceAllocation, void, unknown> {
    return this.iterateItems(params || {}, this.list.bind(this));
  }
}