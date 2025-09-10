import { BaseResource, PaginatedResponseWithHelpers } from '../utils/base-resource';
import { QueryBuilder, sql, SQLQueryResult, FieldSelection } from '../utils/query-builder';
import { NavigableTask, NavigableObjectFactory } from '../utils/relationship-navigation';
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

export class TasksResource extends BaseResource {
  private navFactory?: NavigableObjectFactory;

  async list(params?: TasksQueryParams): Promise<TasksListResponse> {
    return this.httpClient.get<TasksListResponse>('/api/1.0/tasks', params);
  }

  /**
   * List tasks with enhanced pagination methods on the response
   */
  async listWithPagination(params?: TasksQueryParams): Promise<PaginatedResponseWithHelpers<Task, TasksQueryParams>> {
    const response = await this.list(params);
    return this.enhanceResponse(response, params || {}, this.list.bind(this));
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

  async deleteResource(taskId: number): Promise<void> {
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

  // Pagination helper methods
  async getNextPage(response: TasksListResponse, originalParams?: TasksQueryParams): Promise<TasksListResponse | null> {
    return this.getNextPageInternal(response, originalParams || {}, this.list.bind(this));
  }

  async getAllTasks(params?: TasksQueryParams): Promise<Task[]> {
    return this.getAllPages(params || {}, this.list.bind(this));
  }

  iterateTaskPages(params?: TasksQueryParams): AsyncGenerator<TasksListResponse, void, unknown> {
    return this.iteratePages(params || {}, this.list.bind(this));
  }

  iterateTasks(params?: TasksQueryParams): AsyncGenerator<Task, void, unknown> {
    return this.iterateItems(params || {}, this.list.bind(this));
  }

  // Advanced Query Capabilities

  /**
   * Create a query builder for advanced task querying
   */
  queryBuilder(): QueryBuilder<Task> {
    return this.createQueryBuilder<Task>('tasks');
  }

  /**
   * Execute a query built with QueryBuilder
   */
  async query(queryBuilder: QueryBuilder<Task>): Promise<SQLQueryResult<Task>> {
    return this.executeQuery(queryBuilder, this.list.bind(this));
  }

  /**
   * Execute SQL-like queries using template literals
   */
  async querySQL(sqlTemplate: ReturnType<typeof sql<Task>>): Promise<SQLQueryResult<Task>> {
    return this.executeSQL(sqlTemplate, this.list.bind(this));
  }

  /**
   * List tasks with GraphQL-style field selection
   */
  async listWithFields(params: TasksQueryParams, selection: FieldSelection): Promise<TasksListResponse> {
    const response = await this.list(params);
    return this.applyFieldSelection(response, selection) as TasksListResponse;
  }

  /**
   * Advanced query methods with fluent interface
   */

  // Find tasks in a specific project
  forProject(projectId: number): QueryBuilder<Task> {
    const builder = this.queryBuilder().whereEquals('projectId', projectId);
    this.bindExecutorToBuilder(builder);
    return builder;
  }

  private bindExecutorToBuilder(builder: QueryBuilder<Task>): void {
    builder.execute = () => this.query(builder);
    
    // Bind all query methods to work on the existing builder
    (builder as any).forProject = (projectId: number) => {
      builder.whereEquals('projectId', projectId);
      this.bindExecutorToBuilder(builder);
      return builder;
    };
    
    (builder as any).withStatus = (status: number | string) => {
      builder.whereEquals('status', status);
      this.bindExecutorToBuilder(builder);
      return builder;
    };
    
    (builder as any).assignedTo = (userId: number | number[]) => {
      if (Array.isArray(userId)) {
        builder.whereIn('assigneeId', userId);
      } else {
        builder.whereEquals('assigneeId', userId);
      }
      this.bindExecutorToBuilder(builder);
      return builder;
    };
    
    (builder as any).dueBetween = (startDate: string, endDate: string) => {
      builder.whereBetween('dueDate', startDate, endDate);
      this.bindExecutorToBuilder(builder);
      return builder;
    };
    
    (builder as any).nameContains = (text: string) => {
      builder.whereContains('taskName', text);
      this.bindExecutorToBuilder(builder);
      return builder;
    };
    
    (builder as any).overdue = () => {
      const today = new Date().toISOString().split('T')[0];
      builder.whereLessThan('dueDate', today).whereNotEquals('status', 'completed');
      this.bindExecutorToBuilder(builder);
      return builder;
    };
    
    (builder as any).highPriority = () => {
      builder.whereGreaterThan('priority', 3);
      this.bindExecutorToBuilder(builder);
      return builder;
    };
    
    (builder as any).withEffortMoreThan = (minutes: number) => {
      builder.whereGreaterThan('effortInMinutes', minutes);
      this.bindExecutorToBuilder(builder);
      return builder;
    };
  }

  // Find tasks assigned to specific users  
  assignedTo(userId: number | number[]): QueryBuilder<Task> {
    let builder;
    if (Array.isArray(userId)) {
      builder = this.queryBuilder().whereIn('assigneeId', userId);
    } else {
      builder = this.queryBuilder().whereEquals('assigneeId', userId);
    }
    this.bindExecutorToBuilder(builder);
    return builder;
  }

  // Find tasks due within a date range
  dueBetween(startDate: string, endDate: string): QueryBuilder<Task> {
    const builder = this.queryBuilder().whereBetween('dueDate', startDate, endDate);
    this.bindExecutorToBuilder(builder);
    return builder;
  }

  // Find tasks with specific status
  withStatus(status: number | string): QueryBuilder<Task> {
    const builder = this.queryBuilder().whereEquals('status', status);
    this.bindExecutorToBuilder(builder);
    return builder;
  }

  // Find tasks containing text in name
  nameContains(text: string): QueryBuilder<Task> {
    const builder = this.queryBuilder().whereContains('taskName', text);
    this.bindExecutorToBuilder(builder);
    return builder;
  }

  // Find overdue tasks
  overdue(): QueryBuilder<Task> {
    const today = new Date().toISOString().split('T')[0];
    const builder = this.queryBuilder()
      .whereLessThan('dueDate', today)
      .whereNotEquals('status', 'completed'); // Assuming completed status
    this.bindExecutorToBuilder(builder);
    return builder;
  }

  // Find high priority tasks
  highPriority(): QueryBuilder<Task> {
    const builder = this.queryBuilder().whereGreaterThan('priority', 3);
    this.bindExecutorToBuilder(builder);
    return builder;
  }

  // Find tasks with substantial effort
  withEffortMoreThan(minutes: number): QueryBuilder<Task> {
    const builder = this.queryBuilder().whereGreaterThan('effortInMinutes', minutes);
    this.bindExecutorToBuilder(builder);
    return builder;
  }

  // Chainable query examples
  async findCriticalTasks(projectId?: number): Promise<SQLQueryResult<Task>> {
    let query = this.queryBuilder()
      .whereGreaterThan('priority', 3)
      .whereLessThan('dueDate', new Date().toISOString())
      .whereNotEquals('status', 'completed')
      .orderBy('dueDate', 'asc')
      .limit(50);

    if (projectId) {
      query = query.whereEquals('projectId', projectId);
    }

    return this.query(query);
  }

  async findTeamWorkload(assigneeIds: number[], dateFrom: string, dateTo: string): Promise<SQLQueryResult<Task>> {
    const query = this.queryBuilder()
      .whereIn('assigneeId', assigneeIds)
      .whereBetween('dueDate', dateFrom, dateTo)
      .select(['taskName', 'assigneeId', 'effortInMinutes', 'status', 'dueDate'])
      .orderBy('assigneeId', 'asc')
      .orderBy('dueDate', 'asc');

    return this.query(query);
  }

  // Relationship Navigation

  /**
   * Set the navigation factory (called by client)
   */
  setNavigationFactory(factory: NavigableObjectFactory): void {
    this.navFactory = factory;
  }

  /**
   * Get a navigable task with relationship methods
   */
  async getNavigable(taskId: number): Promise<NavigableTask> {
    const task = await this.get(taskId);
    if (!this.navFactory) {
      throw new Error('Navigation factory not initialized');
    }
    return this.navFactory.createNavigableTask(task);
  }

  /**
   * List tasks as navigable objects
   */
  async listNavigable(params?: TasksQueryParams): Promise<NavigableTask[]> {
    const response = await this.list(params);
    if (!this.navFactory) {
      throw new Error('Navigation factory not initialized');
    }
    return response.data.map(task => this.navFactory!.createNavigableTask(task));
  }

  /**
   * Get all tasks as navigable objects
   */
  async getAllNavigableTasks(params?: TasksQueryParams): Promise<NavigableTask[]> {
    const tasks = await this.getAllTasks(params);
    if (!this.navFactory) {
      throw new Error('Navigation factory not initialized');
    }
    return tasks.map(task => this.navFactory!.createNavigableTask(task));
  }
}