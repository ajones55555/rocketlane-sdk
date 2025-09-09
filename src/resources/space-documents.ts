import { HttpClient } from '../utils/http-client';

export interface SpaceDocument {
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

export interface SpaceDocumentsListResponse {
  data: SpaceDocument[];
  pagination: {
    pageSize: number;
    hasMore: boolean;
    totalRecordCount: number;
    nextPage?: string;
    nextPageToken?: string;
  };
}

export interface CreateSpaceDocumentRequest {
  documentName: string;
  spaceId: number;
  description?: string;
  type: 'document' | 'spreadsheet' | 'presentation' | 'file';
  content?: string;
  file?: File | ArrayBuffer;
  tags?: string[];
  [key: string]: unknown;
}

export interface UpdateSpaceDocumentRequest {
  documentName?: string;
  description?: string;
  content?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface SpaceDocumentsQueryParams {
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

export interface DocumentVersion {
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

export interface DocumentVersionsListResponse {
  data: DocumentVersion[];
  pagination: {
    pageSize: number;
    hasMore: boolean;
    totalRecordCount: number;
    nextPage?: string;
    nextPageToken?: string;
  };
}

export class SpaceDocumentsResource {
  constructor(private httpClient: HttpClient) {}

  async list(params?: SpaceDocumentsQueryParams): Promise<SpaceDocumentsListResponse> {
    return this.httpClient.get<SpaceDocumentsListResponse>('/api/1.0/space-documents', params);
  }

  async get(documentId: number): Promise<SpaceDocument> {
    return this.httpClient.get<SpaceDocument>(`/api/1.0/space-documents/${documentId}`);
  }

  async create(data: CreateSpaceDocumentRequest): Promise<SpaceDocument> {
    return this.httpClient.post<SpaceDocument>('/api/1.0/space-documents', data);
  }

  async update(documentId: number, data: UpdateSpaceDocumentRequest): Promise<SpaceDocument> {
    return this.httpClient.put<SpaceDocument>(`/api/1.0/space-documents/${documentId}`, data);
  }

  async delete(documentId: number): Promise<void> {
    return this.httpClient.delete<void>(`/api/1.0/space-documents/${documentId}`);
  }

  async download(documentId: number): Promise<Blob> {
    return this.httpClient.get<Blob>(`/api/1.0/space-documents/${documentId}/download`);
  }

  async getContent(documentId: number): Promise<{ content: string }> {
    return this.httpClient.get<{ content: string }>(`/api/1.0/space-documents/${documentId}/content`);
  }

  async updateContent(documentId: number, content: string): Promise<SpaceDocument> {
    return this.httpClient.put<SpaceDocument>(`/api/1.0/space-documents/${documentId}/content`, { content });
  }

  async duplicate(documentId: number, newDocumentName: string, spaceId?: number): Promise<SpaceDocument> {
    return this.httpClient.post<SpaceDocument>(`/api/1.0/space-documents/${documentId}/duplicate`, {
      documentName: newDocumentName,
      spaceId,
    });
  }

  async move(documentId: number, newSpaceId: number): Promise<SpaceDocument> {
    return this.httpClient.post<SpaceDocument>(`/api/1.0/space-documents/${documentId}/move`, {
      spaceId: newSpaceId,
    });
  }

  // Version management
  async getVersions(documentId: number): Promise<DocumentVersionsListResponse> {
    return this.httpClient.get<DocumentVersionsListResponse>(`/api/1.0/space-documents/${documentId}/versions`);
  }

  async getVersion(documentId: number, version: number): Promise<DocumentVersion> {
    return this.httpClient.get<DocumentVersion>(`/api/1.0/space-documents/${documentId}/versions/${version}`);
  }

  async restoreVersion(documentId: number, version: number): Promise<SpaceDocument> {
    return this.httpClient.post<SpaceDocument>(`/api/1.0/space-documents/${documentId}/versions/${version}/restore`);
  }

  // Helper methods for filtering
  async getBySpace(spaceId: number, params?: Omit<SpaceDocumentsQueryParams, 'spaceId'>): Promise<SpaceDocumentsListResponse> {
    return this.list({ ...params, spaceId });
  }

  async getByType(type: 'document' | 'spreadsheet' | 'presentation' | 'file', params?: Omit<SpaceDocumentsQueryParams, 'type'>): Promise<SpaceDocumentsListResponse> {
    return this.list({ ...params, type });
  }

  async getByCreator(createdBy: number, params?: Omit<SpaceDocumentsQueryParams, 'createdBy'>): Promise<SpaceDocumentsListResponse> {
    return this.list({ ...params, createdBy });
  }

  async getByTags(tags: string[], params?: Omit<SpaceDocumentsQueryParams, 'tags'>): Promise<SpaceDocumentsListResponse> {
    return this.list({ ...params, tags });
  }

  async search(query: string, params?: Omit<SpaceDocumentsQueryParams, 'search'>): Promise<SpaceDocumentsListResponse> {
    return this.list({ ...params, search: query });
  }
}