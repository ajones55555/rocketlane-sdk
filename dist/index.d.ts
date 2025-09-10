type ExportFormat = 'csv' | 'xlsx' | 'json' | 'xml' | 'pdf';
type ErrorHandlingMode = 'stop' | 'skip' | 'collect';
interface ExportOptions {
    format: ExportFormat;
    filename?: string;
    fields?: string[];
    includeHeaders?: boolean;
    dateFormat?: string;
    encoding?: string;
    delimiter?: string;
    sheetName?: string;
    template?: string;
    compress?: boolean;
}
interface ImportOptions {
    mapping?: Record<string, string>;
    validateFirst?: boolean;
    onError?: ErrorHandlingMode;
    skipRows?: number;
    maxRows?: number;
    dateFormat?: string;
    batchSize?: number;
    dryRun?: boolean;
}
interface ExportResult {
    filename: string;
    format: ExportFormat;
    recordCount: number;
    fileSize: number;
    downloadUrl?: string;
    exportedAt: Date;
    fields: string[];
}
interface ImportResult<T> {
    success: boolean;
    imported: T[];
    errors: ImportError[];
    skipped: number;
    total: number;
    importedAt: Date;
    dryRun: boolean;
}
interface ImportError {
    row: number;
    field?: string;
    value?: any;
    error: string;
    data?: Record<string, any>;
}
interface ValidationResult {
    valid: boolean;
    errors: ImportError[];
    warnings: string[];
    preview: Record<string, any>[];
}

interface RocketlaneConfig {
    apiKey: string;
    baseUrl?: string;
    timeout?: number;
    retries?: number;
}
interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
}
interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
interface RocketlanePagination {
    pageSize: number;
    hasMore: boolean;
    totalRecordCount: number;
    nextPage?: string;
    nextPageToken?: string;
}
interface BasePaginatedResponse<T> {
    data: T[];
    pagination: RocketlanePagination;
}
interface PaginationOptions {
    pageSize?: number;
    pageToken?: string;
    [key: string]: unknown;
}
interface QueryParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    filter?: Record<string, unknown>;
}
interface RocketlaneError extends Error {
    statusCode?: number;
    response?: {
        data?: unknown;
        status?: number;
        statusText?: string;
    };
}
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
interface RequestConfig {
    method: HttpMethod;
    url: string;
    data?: unknown;
    params?: Record<string, unknown> | undefined;
    headers?: Record<string, string>;
}

declare class HttpClient {
    private client;
    private config;
    constructor(config: RocketlaneConfig);
    private setupInterceptors;
    request<T>(config: RequestConfig): Promise<T>;
    private shouldRetry;
    private delay;
    get<T>(url: string, params?: Record<string, unknown>): Promise<T>;
    post<T>(url: string, data?: unknown, params?: Record<string, unknown>): Promise<T>;
    put<T>(url: string, data?: unknown, params?: Record<string, unknown>): Promise<T>;
    patch<T>(url: string, data?: unknown, params?: Record<string, unknown>): Promise<T>;
    delete<T>(url: string, params?: Record<string, unknown>): Promise<T>;
}

type SortOrder = 'asc' | 'desc' | 'ASC' | 'DESC';
type ComparisonOperator = '=' | '!=' | '<>' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN' | 'NOT IN' | 'CONTAINS' | 'NOT CONTAINS' | 'BETWEEN' | 'NOT BETWEEN';
interface SQLQueryResult<T> {
    data: T[];
    query: string;
    params: Record<string, any>;
    executedAt: Date;
    count: number;
}
declare class QueryBuilder<T = any> {
    private conditions;
    private options;
    private tableName;
    constructor(tableName: string);
    where(field: string, operator: ComparisonOperator, value: any, value2?: any): this;
    whereEquals(field: string, value: any): this;
    whereNotEquals(field: string, value: any): this;
    whereGreaterThan(field: string, value: any): this;
    whereLessThan(field: string, value: any): this;
    whereBetween(field: string, value1: any, value2: any): this;
    whereIn(field: string, values: any[]): this;
    whereContains(field: string, value: any): this;
    whereNotContains(field: string, value: any): this;
    whereNotIn(field: string, values: any[]): this;
    whereLike(field: string, value: string): this;
    select(fields: Record<string, any> | string[]): this;
    orderBy(field: string, direction?: SortOrder): this;
    groupBy(...fields: string[]): this;
    limit(count: number): this;
    offset(count: number): this;
    execute(): Promise<SQLQueryResult<T>>;
    build(): {
        params: Record<string, any>;
        select?: Record<string, any> | string[];
        sql?: string;
    };
    private toSQL;
    private getSelectClause;
    private conditionToSQL;
    private formatValue;
    private getParamKey;
}
declare function sql<T = any>(strings: TemplateStringsArray, ...values: any[]): {
    query: string;
    params: any[];
    parse: () => {
        tableName: string;
        conditions: any;
        options: any;
    };
};
interface FieldSelection {
    [key: string]: boolean | FieldSelection;
}

interface PaginatedResponseWithHelpers<T, P extends PaginationOptions> extends BasePaginatedResponse<T> {
    getNextPage(): Promise<PaginatedResponseWithHelpers<T, P> | null>;
    getAllRemaining(): Promise<T[]>;
    iterateRemainingPages(): AsyncGenerator<PaginatedResponseWithHelpers<T, P>, void, unknown>;
    iterateRemainingItems(): AsyncGenerator<T, void, unknown>;
}
declare abstract class BaseResource {
    protected httpClient: HttpClient;
    constructor(httpClient: HttpClient);
    /**
     * Enhance a paginated response with helper methods
     */
    protected enhanceResponse<T, P extends PaginationOptions>(response: BasePaginatedResponse<T>, originalParams: P, listMethod: (params: P) => Promise<BasePaginatedResponse<T>>): PaginatedResponseWithHelpers<T, P>;
    /**
     * Get the next page from a paginated response
     */
    protected getNextPageInternal<T, P extends PaginationOptions>(response: BasePaginatedResponse<T>, originalParams: P, listMethod: (params: P) => Promise<BasePaginatedResponse<T>>): Promise<BasePaginatedResponse<T> | null>;
    /**
     * Get all pages from a paginated endpoint
     */
    protected getAllPages<T, P extends PaginationOptions>(params: P, listMethod: (params: P) => Promise<BasePaginatedResponse<T>>, maxPages?: number): Promise<T[]>;
    /**
     * Create an async iterator for paginated results
     */
    protected iteratePages<T, P extends PaginationOptions>(params: P, listMethod: (params: P) => Promise<BasePaginatedResponse<T>>): AsyncGenerator<BasePaginatedResponse<T>, void, unknown>;
    /**
     * Create an async iterator for individual items across all pages
     */
    protected iterateItems<T, P extends PaginationOptions>(params: P, listMethod: (params: P) => Promise<BasePaginatedResponse<T>>): AsyncGenerator<T, void, unknown>;
    /**
     * Create a query builder for advanced querying
     */
    protected createQueryBuilder<T>(tableName: string): QueryBuilder<T>;
    /**
     * Execute a query built with QueryBuilder
     */
    protected executeQuery<T, P extends PaginationOptions>(queryBuilder: QueryBuilder<T>, listMethod: (params: P) => Promise<BasePaginatedResponse<T>>): Promise<SQLQueryResult<T>>;
    /**
     * Execute raw SQL-like queries using template literals
     */
    protected executeSQL<T, P extends PaginationOptions>(sqlTemplate: ReturnType<typeof sql<T>>, listMethod: (params: P) => Promise<BasePaginatedResponse<T>>): Promise<SQLQueryResult<T>>;
    /**
     * Apply GraphQL-style field selection to a list response
     */
    protected applyFieldSelection<T>(response: BasePaginatedResponse<T>, selection: FieldSelection): BasePaginatedResponse<Partial<T>>;
    /**
     * Convert parsed SQL conditions to API parameters
     */
    private convertSQLToAPIParams;
}

