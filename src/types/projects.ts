export interface ProjectOwner {
  emailId: string;
  userId: number;
  firstName: string;
  lastName?: string;
}

export interface ProjectMember {
  emailId: string;
  userId: number;
  firstName: string;
  lastName?: string;
  role?: string;
}

export interface ProjectStatus {
  value: number;
  label: string;
}

export interface ProjectField {
  fieldId: string;
  fieldName: string;
  value: unknown;
  type: string;
}

export interface PartnerCompany {
  companyId: number;
  companyName: string;
}

export interface Project {
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

export interface ProjectsListResponse {
  data: Project[];
  pagination: {
    pageSize: number;
    hasMore: boolean;
    totalRecordCount: number;
    nextPage?: string;
    nextPageToken?: string;
  };
}

export interface CreateProjectRequest {
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

export interface UpdateProjectRequest {
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

export interface ProjectsQueryParams {
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

export interface AddProjectMembersRequest {
  members: number[];
  [key: string]: unknown;
}

export interface RemoveProjectMembersRequest {
  members: number[];
  [key: string]: unknown;
}

export interface ImportTemplateRequest {
  templateId: number;
  startDate?: string;
  [key: string]: unknown;
}

export interface ProjectPlaceholder {
  placeholderId: number;
  placeholderName: string;
  role?: string;
}

export interface AssignPlaceholderRequest {
  placeholderId: number;
  userId: number;
  [key: string]: unknown;
}

export interface UnassignPlaceholderRequest {
  placeholderId: number;
  [key: string]: unknown;
}