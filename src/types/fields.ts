export interface FieldOption {
  optionId: string;
  label: string;
  value: string;
  color?: string;
  active?: boolean;
}

export interface Field {
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

export interface FieldsListResponse {
  data: Field[];
  pagination?: {
    pageSize: number;
    hasMore: boolean;
    totalRecordCount: number;
    nextPage?: string;
    nextPageToken?: string;
  };
}

export interface CreateFieldRequest {
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

export interface UpdateFieldRequest {
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

export interface FieldsQueryParams {
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

export interface CreateFieldOptionRequest {
  label: string;
  value: string;
  color?: string;
  [key: string]: unknown;
}

export interface UpdateFieldOptionRequest {
  label?: string;
  value?: string;
  color?: string;
  active?: boolean;
  [key: string]: unknown;
}

export interface BulkUpdateFieldOptionsRequest {
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

export interface FieldValue {
  fieldId: string;
  fieldName: string;
  fieldType: string;
  value: unknown;
  displayValue?: string;
}

export interface EntityFieldValues {
  entityId: number;
  entityType: 'task' | 'project' | 'user' | 'time_entry';
  fields: FieldValue[];
}

export interface UpdateEntityFieldsRequest {
  fields: Record<string, unknown>;
  [key: string]: unknown;
}