interface User$1 {
    emailId: string;
    userId: number;
    firstName: string;
    lastName?: string;
}
interface Project$1 {
    projectId: number;
    projectName: string;
}
interface TaskStatus {
    value: number;
    label: string;
}
interface TaskField {
    fieldId: string;
    fieldName: string;
    value: unknown;
    type: string;
}
interface Task {
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
    createdBy: User$1;
    updatedBy: User$1;
    project: Project$1;
    status: TaskStatus;
    fields: TaskField[];
    private: boolean;
    assignees?: User$1[];
    followers?: User$1[];
    dependencies?: TaskDependency[];
    phase?: Phase$1;
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
interface TaskDependency {
    dependentTaskId: number;
    dependentTaskName: string;
    dependencyType: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
}
interface Phase$1 {
    phaseId: number;
    phaseName: string;
}
interface TaskPriority {
    value: number;
    label: string;
}
interface TasksListResponse {
    data: Task[];
    pagination: {
        pageSize: number;
        hasMore: boolean;
        totalRecordCount: number;
        nextPage?: string;
        nextPageToken?: string;
    };
}
interface CreateTaskRequest {
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
interface UpdateTaskRequest {
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
interface TasksQueryParams {
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
interface AddAssigneesRequest {
    assignees: number[];
    [key: string]: unknown;
}
interface RemoveAssigneesRequest {
    assignees: number[];
    [key: string]: unknown;
}
interface AddFollowersRequest {
    followers: number[];
    [key: string]: unknown;
}
interface RemoveFollowersRequest {
    followers: number[];
    [key: string]: unknown;
}
interface AddDependenciesRequest {
    dependencies: {
        taskId: number;
        dependencyType: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
    }[];
    [key: string]: unknown;
}
interface RemoveDependenciesRequest {
    dependencies: number[];
    [key: string]: unknown;
}
interface MoveTaskToPhaseRequest {
    phaseId: number;
    position?: number;
    [key: string]: unknown;
}
interface BulkUpdateTasksRequest {
    taskIds: number[];
    updates: UpdateTaskRequest;
    [key: string]: unknown;
}

interface ProjectOwner {
    emailId: string;
    userId: number;
    firstName: string;
    lastName?: string;
}
interface ProjectMember {
    emailId: string;
    userId: number;
    firstName: string;
    lastName?: string;
    role?: string;
}
interface ProjectStatus {
    value: number;
    label: string;
}
interface ProjectField {
    fieldId: string;
    fieldName: string;
    value: unknown;
    type: string;
}
interface PartnerCompany {
    companyId: number;
    companyName: string;
}
interface Project {
    projectId: number;
    projectName: string;
    createdAt: number;
    updatedAt?: number;
    startDate?: string;
    dueDate?: string;
    owner: ProjectOwner;
    teamMembers?: ProjectMember[];
    companyId: number;
    status: ProjectStatus;
    visibility: 'EVERYONE' | 'MEMBERS';
    archived: boolean;
    createdBy: ProjectOwner;
    partnerCompanies?: PartnerCompany[];
    fields?: ProjectField[];
    description?: string;
    budget?: number;
    currency?: string;
    tags?: string[];
    templateId?: number;
    templateName?: string;
}
interface ProjectsListResponse {
    data: Project[];
    pagination: {
        pageSize: number;
        hasMore: boolean;
        totalRecordCount: number;
        nextPage?: string;
        nextPageToken?: string;
    };
}
interface CreateProjectRequest {
    projectName: string;
    companyId: number;
    startDate?: string;
    dueDate?: string;
    ownerId?: number;
    teamMembers?: number[];
    visibility?: 'EVERYONE' | 'MEMBERS';
    description?: string;
    budget?: number;
    currency?: string;
    tags?: string[];
    templateId?: number;
    fields?: Record<string, unknown>;
    partnerCompanies?: number[];
    [key: string]: unknown;
}
interface UpdateProjectRequest {
    projectName?: string;
    startDate?: string;
    dueDate?: string;
    ownerId?: number;
    visibility?: 'EVERYONE' | 'MEMBERS';
    description?: string;
    budget?: number;
    currency?: string;
    tags?: string[];
    fields?: Record<string, unknown>;
    status?: number;
    [key: string]: unknown;
}
interface ProjectsQueryParams {
    pageSize?: number;
    pageToken?: string;
    companyId?: number;
    ownerId?: number;
    status?: number;
    visibility?: 'EVERYONE' | 'MEMBERS';
    archived?: boolean;
    startDateFrom?: string;
    startDateTo?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
    search?: string;
    sortBy?: 'projectName' | 'startDate' | 'dueDate' | 'createdAt' | 'updatedAt' | 'status';
    sortOrder?: 'asc' | 'desc';
    includeFields?: string;
    [key: string]: unknown;
}
interface AddProjectMembersRequest {
    members: number[];
    [key: string]: unknown;
}
interface RemoveProjectMembersRequest {
    members: number[];
    [key: string]: unknown;
}
interface ImportTemplateRequest {
    templateId: number;
    startDate?: string;
    [key: string]: unknown;
}
interface AssignPlaceholderRequest {
    placeholderId: number;
    userId: number;
    [key: string]: unknown;
}
interface UnassignPlaceholderRequest {
    placeholderId: number;
    [key: string]: unknown;
}

interface UserCompany {
    companyId: number;
    companyName: string;
}
interface UserPermission {
    [key: string]: boolean | string | number;
}
interface UserField {
    fieldId: string;
    fieldName: string;
    value: string | number | unknown[];
    type: string;
}
interface User {
    userId: number;
    email: string;
    emailId: string;
    firstName: string;
    lastName?: string;
    type: 'TEAM_MEMBER' | 'PARTNER' | 'CUSTOMER';
    status: 'INACTIVE' | 'INVITED' | 'ACTIVE';
    role?: string;
    company: UserCompany;
    permission?: UserPermission;
    fields?: UserField[];
    capacityInMinutes?: number;
    holidayCalendar?: string;
    profilePictureUrl?: string;
    createdAt: number;
    createdBy: User;
    updatedAt?: number;
    updatedBy?: User;
    timezone?: string;
    workingDays?: string[];
    workingHours?: {
        start: string;
        end: string;
    };
    isActive?: boolean;
    phone?: string;
    title?: string;
    department?: string;
    location?: string;
}
interface UsersListResponse {
    data: User[];
    pagination: {
        pageSize: number;
        hasMore: boolean;
        totalRecordCount: number;
        nextPage?: string;
        nextPageToken?: string;
    };
}
interface UsersQueryParams {
    pageSize?: number;
    pageToken?: string;
    type?: 'TEAM_MEMBER' | 'PARTNER' | 'CUSTOMER';
    status?: 'INACTIVE' | 'INVITED' | 'ACTIVE';
    companyId?: number;
    role?: string;
    search?: string;
    sortBy?: 'firstName' | 'lastName' | 'email' | 'createdAt' | 'updatedAt' | 'status' | 'type';
    sortOrder?: 'asc' | 'desc';
    includeFields?: string;
    [key: string]: unknown;
}
interface CreateUserRequest {
    email: string;
    firstName: string;
    lastName?: string;
    type: 'TEAM_MEMBER' | 'PARTNER' | 'CUSTOMER';
    companyId: number;
    role?: string;
    capacityInMinutes?: number;
    holidayCalendar?: string;
    timezone?: string;
    workingDays?: string[];
    workingHours?: {
        start: string;
        end: string;
    };
    phone?: string;
    title?: string;
    department?: string;
    location?: string;
    fields?: Record<string, unknown>;
    [key: string]: unknown;
}
interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    role?: string;
    capacityInMinutes?: number;
    holidayCalendar?: string;
    timezone?: string;
    workingDays?: string[];
    workingHours?: {
        start: string;
        end: string;
    };
    phone?: string;
    title?: string;
    department?: string;
    location?: string;
    fields?: Record<string, unknown>;
    status?: 'INACTIVE' | 'INVITED' | 'ACTIVE';
    [key: string]: unknown;
}
interface InviteUserRequest {
    email: string;
    firstName: string;
    lastName?: string;
    type: 'TEAM_MEMBER' | 'PARTNER' | 'CUSTOMER';
    companyId: number;
    role?: string;
    message?: string;
    [key: string]: unknown;
}
interface BulkInviteUsersRequest {
    users: InviteUserRequest[];
    [key: string]: unknown;
}

interface Phase {
    phaseId: number;
    phaseName: string;
    description?: string;
    projectId: number;
    position: number;
    startDate?: string;
    dueDate?: string;
    status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
    color?: string;
    archived: boolean;
    taskCount?: number;
    completedTaskCount?: number;
    progress?: number;
    createdAt: number;
    createdBy: {
        userId: number;
        firstName: string;
        lastName?: string;
    };
    updatedAt?: number;
    updatedBy?: {
        userId: number;
        firstName: string;
        lastName?: string;
    };
}
interface PhasesListResponse {
    data: Phase[];
    pagination: {
        pageSize: number;
        hasMore: boolean;
        totalRecordCount: number;
        nextPage?: string;
        nextPageToken?: string;
    };
}
interface CreatePhaseRequest {
    phaseName: string;
    projectId: number;
    description?: string;
    startDate?: string;
    dueDate?: string;
    color?: string;
    position?: number;
    [key: string]: unknown;
}
interface UpdatePhaseRequest {
    phaseName?: string;
    description?: string;
    startDate?: string;
    dueDate?: string;
    color?: string;
    status?: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
    [key: string]: unknown;
}
interface PhasesQueryParams {
    pageSize?: number;
    pageToken?: string;
    projectId?: number;
    status?: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
    archived?: boolean;
    startDateFrom?: string;
    startDateTo?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
    search?: string;
    sortBy?: 'phaseName' | 'startDate' | 'dueDate' | 'createdAt' | 'updatedAt' | 'position' | 'status';
    sortOrder?: 'asc' | 'desc';
    [key: string]: unknown;
}
interface ReorderPhasesRequest {
    phaseIds: number[];
    [key: string]: unknown;
}
interface BulkUpdatePhasesRequest {
    phaseIds: number[];
    updates: UpdatePhaseRequest;
    [key: string]: unknown;
}
interface DuplicatePhaseRequest {
    newPhaseName: string;
    projectId?: number;
    includeTasks?: boolean;
    [key: string]: unknown;
}

interface TimeEntryUser {
    emailId: string;
    userId: number;
    firstName: string;
    lastName?: string;
}
interface TimeEntryProject {
    projectId: number;
    projectName: string;
}
interface TimeEntryPhase {
    phaseId: number;
    phaseName: string;
}
interface TimeEntry {
    timeEntryId: number;
    date: string;
    minutes: number;
    project: TimeEntryProject;
    projectPhase?: TimeEntryPhase;
    createdAt: number;
    updatedAt: number;
    billable: boolean;
    user: TimeEntryUser;
    category: TimeEntryCategory;
    description?: string;
    task?: {
        taskId: number;
        taskName: string;
    };
    approved?: boolean;
    approvedBy?: TimeEntryUser;
    approvedAt?: number;
    invoiced?: boolean;
    rate?: number;
    amount?: number;
    currency?: string;
    fields?: Record<string, unknown>;
}
interface TimeEntriesListResponse {
    data: TimeEntry[];
    pagination: {
        pageSize: number;
        hasMore: boolean;
        totalRecordCount: number;
        nextPage?: string;
        nextPageToken?: string;
    };
}
interface CreateTimeEntryRequest {
    date: string;
    minutes: number;
    projectId: number;
    phaseId?: number;
    taskId?: number;
    categoryId: number;
    billable?: boolean;
    description?: string;
    userId?: number;
    fields?: Record<string, unknown>;
    [key: string]: unknown;
}
interface UpdateTimeEntryRequest {
    date?: string;
    minutes?: number;
    projectId?: number;
    phaseId?: number;
    taskId?: number;
    categoryId?: number;
    billable?: boolean;
    description?: string;
    fields?: Record<string, unknown>;
    [key: string]: unknown;
}
interface TimeEntriesQueryParams {
    pageSize?: number;
    pageToken?: string;
    projectId?: number;
    phaseId?: number;
    taskId?: number;
    userId?: number;
    categoryId?: number;
    billable?: boolean;
    approved?: boolean;
    invoiced?: boolean;
    dateFrom?: string;
    dateTo?: string;
    createdFrom?: string;
    createdTo?: string;
    search?: string;
    sortBy?: 'date' | 'minutes' | 'createdAt' | 'updatedAt' | 'project' | 'user';
    sortOrder?: 'asc' | 'desc';
    includeFields?: string;
    [key: string]: unknown;
}
interface BulkCreateTimeEntriesRequest {
    entries: CreateTimeEntryRequest[];
    [key: string]: unknown;
}
interface BulkUpdateTimeEntriesRequest {
    timeEntryIds: number[];
    updates: UpdateTimeEntryRequest;
    [key: string]: unknown;
}
interface BulkDeleteTimeEntriesRequest {
    timeEntryIds: number[];
    [key: string]: unknown;
}
interface ApproveTimeEntriesRequest {
    timeEntryIds: number[];
    [key: string]: unknown;
}
interface RejectTimeEntriesRequest {
    timeEntryIds: number[];
    reason?: string;
    [key: string]: unknown;
}
interface TimeEntryCategory {
    categoryId: number;
    categoryName: string;
}
interface TimeEntryCategory {
    categoryId: number;
    categoryName: string;
    description?: string;
    active?: boolean;
    billable?: boolean;
    rate?: number;
    currency?: string;
    createdAt?: number;
    updatedAt?: number;
}
interface TimeEntryCategoriesListResponse {
    data: TimeEntryCategory[];
    pagination: {
        pageSize: number;
        hasMore: boolean;
        totalRecordCount: number;
        nextPage?: string;
        nextPageToken?: string;
    };
}
interface CreateTimeEntryCategoryRequest {
    categoryName: string;
    description?: string;
    billable?: boolean;
    rate?: number;
    currency?: string;
    [key: string]: unknown;
}
interface UpdateTimeEntryCategoryRequest {
    categoryName?: string;
    description?: string;
    billable?: boolean;
    rate?: number;
    currency?: string;
    active?: boolean;
    [key: string]: unknown;
}
interface TimeEntryReport {
    totalMinutes: number;
    totalBillableMinutes: number;
    totalNonBillableMinutes: number;
    totalAmount?: number;
    currency?: string;
    breakdown: {
        byProject: Array<{
            project: TimeEntryProject;
            minutes: number;
            billableMinutes: number;
            amount?: number;
        }>;
        byUser: Array<{
            user: TimeEntryUser;
            minutes: number;
            billableMinutes: number;
            amount?: number;
        }>;
        byCategory: Array<{
            category: TimeEntryCategory;
            minutes: number;
            billableMinutes: number;
            amount?: number;
        }>;
    };
}
interface TimeEntryReportParams {
    projectId?: number;
    userId?: number;
    categoryId?: number;
    dateFrom?: string;
    dateTo?: string;
    billable?: boolean;
    approved?: boolean;
    groupBy?: 'project' | 'user' | 'category' | 'date';
    [key: string]: unknown;
}

interface NavigableTask extends Task {
    getProject(): Promise<NavigableProject>;
    getPhase(): Promise<NavigablePhase | null>;
    getAssignees(): Promise<NavigableUser[]>;
    getFollowers(): Promise<NavigableUser[]>;
    getCreatedBy(): Promise<NavigableUser>;
    getUpdatedBy(): Promise<NavigableUser>;
    getDependencies(): Promise<NavigableTask[]>;
    getDependents(): Promise<NavigableTask[]>;
    getSiblings(): Promise<NavigableTask[]>;
    getSubtasks(): Promise<NavigableTask[]>;
    getParent(): Promise<NavigableTask | null>;
    getTimeEntries(): Promise<NavigableTimeEntry[]>;
    getTotalTimeSpent(): Promise<number>;
    isOverdue(): boolean;
    isHighPriority(): boolean;
    getProgressPercentage(): number;
    _client: RocketlaneClient;
}
interface NavigableProject extends Project {
    getTasks(params?: Omit<TasksQueryParams, 'projectId'>): Promise<NavigableTask[]>;
    getOverdueTasks(): Promise<NavigableTask[]>;
    getTasksByPhase(phaseId: number): Promise<NavigableTask[]>;
    getTasksByAssignee(userId: number): Promise<NavigableTask[]>;
    getPhases(): Promise<NavigablePhase[]>;
    getActivePhases(): Promise<NavigablePhase[]>;
    getTeamMembers(): Promise<NavigableUser[]>;
    getOwner(): Promise<NavigableUser>;
    getTimeEntries(params?: Omit<TimeEntriesQueryParams, 'projectId'>): Promise<NavigableTimeEntry[]>;
    getTotalTimeSpent(): Promise<number>;
    getCompletionPercentage(): Promise<number>;
    getProjectHealth(): Promise<ProjectHealth>;
    _client: RocketlaneClient;
}
interface NavigableUser extends User {
    getAssignedTasks(params?: Omit<TasksQueryParams, 'assigneeId'>): Promise<NavigableTask[]>;
    getFollowedTasks(): Promise<NavigableTask[]>;
    getOverdueTasks(): Promise<NavigableTask[]>;
    getProjects(): Promise<NavigableProject[]>;
    getOwnedProjects(): Promise<NavigableProject[]>;
    getTimeEntries(params?: Omit<TimeEntriesQueryParams, 'userId'>): Promise<NavigableTimeEntry[]>;
    getTotalHoursThisWeek(): Promise<number>;
    getTotalHoursThisMonth(): Promise<number>;
    getWorkloadAnalysis(dateFrom: string, dateTo: string): Promise<WorkloadAnalysis>;
    _client: RocketlaneClient;
}
interface NavigablePhase extends Phase {
    getTasks(params?: Omit<TasksQueryParams, 'phaseId'>): Promise<NavigableTask[]>;
    getCompletedTasks(): Promise<NavigableTask[]>;
    getPendingTasks(): Promise<NavigableTask[]>;
    getProject(): Promise<NavigableProject>;
    getNextPhase(): Promise<NavigablePhase | null>;
    getPreviousPhase(): Promise<NavigablePhase | null>;
    getCompletionPercentage(): Promise<number>;
    getEstimatedTimeRemaining(): Promise<number>;
    _client: RocketlaneClient;
}
interface NavigableTimeEntry extends TimeEntry {
    getProject(): Promise<NavigableProject>;
    getPhase(): Promise<NavigablePhase | null>;
    getTask(): Promise<NavigableTask | null>;
    getUser(): Promise<NavigableUser>;
    _client: RocketlaneClient;
}
interface ProjectHealth {
    overallScore: number;
    tasksOnTrack: number;
    tasksAtRisk: number;
    tasksOverdue: number;
    teamUtilization: number;
    budgetUtilization?: number;
    estimatedCompletionDate?: string;
    risks: string[];
    recommendations: string[];
}
interface WorkloadAnalysis {
    totalHours: number;
    averageHoursPerDay: number;
    peakDays: Array<{
        date: string;
        hours: number;
    }>;
    projectBreakdown: Array<{
        project: string;
        hours: number;
        percentage: number;
    }>;
    utilizationScore: number;
    recommendations: string[];
}
declare class NavigableObjectFactory {
    private client;
    constructor(client: RocketlaneClient);
    createNavigableTask(task: Task): NavigableTask;
    createNavigableProject(project: Project): NavigableProject;
    createNavigableUser(user: User): NavigableUser;
    createNavigablePhase(phase: Phase): NavigablePhase;
    createNavigableTimeEntry(entry: TimeEntry): NavigableTimeEntry;
}

declare class TasksResource extends BaseResource {
    private navFactory?;
    list(params?: TasksQueryParams): Promise<TasksListResponse>;
    /**
     * List tasks with enhanced pagination methods on the response
     */
    listWithPagination(params?: TasksQueryParams): Promise<PaginatedResponseWithHelpers<Task, TasksQueryParams>>;
    get(taskId: number): Promise<Task>;
    create(data: CreateTaskRequest): Promise<Task>;
    update(taskId: number, data: UpdateTaskRequest): Promise<Task>;
    deleteResource(taskId: number): Promise<void>;
    addAssignees(taskId: number, data: AddAssigneesRequest): Promise<Task>;
    removeAssignees(taskId: number, data: RemoveAssigneesRequest): Promise<Task>;
    addFollowers(taskId: number, data: AddFollowersRequest): Promise<Task>;
    removeFollowers(taskId: number, data: RemoveFollowersRequest): Promise<Task>;
    addDependencies(taskId: number, data: AddDependenciesRequest): Promise<Task>;
    removeDependencies(taskId: number, data: RemoveDependenciesRequest): Promise<Task>;
    moveToPhase(taskId: number, data: MoveTaskToPhaseRequest): Promise<Task>;
    duplicate(taskId: number, projectId?: number): Promise<Task>;
    archive(taskId: number): Promise<Task>;
    unarchive(taskId: number): Promise<Task>;
    bulkUpdate(data: BulkUpdateTasksRequest): Promise<Task[]>;
    bulkDelete(taskIds: number[]): Promise<void>;
    getByProject(projectId: number, params?: Omit<TasksQueryParams, 'projectId'>): Promise<TasksListResponse>;
    getByPhase(phaseId: number, params?: Omit<TasksQueryParams, 'phaseId'>): Promise<TasksListResponse>;
    getByAssignee(assigneeId: number, params?: Omit<TasksQueryParams, 'assigneeId'>): Promise<TasksListResponse>;
    search(query: string, params?: Omit<TasksQueryParams, 'search'>): Promise<TasksListResponse>;
    getNextPage(response: TasksListResponse, originalParams?: TasksQueryParams): Promise<TasksListResponse | null>;
    getAllTasks(params?: TasksQueryParams): Promise<Task[]>;
    iterateTaskPages(params?: TasksQueryParams): AsyncGenerator<TasksListResponse, void, unknown>;
    iterateTasks(params?: TasksQueryParams): AsyncGenerator<Task, void, unknown>;
    /**
     * Create a query builder for advanced task querying
     */
    queryBuilder(): QueryBuilder<Task>;
    /**
     * Execute a query built with QueryBuilder
     */
    query(queryBuilder: QueryBuilder<Task>): Promise<SQLQueryResult<Task>>;
    /**
     * Execute SQL-like queries using template literals
     */
    querySQL(sqlTemplate: ReturnType<typeof sql<Task>>): Promise<SQLQueryResult<Task>>;
    /**
     * List tasks with GraphQL-style field selection
     */
    listWithFields(params: TasksQueryParams, selection: FieldSelection): Promise<TasksListResponse>;
    /**
     * Advanced query methods with fluent interface
     */
    forProject(projectId: number): QueryBuilder<Task>;
    private bindExecutorToBuilder;
    assignedTo(userId: number | number[]): QueryBuilder<Task>;
    dueBetween(startDate: string, endDate: string): QueryBuilder<Task>;
    withStatus(status: number | string): QueryBuilder<Task>;
    nameContains(text: string): QueryBuilder<Task>;
    overdue(): QueryBuilder<Task>;
    highPriority(): QueryBuilder<Task>;
    withEffortMoreThan(minutes: number): QueryBuilder<Task>;
    findCriticalTasks(projectId?: number): Promise<SQLQueryResult<Task>>;
    findTeamWorkload(assigneeIds: number[], dateFrom: string, dateTo: string): Promise<SQLQueryResult<Task>>;
    /**
     * Set the navigation factory (called by client)
     */
    setNavigationFactory(factory: NavigableObjectFactory): void;
    /**
     * Get a navigable task with relationship methods
     */
    getNavigable(taskId: number): Promise<NavigableTask>;
    /**
     * List tasks as navigable objects
     */
    listNavigable(params?: TasksQueryParams): Promise<NavigableTask[]>;
    /**
     * Get all tasks as navigable objects
     */
    getAllNavigableTasks(params?: TasksQueryParams): Promise<NavigableTask[]>;
}

interface FieldOption {
    optionId: string;
    label: string;
    value: string;
    color?: string;
    active?: boolean;
}
interface Field {
    fieldId: string;
    fieldName: string;
    description?: string;
    type: 'text' | 'textarea' | 'number' | 'date' | 'datetime' | 'boolean' | 'select' | 'multiselect' | 'user' | 'email' | 'url' | 'currency';
    required?: boolean;
    active?: boolean;
    position?: number;
    defaultValue?: unknown;
    options?: FieldOption[];
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        message?: string;
    };
    visibility?: {
        entities: ('task' | 'project' | 'user' | 'time_entry')[];
        roles?: string[];
    };
    createdAt?: number;
    createdBy?: {
        userId: number;
        firstName: string;
        lastName?: string;
    };
    updatedAt?: number;
    updatedBy?: {
        userId: number;
        firstName: string;
        lastName?: string;
    };
}
interface FieldsListResponse {
    data: Field[];
    pagination: {
        pageSize: number;
        hasMore: boolean;
        totalRecordCount: number;
        nextPage?: string;
        nextPageToken?: string;
    };
}
interface CreateFieldRequest {
    fieldName: string;
    type: 'text' | 'textarea' | 'number' | 'date' | 'datetime' | 'boolean' | 'select' | 'multiselect' | 'user' | 'email' | 'url' | 'currency';
    description?: string;
    required?: boolean;
    defaultValue?: unknown;
    options?: Omit<FieldOption, 'optionId'>[];
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        message?: string;
    };
    visibility?: {
        entities: ('task' | 'project' | 'user' | 'time_entry')[];
        roles?: string[];
    };
    [key: string]: unknown;
}
interface UpdateFieldRequest {
    fieldName?: string;
    description?: string;
    required?: boolean;
    active?: boolean;
    position?: number;
    defaultValue?: unknown;
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        message?: string;
    };
    visibility?: {
        entities: ('task' | 'project' | 'user' | 'time_entry')[];
        roles?: string[];
    };
    [key: string]: unknown;
}
interface FieldsQueryParams {
    pageSize?: number;
    pageToken?: string;
    type?: 'text' | 'textarea' | 'number' | 'date' | 'datetime' | 'boolean' | 'select' | 'multiselect' | 'user' | 'email' | 'url' | 'currency';
    entity?: 'task' | 'project' | 'user' | 'time_entry';
    active?: boolean;
    required?: boolean;
    search?: string;
    sortBy?: 'fieldName' | 'type' | 'createdAt' | 'updatedAt' | 'position';
    sortOrder?: 'asc' | 'desc';
    [key: string]: unknown;
}
interface CreateFieldOptionRequest {
    label: string;
    value: string;
    color?: string;
    [key: string]: unknown;
}
interface UpdateFieldOptionRequest {
    label?: string;
    value?: string;
    color?: string;
    active?: boolean;
    [key: string]: unknown;
}
interface BulkUpdateFieldOptionsRequest {
    options: Array<{
        optionId?: string;
        label: string;
        value: string;
        color?: string;
        active?: boolean;
        position?: number;
    }>;
    [key: string]: unknown;
}
interface FieldValue {
    fieldId: string;
    fieldName: string;
    fieldType: string;
    value: unknown;
    displayValue?: string;
}
interface EntityFieldValues {
    entityId: number;
    entityType: 'task' | 'project' | 'user' | 'time_entry';
    fields: FieldValue[];
}
interface UpdateEntityFieldsRequest {
    fields: Record<string, unknown>;
    [key: string]: unknown;
}

