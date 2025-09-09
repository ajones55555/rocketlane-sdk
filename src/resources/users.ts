import { HttpClient } from '../utils/http-client';
import {
  User,
  UsersListResponse,
  UsersQueryParams,
  CreateUserRequest,
  UpdateUserRequest,
  InviteUserRequest,
  BulkInviteUsersRequest,
} from '../types/users';

export class UsersResource {
  constructor(private httpClient: HttpClient) {}

  async list(params?: UsersQueryParams): Promise<UsersListResponse> {
    return this.httpClient.get<UsersListResponse>('/api/1.0/users', params);
  }

  async get(userId: number, includeFields?: string): Promise<User> {
    const params = includeFields ? { includeFields } : undefined;
    return this.httpClient.get<User>(`/api/1.0/users/${userId}`, params);
  }

  async create(data: CreateUserRequest): Promise<User> {
    return this.httpClient.post<User>('/api/1.0/users', data);
  }

  async update(userId: number, data: UpdateUserRequest): Promise<User> {
    return this.httpClient.put<User>(`/api/1.0/users/${userId}`, data);
  }

  async delete(userId: number): Promise<void> {
    return this.httpClient.delete<void>(`/api/1.0/users/${userId}`);
  }

  async invite(data: InviteUserRequest): Promise<User> {
    return this.httpClient.post<User>('/api/1.0/users/invite', data);
  }

  async bulkInvite(data: BulkInviteUsersRequest): Promise<User[]> {
    return this.httpClient.post<User[]>('/api/1.0/users/bulk-invite', data);
  }

  async activate(userId: number): Promise<User> {
    return this.httpClient.post<User>(`/api/1.0/users/${userId}/activate`);
  }

  async deactivate(userId: number): Promise<User> {
    return this.httpClient.post<User>(`/api/1.0/users/${userId}/deactivate`);
  }

  async resendInvite(userId: number): Promise<void> {
    return this.httpClient.post<void>(`/api/1.0/users/${userId}/resend-invite`);
  }

  async getByCompany(companyId: number, params?: Omit<UsersQueryParams, 'companyId'>): Promise<UsersListResponse> {
    return this.list({ ...params, companyId });
  }

  async getByType(type: 'TEAM_MEMBER' | 'PARTNER' | 'CUSTOMER', params?: Omit<UsersQueryParams, 'type'>): Promise<UsersListResponse> {
    return this.list({ ...params, type });
  }

  async getByStatus(status: 'INACTIVE' | 'INVITED' | 'ACTIVE', params?: Omit<UsersQueryParams, 'status'>): Promise<UsersListResponse> {
    return this.list({ ...params, status });
  }

  async search(query: string, params?: Omit<UsersQueryParams, 'search'>): Promise<UsersListResponse> {
    return this.list({ ...params, search: query });
  }

  async getTeamMembers(params?: UsersQueryParams): Promise<UsersListResponse> {
    return this.getByType('TEAM_MEMBER', params);
  }

  async getPartners(params?: UsersQueryParams): Promise<UsersListResponse> {
    return this.getByType('PARTNER', params);
  }

  async getCustomers(params?: UsersQueryParams): Promise<UsersListResponse> {
    return this.getByType('CUSTOMER', params);
  }

  async getActive(params?: UsersQueryParams): Promise<UsersListResponse> {
    return this.getByStatus('ACTIVE', params);
  }

  async getInvited(params?: UsersQueryParams): Promise<UsersListResponse> {
    return this.getByStatus('INVITED', params);
  }

  async getInactive(params?: UsersQueryParams): Promise<UsersListResponse> {
    return this.getByStatus('INACTIVE', params);
  }
}