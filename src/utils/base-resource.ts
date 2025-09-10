import { HttpClient } from './http-client';
import { BasePaginatedResponse, RocketlanePagination, PaginationOptions } from '../types/common';
import { QueryBuilder, sql, SQLQueryResult, FieldSelection, processFieldSelection } from './query-builder';

// Extend paginated responses with helper methods
export interface PaginatedResponseWithHelpers<T, P extends PaginationOptions> extends BasePaginatedResponse<T> {
  getNextPage(): Promise<PaginatedResponseWithHelpers<T, P> | null>;
  getAllRemaining(): Promise<T[]>;
  iterateRemainingPages(): AsyncGenerator<PaginatedResponseWithHelpers<T, P>, void, unknown>;
  iterateRemainingItems(): AsyncGenerator<T, void, unknown>;
}

export abstract class BaseResource {
  constructor(protected httpClient: HttpClient) {}

  /**
   * Enhance a paginated response with helper methods
   */
  protected enhanceResponse<T, P extends PaginationOptions>(
    response: BasePaginatedResponse<T>,
    originalParams: P,
    listMethod: (params: P) => Promise<BasePaginatedResponse<T>>
  ): PaginatedResponseWithHelpers<T, P> {
    const enhancedResponse = response as PaginatedResponseWithHelpers<T, P>;

    enhancedResponse.getNextPage = async () => {
      if (!response.pagination.hasMore || !response.pagination.nextPageToken) {
        return null;
      }
      const nextParams = { ...originalParams, pageToken: response.pagination.nextPageToken } as P;
      const nextResponse = await listMethod(nextParams);
      return this.enhanceResponse(nextResponse, originalParams, listMethod);
    };

    enhancedResponse.getAllRemaining = async () => {
      const allItems: T[] = [...response.data];
      let currentResponse = enhancedResponse;
      
      while (currentResponse.pagination.hasMore && currentResponse.pagination.nextPageToken) {
        const nextResponse = await currentResponse.getNextPage();
        if (!nextResponse) break;
        allItems.push(...nextResponse.data);
        currentResponse = nextResponse;
      }
      
      return allItems;
    };

    enhancedResponse.iterateRemainingPages = async function* () {
      let currentResponse: PaginatedResponseWithHelpers<T, P> | null = enhancedResponse;
      
      while (currentResponse) {
        yield currentResponse;
        if (!currentResponse.pagination.hasMore || !currentResponse.pagination.nextPageToken) break;
        currentResponse = await currentResponse.getNextPage();
      }
    };

    enhancedResponse.iterateRemainingItems = async function* () {
      for await (const page of enhancedResponse.iterateRemainingPages()) {
        for (const item of page.data) {
          yield item;
        }
      }
    };

    return enhancedResponse;
  }

  /**
   * Get the next page from a paginated response
   */
  protected async getNextPageInternal<T, P extends PaginationOptions>(
    response: BasePaginatedResponse<T>,
    originalParams: P,
    listMethod: (params: P) => Promise<BasePaginatedResponse<T>>
  ): Promise<BasePaginatedResponse<T> | null> {
    if (!response.pagination.hasMore || !response.pagination.nextPageToken) {
      return null;
    }

    const nextParams = {
      ...originalParams,
      pageToken: response.pagination.nextPageToken,
    } as P;

    return listMethod(nextParams);
  }

  /**
   * Get all pages from a paginated endpoint
   */
  protected async getAllPages<T, P extends PaginationOptions>(
    params: P,
    listMethod: (params: P) => Promise<BasePaginatedResponse<T>>,
    maxPages = 50
  ): Promise<T[]> {
    const allItems: T[] = [];
    let currentParams = { ...params };
    let pageCount = 0;

    do {
      if (pageCount >= maxPages) {
        console.warn(`Reached maximum page limit (${maxPages}). Use manual pagination for very large datasets.`);
        break;
      }

      const response = await listMethod(currentParams as P);
      allItems.push(...response.data);

      if (!response.pagination.hasMore || !response.pagination.nextPageToken) {
        break;
      }

      currentParams = {
        ...currentParams,
        pageToken: response.pagination.nextPageToken,
      };
      pageCount++;
    } while (true);

    return allItems;
  }

  /**
   * Create an async iterator for paginated results
   */
  protected async* iteratePages<T, P extends PaginationOptions>(
    params: P,
    listMethod: (params: P) => Promise<BasePaginatedResponse<T>>
  ): AsyncGenerator<BasePaginatedResponse<T>, void, unknown> {
    let currentParams = { ...params };

    do {
      const response = await listMethod(currentParams as P);
      yield response;

      if (!response.pagination.hasMore || !response.pagination.nextPageToken) {
        break;
      }

      currentParams = {
        ...currentParams,
        pageToken: response.pagination.nextPageToken,
      };
    } while (true);
  }