declare class FieldsResource extends BaseResource {
    list(params?: FieldsQueryParams): Promise<FieldsListResponse>;
    getField(fieldId: string): Promise<Field>;
    create(data: CreateFieldRequest): Promise<Field>;
    update(fieldId: string, data: UpdateFieldRequest): Promise<Field>;
    deleteResource(fieldId: string): Promise<void>;
    activate(fieldId: string): Promise<Field>;
    deactivate(fieldId: string): Promise<Field>;
    reorder(fieldIds: string[]): Promise<Field[]>;
    getOptions(fieldId: string): Promise<FieldOption[]>;
    createOption(fieldId: string, data: CreateFieldOptionRequest): Promise<FieldOption>;
    updateOption(fieldId: string, optionId: string, data: UpdateFieldOptionRequest): Promise<FieldOption>;
    deleteOption(fieldId: string, optionId: string): Promise<void>;
    bulkUpdateOptions(fieldId: string, data: BulkUpdateFieldOptionsRequest): Promise<FieldOption[]>;
    reorderOptions(fieldId: string, optionIds: string[]): Promise<FieldOption[]>;
    getEntityFields(entityType: 'task' | 'project' | 'user' | 'time_entry', entityId: number): Promise<EntityFieldValues>;
    updateEntityFields(entityType: 'task' | 'project' | 'user' | 'time_entry', entityId: number, data: UpdateEntityFieldsRequest): Promise<EntityFieldValues>;
    getByType(type: 'text' | 'textarea' | 'number' | 'date' | 'datetime' | 'boolean' | 'select' | 'multiselect' | 'user' | 'email' | 'url' | 'currency', params?: Omit<FieldsQueryParams, 'type'>): Promise<FieldsListResponse>;
    getByEntity(entity: 'task' | 'project' | 'user' | 'time_entry', params?: Omit<FieldsQueryParams, 'entity'>): Promise<FieldsListResponse>;
    getActive(params?: Omit<FieldsQueryParams, 'active'>): Promise<FieldsListResponse>;
    getInactive(params?: Omit<FieldsQueryParams, 'active'>): Promise<FieldsListResponse>;
    getRequired(params?: Omit<FieldsQueryParams, 'required'>): Promise<FieldsListResponse>;
    getOptional(params?: Omit<FieldsQueryParams, 'required'>): Promise<FieldsListResponse>;
    search(query: string, params?: Omit<FieldsQueryParams, 'search'>): Promise<FieldsListResponse>;
    getTaskFields(params?: Omit<FieldsQueryParams, 'entity'>): Promise<FieldsListResponse>;
    getProjectFields(params?: Omit<FieldsQueryParams, 'entity'>): Promise<FieldsListResponse>;
    getUserFields(params?: Omit<FieldsQueryParams, 'entity'>): Promise<FieldsListResponse>;
    getTimeEntryFields(params?: Omit<FieldsQueryParams, 'entity'>): Promise<FieldsListResponse>;
    getSelectFields(params?: Omit<FieldsQueryParams, 'type'>): Promise<FieldsListResponse>;
    getMultiselectFields(params?: Omit<FieldsQueryParams, 'type'>): Promise<FieldsListResponse>;
    getTextFields(params?: Omit<FieldsQueryParams, 'type'>): Promise<FieldsListResponse>;
    getDateFields(params?: Omit<FieldsQueryParams, 'type'>): Promise<FieldsListResponse>;
    getNumberFields(params?: Omit<FieldsQueryParams, 'type'>): Promise<FieldsListResponse>;
    getNextPage(response: FieldsListResponse, originalParams?: FieldsQueryParams): Promise<FieldsListResponse | null>;
    getAllFields(params?: FieldsQueryParams): Promise<Field[]>;
    iterateFieldPages(params?: FieldsQueryParams): AsyncGenerator<FieldsListResponse, void, unknown>;
    iterateFields(params?: FieldsQueryParams): AsyncGenerator<Field, void, unknown>;
}

