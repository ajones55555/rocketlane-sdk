export interface UserCompany {
  companyId: number;
  companyName: string;
}

export interface UserPermission {
  [key: string]: boolean | string | number;
}

export interface UserField {
  fieldId: string;
  fieldName: string;
  value: string | number | unknown[];
  type: string;
}

export interface User {
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

export interface UsersListResponse {
  data: User[];
  pagination: {
    pageSize: number;
    hasMore: boolean;
    totalRecordCount: number;
    nextPage?: string;
    nextPageToken?: string;
  };
}

export interface UsersQueryParams {
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

export interface CreateUserRequest {
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

export interface UpdateUserRequest {
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

export interface InviteUserRequest {
  email: string;
  firstName: string;
  lastName?: string;
  type: 'TEAM_MEMBER' | 'PARTNER' | 'CUSTOMER';
  companyId: number;
  role?: string;
  message?: string;
  [key: string]: unknown;
}

export interface BulkInviteUsersRequest {
  users: InviteUserRequest[];
  [key: string]: unknown;
}