  /**
   * Create an async iterator for individual items across all pages
   */
  protected async* iterateItems<T, P extends PaginationOptions>(
    params: P,
    listMethod: (params: P) => Promise<BasePaginatedResponse<T>>
  ): AsyncGenerator<T, void, unknown> {
    for await (const page of this.iteratePages(params, listMethod)) {
      for (const item of page.data) {
        yield item;
      }
    }
  }

  /**
   * Create a query builder for advanced querying
   */
  protected createQueryBuilder<T>(tableName: string): QueryBuilder<T> {
    return new QueryBuilder<T>(tableName);
  }

  /**
   * Execute a query built with QueryBuilder
   */
  protected async executeQuery<T, P extends PaginationOptions>(
    queryBuilder: QueryBuilder<T>,
    listMethod: (params: P) => Promise<BasePaginatedResponse<T>>
  ): Promise<SQLQueryResult<T>> {
    const { params, select, sql: sqlQuery } = queryBuilder.build();
    const startTime = new Date();
    
    const response = await listMethod(params as P);
    let data = response.data;

    // Apply field selection if specified
    if (select) {
      if (Array.isArray(select)) {
        // Simple field array selection
        data = data.map(item => {
          const filtered: Partial<T> = {};
          select.forEach(field => {
            if (field in (item as any)) {
              (filtered as any)[field] = (item as any)[field];
            }
          });
          return filtered as T;
        });
      } else {
        // GraphQL-style nested selection
        data = processFieldSelection(data, select as FieldSelection) as T[];
      }
    }

    return {
      data,
      query: sqlQuery || 'Generated from QueryBuilder',
      params,
      executedAt: startTime,
      count: data.length
    };
  }

  /**
   * Execute raw SQL-like queries using template literals
   */
  protected async executeSQL<T, P extends PaginationOptions>(
    sqlTemplate: ReturnType<typeof sql<T>>,
    listMethod: (params: P) => Promise<BasePaginatedResponse<T>>
  ): Promise<SQLQueryResult<T>> {
    const { query, params: sqlParams, parse } = sqlTemplate;
    const parsed = parse();
    
    // Convert SQL-like query to API parameters (simplified implementation)
    const apiParams = this.convertSQLToAPIParams(parsed, sqlParams);
    const startTime = new Date();
    
    const response = await listMethod(apiParams as P);
    
    return {
      data: response.data,
      query,
      params: apiParams,
      executedAt: startTime,
      count: response.data.length
    };
  }

  /**
   * Apply GraphQL-style field selection to a list response
   */
  protected applyFieldSelection<T>(
    response: BasePaginatedResponse<T>,
    selection: FieldSelection
  ): BasePaginatedResponse<Partial<T>> {
    const filteredData = processFieldSelection(response.data, selection);
    return {
      ...response,
      data: filteredData
    };
  }

  /**
   * Convert parsed SQL conditions to API parameters
   */
  private convertSQLToAPIParams(parsed: any, sqlParams: any[]): Record<string, any> {
    // This is a simplified implementation
    // In a real-world scenario, you'd have a more sophisticated SQL parser
    const params: Record<string, any> = {};
    
    // Map SQL parameters to their values
    let paramIndex = 0;
    const conditions = parsed.conditions.raw || '';
    
    // Basic parameter mapping (would need more sophisticated parsing for production)
    if (conditions.includes('projectId')) {
      params.projectId = sqlParams[paramIndex++];
    }
    if (conditions.includes('status')) {
      params.status = sqlParams[paramIndex++];
    }
    if (conditions.includes('assignees')) {
      params.assigneeId = sqlParams[paramIndex++];
    }
    if (conditions.includes('dueDate') && conditions.includes('BETWEEN')) {
      params.dueDateFrom = sqlParams[paramIndex++];
      params.dueDateTo = sqlParams[paramIndex++];
    }
    
    // Handle ORDER BY
    if (parsed.options.orderBy) {
      const orderParts = parsed.options.orderBy.split(' ');
      params.sortBy = orderParts[0];
      if (orderParts[1]) {
        params.sortOrder = orderParts[1].toLowerCase();
      }
    }
    
    // Handle LIMIT
    if (parsed.options.limit) {
      params.pageSize = parsed.options.limit;
    }
    
    return params;
  }
}