declare class ProjectsResource extends BaseResource {
    private navFactory?;
    list(params?: ProjectsQueryParams): Promise<ProjectsListResponse>;
    get(projectId: number, includeFields?: string): Promise<Project>;
    create(data: CreateProjectRequest): Promise<Project>;
    update(projectId: number, data: UpdateProjectRequest): Promise<Project>;
    deleteResource(projectId: number): Promise<void>;
    archive(projectId: number): Promise<Project>;
    unarchive(projectId: number): Promise<Project>;
    addMembers(projectId: number, data: AddProjectMembersRequest): Promise<Project>;
    removeMembers(projectId: number, data: RemoveProjectMembersRequest): Promise<Project>;
    importTemplate(projectId: number, data: ImportTemplateRequest): Promise<Project>;
    assignPlaceholder(projectId: number, data: AssignPlaceholderRequest): Promise<Project>;
    unassignPlaceholder(projectId: number, data: UnassignPlaceholderRequest): Promise<Project>;
    duplicate(projectId: number, newProjectName: string): Promise<Project>;
    getByCompany(companyId: number, params?: Omit<ProjectsQueryParams, 'companyId'>): Promise<ProjectsListResponse>;
    getByOwner(ownerId: number, params?: Omit<ProjectsQueryParams, 'ownerId'>): Promise<ProjectsListResponse>;
    search(query: string, params?: Omit<ProjectsQueryParams, 'search'>): Promise<ProjectsListResponse>;
    getNextPage(response: ProjectsListResponse, originalParams?: ProjectsQueryParams): Promise<ProjectsListResponse | null>;
    getAllProjects(params?: ProjectsQueryParams): Promise<Project[]>;
    iterateProjectPages(params?: ProjectsQueryParams): AsyncGenerator<ProjectsListResponse, void, unknown>;
    iterateProjects(params?: ProjectsQueryParams): AsyncGenerator<Project, void, unknown>;
    /**
     * Set the navigation factory (called by client)
     */
    setNavigationFactory(factory: NavigableObjectFactory): void;
    /**
     * Get a navigable project with relationship methods
     */
    getNavigable(projectId: number): Promise<NavigableProject>;
    /**
     * List projects as navigable objects
     */
    listNavigable(params?: ProjectsQueryParams): Promise<NavigableProject[]>;
    /**
     * Get all projects as navigable objects
     */
    getAllNavigableProjects(params?: ProjectsQueryParams): Promise<NavigableProject[]>;
}

