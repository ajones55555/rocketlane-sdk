import { BaseResource } from '../utils/base-resource';
import { NavigableUser, NavigableObjectFactory } from '../utils/relationship-navigation';
import {
  User,
  UsersListResponse,
  UsersQueryParams,
  CreateUserRequest,
  UpdateUserRequest,
  InviteUserRequest,
  BulkInviteUsersRequest,
} from '../types/users';

export class UsersResource extends BaseResource {
  private navFactory?: NavigableObjectFactory;

  async list(params?: UsersQueryParams): Promise<UsersListResponse> {
    return this.httpClient.get<UsersListResponse>('/api/1.0/users', params);
  }

  async getUser(userId: number, includeFields?: string): Promise<User> {
    const params = includeFields ? { includeFields } : undefined;
    return this.httpClient.get<User>(`/api/1.0/users/${userId}`, params);
  }

  async create(data: CreateUserRequest): Promise<User> {
    return this.httpClient.post<User>('/api/1.0/users', data);
  }

  async update(userId: number, data: UpdateUserRequest): Promise<User> {
    return this.httpClient.put<User>(`/api/1.0/users/${userId}`, data);
  }

  async deleteResource(userId: number): Promise<void> {
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

  // Pagination helper methods
  async getNextPage(response: UsersListResponse, originalParams?: UsersQueryParams): Promise<UsersListResponse | null> {
    return this.getNextPageInternal(response, originalParams || {}, this.list.bind(this));
  }

  async getAllUsers(params?: UsersQueryParams): Promise<User[]> {
    return this.getAllPages(params || {}, this.list.bind(this));
  }

  iterateUserPages(params?: UsersQueryParams): AsyncGenerator<UsersListResponse, void, unknown> {
    return this.iteratePages(params || {}, this.list.bind(this));
  }

  iterateUsers(params?: UsersQueryParams): AsyncGenerator<User, void, unknown> {
    return this.iterateItems(params || {}, this.list.bind(this));
  }

  // Relationship Navigation

  /**
   * Set the navigation factory (called by client)
   */
  setNavigationFactory(factory: NavigableObjectFactory): void {
    this.navFactory = factory;
  }

  /**
   * Get a navigable user with relationship methods
   */
  async getNavigable(userId: number): Promise<NavigableUser> {
    const user = await this.getUser(userId);
    if (!this.navFactory) {
      throw new Error('Navigation factory not initialized');
    }
    return this.navFactory.createNavigableUser(user);
  }

  /**
   * List users as navigable objects
   */
  async listNavigable(params?: UsersQueryParams): Promise<NavigableUser[]> {
    const response = await this.list(params);
    if (!this.navFactory) {
      throw new Error('Navigation factory not initialized');
    }
    return response.data.map(user => this.navFactory!.createNavigableUser(user));
  }

  /**
   * Get all users as navigable objects
   */
  async getAllNavigableUsers(params?: UsersQueryParams): Promise<NavigableUser[]> {
    const users = await this.getAllUsers(params);
    if (!this.navFactory) {
      throw new Error('Navigation factory not initialized');
    }
    return users.map(user => this.navFactory!.createNavigableUser(user));
  }
}