interface ResourceAllocation {
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
interface ResourceAllocationsListResponse {
    data: ResourceAllocation[];
    pagination: {
        pageSize: number;
        hasMore: boolean;
        totalRecordCount: number;
        nextPage?: string;
        nextPageToken?: string;
    };
}
interface ResourceAllocationsQueryParams {
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
declare class ResourceAllocationsResource extends BaseResource {
    list(params?: ResourceAllocationsQueryParams): Promise<ResourceAllocationsListResponse>;
    getResourceAllocation(allocationId: number): Promise<ResourceAllocation>;
    getByProject(projectId: number, params?: Omit<ResourceAllocationsQueryParams, 'projectId'>): Promise<ResourceAllocationsListResponse>;
    getByUser(userId: number, params?: Omit<ResourceAllocationsQueryParams, 'userId'>): Promise<ResourceAllocationsListResponse>;
    getByDateRange(startDateFrom: string, startDateTo: string, params?: Omit<ResourceAllocationsQueryParams, 'startDateFrom' | 'startDateTo'>): Promise<ResourceAllocationsListResponse>;
    getNextPage(response: ResourceAllocationsListResponse, originalParams?: ResourceAllocationsQueryParams): Promise<ResourceAllocationsListResponse | null>;
    getAllResourceAllocations(params?: ResourceAllocationsQueryParams): Promise<ResourceAllocation[]>;
    iterateResourceAllocationPages(params?: ResourceAllocationsQueryParams): AsyncGenerator<ResourceAllocationsListResponse, void, unknown>;
    iterateResourceAllocations(params?: ResourceAllocationsQueryParams): AsyncGenerator<ResourceAllocation, void, unknown>;
}

declare class PhasesResource extends BaseResource {
    list(params?: PhasesQueryParams): Promise<PhasesListResponse>;
    getPhase(phaseId: number): Promise<Phase>;
    create(data: CreatePhaseRequest): Promise<Phase>;
    update(phaseId: number, data: UpdatePhaseRequest): Promise<Phase>;
    deleteResource(phaseId: number): Promise<void>;
    archive(phaseId: number): Promise<Phase>;
    unarchive(phaseId: number): Promise<Phase>;
    duplicate(phaseId: number, data: DuplicatePhaseRequest): Promise<Phase>;
    reorder(data: ReorderPhasesRequest): Promise<Phase[]>;
    bulkUpdate(data: BulkUpdatePhasesRequest): Promise<Phase[]>;
    bulkDelete(phaseIds: number[]): Promise<void>;
    getByProject(projectId: number, params?: Omit<PhasesQueryParams, 'projectId'>): Promise<PhasesListResponse>;
    getByStatus(status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold', params?: Omit<PhasesQueryParams, 'status'>): Promise<PhasesListResponse>;
    getActive(params?: Omit<PhasesQueryParams, 'archived'>): Promise<PhasesListResponse>;
    getArchived(params?: Omit<PhasesQueryParams, 'archived'>): Promise<PhasesListResponse>;
    search(query: string, params?: Omit<PhasesQueryParams, 'search'>): Promise<PhasesListResponse>;
    getNotStarted(params?: Omit<PhasesQueryParams, 'status'>): Promise<PhasesListResponse>;
    getInProgress(params?: Omit<PhasesQueryParams, 'status'>): Promise<PhasesListResponse>;
    getCompleted(params?: Omit<PhasesQueryParams, 'status'>): Promise<PhasesListResponse>;
    getOnHold(params?: Omit<PhasesQueryParams, 'status'>): Promise<PhasesListResponse>;
    getByDateRange(startDateFrom: string, startDateTo: string, params?: Omit<PhasesQueryParams, 'startDateFrom' | 'startDateTo'>): Promise<PhasesListResponse>;
    getNextPage(response: PhasesListResponse, originalParams?: PhasesQueryParams): Promise<PhasesListResponse | null>;
    getAllPhases(params?: PhasesQueryParams): Promise<Phase[]>;
    iteratePhasePages(params?: PhasesQueryParams): AsyncGenerator<PhasesListResponse, void, unknown>;
    iteratePhases(params?: PhasesQueryParams): AsyncGenerator<Phase, void, unknown>;
}

interface TimeOff {
    timeOffId: number;
    userId: number;
    userFirstName: string;
    userLastName?: string;
    startDate: string;
    endDate: string;
    type: 'vacation' | 'sick' | 'personal' | 'holiday' | 'other';
    status: 'pending' | 'approved' | 'rejected';
    reason?: string;
    approvedBy?: {
        userId: number;
        firstName: string;
        lastName?: string;
    };
    createdAt: number;
    updatedAt: number;
}
interface TimeOffsListResponse {
    data: TimeOff[];
    pagination: {
        pageSize: number;
        hasMore: boolean;
        totalRecordCount: number;
        nextPage?: string;
        nextPageToken?: string;
    };
}
interface CreateTimeOffRequest {
    startDate: string;
    endDate: string;
    type: 'vacation' | 'sick' | 'personal' | 'holiday' | 'other';
    reason?: string;
    userId?: number;
    [key: string]: unknown;
}
interface UpdateTimeOffRequest {
    startDate?: string;
    endDate?: string;
    type?: 'vacation' | 'sick' | 'personal' | 'holiday' | 'other';
    reason?: string;
    status?: 'pending' | 'approved' | 'rejected';
    [key: string]: unknown;
}
interface TimeOffsQueryParams {
    pageSize?: number;
    pageToken?: string;
    userId?: number;
    type?: 'vacation' | 'sick' | 'personal' | 'holiday' | 'other';
    status?: 'pending' | 'approved' | 'rejected';
    startDateFrom?: string;
    startDateTo?: string;
    endDateFrom?: string;
    endDateTo?: string;
    sortBy?: 'startDate' | 'endDate' | 'createdAt' | 'updatedAt' | 'status';
    sortOrder?: 'asc' | 'desc';
    [key: string]: unknown;
}
declare class TimeOffsResource extends BaseResource {
    list(params?: TimeOffsQueryParams): Promise<TimeOffsListResponse>;
    getTimeOff(timeOffId: number): Promise<TimeOff>;
    create(data: CreateTimeOffRequest): Promise<TimeOff>;
    update(timeOffId: number, data: UpdateTimeOffRequest): Promise<TimeOff>;
    deleteResource(timeOffId: number): Promise<void>;
    approve(timeOffId: number): Promise<TimeOff>;
    reject(timeOffId: number, reason?: string): Promise<TimeOff>;
    getByUser(userId: number, params?: Omit<TimeOffsQueryParams, 'userId'>): Promise<TimeOffsListResponse>;
    getByStatus(status: 'pending' | 'approved' | 'rejected', params?: Omit<TimeOffsQueryParams, 'status'>): Promise<TimeOffsListResponse>;
    getByType(type: 'vacation' | 'sick' | 'personal' | 'holiday' | 'other', params?: Omit<TimeOffsQueryParams, 'type'>): Promise<TimeOffsListResponse>;
    getPending(params?: Omit<TimeOffsQueryParams, 'status'>): Promise<TimeOffsListResponse>;
    getApproved(params?: Omit<TimeOffsQueryParams, 'status'>): Promise<TimeOffsListResponse>;
    getRejected(params?: Omit<TimeOffsQueryParams, 'status'>): Promise<TimeOffsListResponse>;
    getNextPage(response: TimeOffsListResponse, originalParams?: TimeOffsQueryParams): Promise<TimeOffsListResponse | null>;
    getAllTimeOffs(params?: TimeOffsQueryParams): Promise<TimeOff[]>;
    iterateTimeOffPages(params?: TimeOffsQueryParams): AsyncGenerator<TimeOffsListResponse, void, unknown>;
    iterateTimeOffs(params?: TimeOffsQueryParams): AsyncGenerator<TimeOff, void, unknown>;
}

declare class UsersResource extends BaseResource {
    private navFactory?;
    list(params?: UsersQueryParams): Promise<UsersListResponse>;
    getUser(userId: number, includeFields?: string): Promise<User>;
    create(data: CreateUserRequest): Promise<User>;
    update(userId: number, data: UpdateUserRequest): Promise<User>;
    deleteResource(userId: number): Promise<void>;
    invite(data: InviteUserRequest): Promise<User>;
    bulkInvite(data: BulkInviteUsersRequest): Promise<User[]>;
    activate(userId: number): Promise<User>;
    deactivate(userId: number): Promise<User>;
    resendInvite(userId: number): Promise<void>;
    getByCompany(companyId: number, params?: Omit<UsersQueryParams, 'companyId'>): Promise<UsersListResponse>;
    getByType(type: 'TEAM_MEMBER' | 'PARTNER' | 'CUSTOMER', params?: Omit<UsersQueryParams, 'type'>): Promise<UsersListResponse>;
    getByStatus(status: 'INACTIVE' | 'INVITED' | 'ACTIVE', params?: Omit<UsersQueryParams, 'status'>): Promise<UsersListResponse>;
    search(query: string, params?: Omit<UsersQueryParams, 'search'>): Promise<UsersListResponse>;
    getTeamMembers(params?: UsersQueryParams): Promise<UsersListResponse>;
    getPartners(params?: UsersQueryParams): Promise<UsersListResponse>;
    getCustomers(params?: UsersQueryParams): Promise<UsersListResponse>;
    getActive(params?: UsersQueryParams): Promise<UsersListResponse>;
    getInvited(params?: UsersQueryParams): Promise<UsersListResponse>;
    getInactive(params?: UsersQueryParams): Promise<UsersListResponse>;
    getNextPage(response: UsersListResponse, originalParams?: UsersQueryParams): Promise<UsersListResponse | null>;
    getAllUsers(params?: UsersQueryParams): Promise<User[]>;
    iterateUserPages(params?: UsersQueryParams): AsyncGenerator<UsersListResponse, void, unknown>;
    iterateUsers(params?: UsersQueryParams): AsyncGenerator<User, void, unknown>;
    /**
     * Set the navigation factory (called by client)
     */
    setNavigationFactory(factory: NavigableObjectFactory): void;
    /**
     * Get a navigable user with relationship methods
     */
    getNavigable(userId: number): Promise<NavigableUser>;
    /**
     * List users as navigable objects
     */
    listNavigable(params?: UsersQueryParams): Promise<NavigableUser[]>;
    /**
     * Get all users as navigable objects
     */
    getAllNavigableUsers(params?: UsersQueryParams): Promise<NavigableUser[]>;
}

interface Space {
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
interface SpacesListResponse {
    data: Space[];
    pagination: {
        pageSize: number;
        hasMore: boolean;
        totalRecordCount: number;
        nextPage?: string;
        nextPageToken?: string;
    };
}
interface CreateSpaceRequest {
    spaceName: string;
    description?: string;
    type: 'project' | 'team' | 'company' | 'personal';
    visibility: 'public' | 'private' | 'restricted';
    projectId?: number;
    members?: number[];
    [key: string]: unknown;
}
interface UpdateSpaceRequest {
    spaceName?: string;
    description?: string;
    visibility?: 'public' | 'private' | 'restricted';
    [key: string]: unknown;
}
interface SpacesQueryParams {
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
interface AddSpaceMembersRequest {
    members: Array<{
        userId: number;
        role: string;
    }>;
    [key: string]: unknown;
}
interface RemoveSpaceMembersRequest {
    members: number[];
    [key: string]: unknown;
}
declare class SpacesResource extends BaseResource {
    list(params?: SpacesQueryParams): Promise<SpacesListResponse>;
    getSpace(spaceId: number): Promise<Space>;
    create(data: CreateSpaceRequest): Promise<Space>;
    update(spaceId: number, data: UpdateSpaceRequest): Promise<Space>;
    deleteResource(spaceId: number): Promise<void>;
    archive(spaceId: number): Promise<Space>;
    unarchive(spaceId: number): Promise<Space>;
    addMembers(spaceId: number, data: AddSpaceMembersRequest): Promise<Space>;
    removeMembers(spaceId: number, data: RemoveSpaceMembersRequest): Promise<Space>;
    getByType(type: 'project' | 'team' | 'company' | 'personal', params?: Omit<SpacesQueryParams, 'type'>): Promise<SpacesListResponse>;
    getByVisibility(visibility: 'public' | 'private' | 'restricted', params?: Omit<SpacesQueryParams, 'visibility'>): Promise<SpacesListResponse>;
    getByOwner(ownerId: number, params?: Omit<SpacesQueryParams, 'ownerId'>): Promise<SpacesListResponse>;
    getByProject(projectId: number, params?: Omit<SpacesQueryParams, 'projectId'>): Promise<SpacesListResponse>;
    getPublic(params?: Omit<SpacesQueryParams, 'visibility'>): Promise<SpacesListResponse>;
    getPrivate(params?: Omit<SpacesQueryParams, 'visibility'>): Promise<SpacesListResponse>;
    search(query: string, params?: Omit<SpacesQueryParams, 'search'>): Promise<SpacesListResponse>;
    getNextPage(response: SpacesListResponse, originalParams?: SpacesQueryParams): Promise<SpacesListResponse | null>;
    getAllSpaces(params?: SpacesQueryParams): Promise<Space[]>;
    iterateSpacePages(params?: SpacesQueryParams): AsyncGenerator<SpacesListResponse, void, unknown>;
    iterateSpaces(params?: SpacesQueryParams): AsyncGenerator<Space, void, unknown>;
}

declare class TimeTrackingResource extends BaseResource {
    list(params?: TimeEntriesQueryParams): Promise<TimeEntriesListResponse>;
    getTimeEntry(timeEntryId: number): Promise<TimeEntry>;
    create(data: CreateTimeEntryRequest): Promise<TimeEntry>;
    update(timeEntryId: number, data: UpdateTimeEntryRequest): Promise<TimeEntry>;
    deleteTimeEntry(timeEntryId: number): Promise<void>;
    bulkCreate(data: BulkCreateTimeEntriesRequest): Promise<TimeEntry[]>;
    bulkUpdate(data: BulkUpdateTimeEntriesRequest): Promise<TimeEntry[]>;
    bulkDelete(data: BulkDeleteTimeEntriesRequest): Promise<void>;
    approve(data: ApproveTimeEntriesRequest): Promise<TimeEntry[]>;
    reject(data: RejectTimeEntriesRequest): Promise<TimeEntry[]>;
    getCategories(): Promise<TimeEntryCategoriesListResponse>;
    getCategory(categoryId: number): Promise<TimeEntryCategory>;
    createCategory(data: CreateTimeEntryCategoryRequest): Promise<TimeEntryCategory>;
    updateCategory(categoryId: number, data: UpdateTimeEntryCategoryRequest): Promise<TimeEntryCategory>;
    deleteCategory(categoryId: number): Promise<void>;
    getByProject(projectId: number, params?: Omit<TimeEntriesQueryParams, 'projectId'>): Promise<TimeEntriesListResponse>;
    getByUser(userId: number, params?: Omit<TimeEntriesQueryParams, 'userId'>): Promise<TimeEntriesListResponse>;
    getByPhase(phaseId: number, params?: Omit<TimeEntriesQueryParams, 'phaseId'>): Promise<TimeEntriesListResponse>;
    getByTask(taskId: number, params?: Omit<TimeEntriesQueryParams, 'taskId'>): Promise<TimeEntriesListResponse>;
    getByCategory(categoryId: number, params?: Omit<TimeEntriesQueryParams, 'categoryId'>): Promise<TimeEntriesListResponse>;
    getBillable(params?: Omit<TimeEntriesQueryParams, 'billable'>): Promise<TimeEntriesListResponse>;
    getNonBillable(params?: Omit<TimeEntriesQueryParams, 'billable'>): Promise<TimeEntriesListResponse>;
    getApproved(params?: Omit<TimeEntriesQueryParams, 'approved'>): Promise<TimeEntriesListResponse>;
    getPending(params?: Omit<TimeEntriesQueryParams, 'approved'>): Promise<TimeEntriesListResponse>;
    getByDateRange(dateFrom: string, dateTo: string, params?: Omit<TimeEntriesQueryParams, 'dateFrom' | 'dateTo'>): Promise<TimeEntriesListResponse>;
    search(query: string, params?: Omit<TimeEntriesQueryParams, 'search'>): Promise<TimeEntriesListResponse>;
    getReport(params?: TimeEntryReportParams): Promise<TimeEntryReport>;
    exportReport(params?: TimeEntryReportParams & {
        format?: 'csv' | 'xlsx';
    }): Promise<Blob>;
    startTimer(data: {
        projectId: number;
        phaseId?: number;
        taskId?: number;
        categoryId: number;
        description?: string;
    }): Promise<{
        timerId: string;
        startedAt: number;
    }>;
    stopTimer(timerId: string): Promise<TimeEntry>;
    pauseTimer(timerId: string): Promise<{
        timerId: string;
        pausedAt: number;
    }>;
    resumeTimer(timerId: string): Promise<{
        timerId: string;
        resumedAt: number;
    }>;
    getActiveTimer(): Promise<{
        timerId: string;
        startedAt: number;
        totalMinutes: number;
    } | null>;
    getNextPage(response: TimeEntriesListResponse, originalParams?: TimeEntriesQueryParams): Promise<TimeEntriesListResponse | null>;
    getAllTimeEntries(params?: TimeEntriesQueryParams): Promise<TimeEntry[]>;
    iterateTimeEntryPages(params?: TimeEntriesQueryParams): AsyncGenerator<TimeEntriesListResponse, void, unknown>;
    iterateTimeEntries(params?: TimeEntriesQueryParams): AsyncGenerator<TimeEntry, void, unknown>;
}

interface SpaceDocument {
    documentId: number;
    documentName: string;
    description?: string;
    spaceId: number;
    spaceName: string;
    type: 'document' | 'spreadsheet' | 'presentation' | 'file';
    mimeType?: string;
    size?: number;
    url?: string;
    downloadUrl?: string;
    version: number;
    isLatest: boolean;
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
    tags?: string[];
}
interface SpaceDocumentsListResponse {
    data: SpaceDocument[];
    pagination: {
        pageSize: number;
        hasMore: boolean;
        totalRecordCount: number;
        nextPage?: string;
        nextPageToken?: string;
    };
}
interface CreateSpaceDocumentRequest {
    documentName: string;
    spaceId: number;
    description?: string;
    type: 'document' | 'spreadsheet' | 'presentation' | 'file';
    content?: string;
    file?: File | ArrayBuffer;
    tags?: string[];
    [key: string]: unknown;
}
interface UpdateSpaceDocumentRequest {
    documentName?: string;
    description?: string;
    content?: string;
    tags?: string[];
    [key: string]: unknown;
}
interface SpaceDocumentsQueryParams {
    pageSize?: number;
    pageToken?: string;
    spaceId?: number;
    type?: 'document' | 'spreadsheet' | 'presentation' | 'file';
    createdBy?: number;
    search?: string;
    tags?: string[];
    sortBy?: 'documentName' | 'type' | 'createdAt' | 'updatedAt' | 'size';
    sortOrder?: 'asc' | 'desc';
    [key: string]: unknown;
}
interface DocumentVersion {
    versionId: number;
    documentId: number;
    version: number;
    content?: string;
    size?: number;
    changes?: string;
    createdAt: number;
    createdBy: {
        userId: number;
        firstName: string;
        lastName?: string;
    };
}
interface DocumentVersionsListResponse {
    data: DocumentVersion[];
    pagination: {
        pageSize: number;
        hasMore: boolean;
        totalRecordCount: number;
        nextPage?: string;
        nextPageToken?: string;
    };
}
declare class SpaceDocumentsResource extends BaseResource {
    list(params?: SpaceDocumentsQueryParams): Promise<SpaceDocumentsListResponse>;
    getSpaceDocument(documentId: number): Promise<SpaceDocument>;
    create(data: CreateSpaceDocumentRequest): Promise<SpaceDocument>;
    update(documentId: number, data: UpdateSpaceDocumentRequest): Promise<SpaceDocument>;
    deleteResource(documentId: number): Promise<void>;
    download(documentId: number): Promise<Blob>;
    getContent(documentId: number): Promise<{
        content: string;
    }>;
    updateContent(documentId: number, content: string): Promise<SpaceDocument>;
    duplicate(documentId: number, newDocumentName: string, spaceId?: number): Promise<SpaceDocument>;
    move(documentId: number, newSpaceId: number): Promise<SpaceDocument>;
    getVersions(documentId: number): Promise<DocumentVersionsListResponse>;
    getVersion(documentId: number, version: number): Promise<DocumentVersion>;
    restoreVersion(documentId: number, version: number): Promise<SpaceDocument>;
    getBySpace(spaceId: number, params?: Omit<SpaceDocumentsQueryParams, 'spaceId'>): Promise<SpaceDocumentsListResponse>;
    getByType(type: 'document' | 'spreadsheet' | 'presentation' | 'file', params?: Omit<SpaceDocumentsQueryParams, 'type'>): Promise<SpaceDocumentsListResponse>;
    getByCreator(createdBy: number, params?: Omit<SpaceDocumentsQueryParams, 'createdBy'>): Promise<SpaceDocumentsListResponse>;
    getByTags(tags: string[], params?: Omit<SpaceDocumentsQueryParams, 'tags'>): Promise<SpaceDocumentsListResponse>;
    search(query: string, params?: Omit<SpaceDocumentsQueryParams, 'search'>): Promise<SpaceDocumentsListResponse>;
    getNextPage(response: SpaceDocumentsListResponse, originalParams?: SpaceDocumentsQueryParams): Promise<SpaceDocumentsListResponse | null>;
    getAllSpaceDocuments(params?: SpaceDocumentsQueryParams): Promise<SpaceDocument[]>;
    iterateSpaceDocumentPages(params?: SpaceDocumentsQueryParams): AsyncGenerator<SpaceDocumentsListResponse, void, unknown>;
    iterateSpaceDocuments(params?: SpaceDocumentsQueryParams): AsyncGenerator<SpaceDocument, void, unknown>;
}

declare class RocketlaneClient {
    private httpClient;
    private navFactory;
    readonly tasks: TasksResource;
    readonly fields: FieldsResource;
    readonly projects: ProjectsResource;
    readonly resourceAllocations: ResourceAllocationsResource;
    readonly phases: PhasesResource;
    readonly timeOffs: TimeOffsResource;
    readonly users: UsersResource;
    readonly spaces: SpacesResource;
    readonly timeTracking: TimeTrackingResource;
    readonly spaceDocuments: SpaceDocumentsResource;
    readonly export: ExportManager;
    readonly import: ImportManager;
    constructor(config: RocketlaneConfig);
    private initializeNavigationCapabilities;
}
declare class ExportManager {
    private client;
    constructor(client: RocketlaneClient);
    tasks(params: any | undefined, options: ExportOptions): Promise<ExportResult & {
        downloadUrl: string;
    }>;
    projects(params: any | undefined, options: ExportOptions): Promise<ExportResult & {
        downloadUrl: string;
    }>;
    users(params: any | undefined, options: ExportOptions): Promise<ExportResult & {
        downloadUrl: string;
    }>;
    timeEntries(params: any | undefined, options: ExportOptions): Promise<ExportResult & {
        downloadUrl: string;
    }>;
    data<T>(data: T[], options: ExportOptions): Promise<ExportResult & {
        downloadUrl: string;
    }>;
}
declare class ImportManager {
    private client;
    constructor(client: RocketlaneClient);
    tasks(content: string, format: 'csv' | 'json' | 'xlsx', options?: ImportOptions): Promise<ImportResult<any>>;
    projects(content: string, format: 'csv' | 'json' | 'xlsx', options?: ImportOptions): Promise<ImportResult<any>>;
    users(content: string, format: 'csv' | 'json' | 'xlsx', options?: ImportOptions): Promise<ImportResult<any>>;
    data<T>(content: string, format: 'csv' | 'json' | 'xlsx', createFn: (item: any) => Promise<T>, options?: ImportOptions): Promise<ImportResult<T>>;
    validate(content: string, format: 'csv' | 'json' | 'xlsx', schema: Record<string, any>, options?: ImportOptions): Promise<ValidationResult>;
    private parseContent;
}

export { type AddAssigneesRequest, type AddDependenciesRequest, type AddFollowersRequest, type AddSpaceMembersRequest, type ApiResponse, type ApproveTimeEntriesRequest, type BasePaginatedResponse, BaseResource, type BulkCreateTimeEntriesRequest, type BulkDeleteTimeEntriesRequest, type BulkUpdateFieldOptionsRequest, type BulkUpdateTasksRequest, type BulkUpdateTimeEntriesRequest, type CreateFieldOptionRequest, type CreateFieldRequest, type CreatePhaseRequest, type CreateProjectRequest, type CreateSpaceDocumentRequest, type CreateSpaceRequest, type CreateTaskRequest, type CreateTimeEntryCategoryRequest, type CreateTimeEntryRequest, type CreateTimeOffRequest, type CreateUserRequest, type DocumentVersion, type DocumentVersionsListResponse, type EntityFieldValues, type Field, type FieldOption, type FieldValue, type FieldsListResponse, type FieldsQueryParams, FieldsResource, HttpClient, type HttpMethod, type MoveTaskToPhaseRequest, type PaginatedResponse, type PaginationOptions, type Phase, type PhasesListResponse, type PhasesQueryParams, PhasesResource, type Project, type ProjectsListResponse, type ProjectsQueryParams, ProjectsResource, type QueryParams, type RejectTimeEntriesRequest, type RemoveAssigneesRequest, type RemoveDependenciesRequest, type RemoveFollowersRequest, type RemoveSpaceMembersRequest, type RequestConfig, type ResourceAllocation, type ResourceAllocationsListResponse, type ResourceAllocationsQueryParams, ResourceAllocationsResource, RocketlaneClient, type RocketlaneConfig, type RocketlaneError, type RocketlanePagination, type Space, type SpaceDocument, type SpaceDocumentsListResponse, type SpaceDocumentsQueryParams, SpaceDocumentsResource, type SpacesListResponse, type SpacesQueryParams, SpacesResource, type Task, type TaskDependency, type TaskField, type TaskPriority, type TaskStatus, type TasksListResponse, type TasksQueryParams, TasksResource, type TimeEntriesListResponse, type TimeEntriesQueryParams, type TimeEntry, type TimeEntryCategoriesListResponse, type TimeEntryCategory, type TimeEntryPhase, type TimeEntryProject, type TimeEntryReport, type TimeEntryReportParams, type TimeEntryUser, type TimeOff, type TimeOffsListResponse, type TimeOffsQueryParams, TimeOffsResource, TimeTrackingResource, type UpdateEntityFieldsRequest, type UpdateFieldOptionRequest, type UpdateFieldRequest, type UpdatePhaseRequest, type UpdateProjectRequest, type UpdateSpaceDocumentRequest, type UpdateSpaceRequest, type UpdateTaskRequest, type UpdateTimeEntryCategoryRequest, type UpdateTimeEntryRequest, type UpdateTimeOffRequest, type UpdateUserRequest, type User, type UsersListResponse, type UsersQueryParams, UsersResource, RocketlaneClient as default };
