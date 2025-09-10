// Advanced query capabilities for the Rocketlane SDK

export type SortOrder = 'asc' | 'desc' | 'ASC' | 'DESC';
export type ComparisonOperator = '=' | '!=' | '<>' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN' | 'NOT IN' | 'CONTAINS' | 'NOT CONTAINS' | 'BETWEEN' | 'NOT BETWEEN';

export interface QueryCondition {
  field: string;
  operator: ComparisonOperator;
  value: any;
  value2?: any; // For BETWEEN operations
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: Array<{ field: string; direction: SortOrder }>;
  groupBy?: string[];
  select?: Record<string, any> | string[];
}

export interface SQLQueryResult<T> {
  data: T[];
  query: string;
  params: Record<string, any>;
  executedAt: Date;
  count: number;
}

export class QueryBuilder<T = any> {
  private conditions: QueryCondition[] = [];
  private options: QueryOptions = {};
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  // WHERE clauses
  where(field: string, operator: ComparisonOperator, value: any, value2?: any): this {
    this.conditions.push({ field, operator, value, value2 });
    return this;
  }

  whereEquals(field: string, value: any): this {
    return this.where(field, '=', value);
  }

  whereNotEquals(field: string, value: any): this {
    return this.where(field, '!=', value);
  }

  whereGreaterThan(field: string, value: any): this {
    return this.where(field, '>', value);
  }

  whereLessThan(field: string, value: any): this {
    return this.where(field, '<', value);
  }

  whereBetween(field: string, value1: any, value2: any): this {
    return this.where(field, 'BETWEEN', value1, value2);
  }

  whereIn(field: string, values: any[]): this {
    return this.where(field, 'IN', values);
  }

  whereContains(field: string, value: any): this {
    return this.where(field, 'CONTAINS', value);
  }

  whereNotContains(field: string, value: any): this {
    return this.where(field, 'NOT CONTAINS', value);
  }

  whereNotIn(field: string, values: any[]): this {
    return this.where(field, 'NOT IN', values);
  }

  whereLike(field: string, value: string): this {
    return this.where(field, 'LIKE', value);
  }

  // SELECT (field selection)
  select(fields: Record<string, any> | string[]): this {
    this.options.select = fields;
    return this;
  }

  // ORDER BY
  orderBy(field: string, direction: SortOrder = 'asc'): this {
    if (!this.options.orderBy) this.options.orderBy = [];
    this.options.orderBy.push({ field, direction: direction.toLowerCase() as SortOrder });
    return this;
  }

  // GROUP BY
  groupBy(...fields: string[]): this {
    this.options.groupBy = fields;
    return this;
  }

  // LIMIT
  limit(count: number): this {
    this.options.limit = count;
    return this;
  }

  // OFFSET
  offset(count: number): this {
    this.options.offset = count;
    return this;
  }

  // Execute the query (placeholder - would be implemented by resource classes)
  async execute(): Promise<SQLQueryResult<T>> {
    throw new Error('execute() method should be implemented by the resource class');
  }

  // Build the final query parameters
  build(): {
    params: Record<string, any>;
    select?: Record<string, any> | string[];
    sql?: string;
  } {
    const params: Record<string, any> = {};
    
    // Convert conditions to API parameters
    this.conditions.forEach((condition, index) => {
      const paramKey = this.getParamKey(condition.field, condition.operator);
      
      switch (condition.operator.toUpperCase()) {
        case '=':
          params[condition.field] = condition.value;
          break;
        case '!=':
        case '<>':
          params[`${condition.field}_ne`] = condition.value;
          break;
        case '>':
          params[`${condition.field}_gt`] = condition.value;
          break;
        case '<':
          params[`${condition.field}_lt`] = condition.value;
          break;
        case '>=':
          params[`${condition.field}_gte`] = condition.value;
          break;
        case '<=':
          params[`${condition.field}_lte`] = condition.value;
          break;
        case 'LIKE':
          params[`${condition.field}_like`] = condition.value;
          break;
        case 'IN':
          params[`${condition.field}_in`] = condition.value;
          break;
        case 'NOT IN':
          params[`${condition.field}_nin`] = condition.value;
          break;
        case 'CONTAINS':
          params[`${condition.field}_contains`] = condition.value;
          break;
        case 'BETWEEN':
          params[`${condition.field}_gte`] = condition.value;
          params[`${condition.field}_lte`] = condition.value2;
          break;
        case 'NOT BETWEEN':
          params[`${condition.field}_lt`] = condition.value;
          params[`${condition.field}_gt`] = condition.value2;
          break;
      }
    });

    // Add ordering
    if (this.options.orderBy && this.options.orderBy.length > 0) {
      const orderField = this.options.orderBy[0];
      if (orderField) {
        params.sortBy = orderField.field;
        params.sortOrder = orderField.direction;
      }
    }

    // Add pagination
    if (this.options.limit) params.pageSize = this.options.limit;
    if (this.options.offset) params.offset = this.options.offset;

    return {
      params,
      ...(this.options.select && { select: this.options.select }),
      ...(this.toSQL() && { sql: this.toSQL() })
    };
  }

  // Generate SQL representation for debugging/logging
  private toSQL(): string {
    let sql = `SELECT ${this.getSelectClause()} FROM ${this.tableName}`;
    
    if (this.conditions.length > 0) {
      const whereClause = this.conditions.map(c => this.conditionToSQL(c)).join(' AND ');
      sql += ` WHERE ${whereClause}`;
    }

    if (this.options.groupBy && this.options.groupBy.length > 0) {
      sql += ` GROUP BY ${this.options.groupBy.join(', ')}`;
    }

    if (this.options.orderBy && this.options.orderBy.length > 0) {
      const orderClause = this.options.orderBy.map(o => `${o.field} ${o.direction.toUpperCase()}`).join(', ');
      sql += ` ORDER BY ${orderClause}`;
    }

    if (this.options.limit) {
      sql += ` LIMIT ${this.options.limit}`;
    }

    if (this.options.offset) {
      sql += ` OFFSET ${this.options.offset}`;
    }

    return sql;
  }

  private getSelectClause(): string {
    if (!this.options.select) return '*';
    if (Array.isArray(this.options.select)) {
      return this.options.select.join(', ');
    }
    // For object-style selection, return the keys
    return Object.keys(this.options.select).join(', ');
  }

  private conditionToSQL(condition: QueryCondition): string {
    const { field, operator, value, value2 } = condition;
    
    switch (operator.toUpperCase()) {
      case 'BETWEEN':
        return `${field} BETWEEN ${this.formatValue(value)} AND ${this.formatValue(value2)}`;
      case 'NOT BETWEEN':
        return `${field} NOT BETWEEN ${this.formatValue(value)} AND ${this.formatValue(value2)}`;
      case 'IN':
        return `${field} IN (${Array.isArray(value) ? value.map(v => this.formatValue(v)).join(', ') : this.formatValue(value)})`;
      case 'NOT IN':
        return `${field} NOT IN (${Array.isArray(value) ? value.map(v => this.formatValue(v)).join(', ') : this.formatValue(value)})`;
      case 'CONTAINS':
        return `${field} CONTAINS ${this.formatValue(value)}`;
      case 'NOT CONTAINS':
        return `${field} NOT CONTAINS ${this.formatValue(value)}`;
      default:
        return `${field} ${operator} ${this.formatValue(value)}`;
    }
  }

  private formatValue(value: any): string {
    if (typeof value === 'string') return `'${value}'`;
    if (value instanceof Date) return `'${value.toISOString()}'`;
    return String(value);
  }

  private getParamKey(field: string, operator: string): string {
    return `${field}_${operator.toLowerCase().replace(/\s+/g, '_')}`;
  }
}

// SQL Template Literal Helper
export function sql<T = any>(strings: TemplateStringsArray, ...values: any[]): {
  query: string;
  params: any[];
  parse: () => { tableName: string; conditions: any; options: any };
} {
  let query = '';
  const params: any[] = [];
  
  for (let i = 0; i < strings.length; i++) {
    query += strings[i];
    if (i < values.length) {
      query += `$${params.length + 1}`;
      params.push(values[i]);
    }
  }
  
  return {
    query: query.trim(),
    params,
    parse: () => parseSQLQuery(query, params)
  };
}

// Simple SQL parser for extracting table name and basic conditions
function parseSQLQuery(query: string, params: any[]): { tableName: string; conditions: any; options: any } {
  const upperQuery = query.toUpperCase();
  
  // Extract table name
  const fromMatch = upperQuery.match(/FROM\s+(\w+)/);
  const tableName = fromMatch?.[1]?.toLowerCase() || 'unknown';
  
  // Extract WHERE conditions (basic implementation)
  const whereMatch = upperQuery.match(/WHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+GROUP\s+BY|\s+LIMIT|$)/);
  const conditions = whereMatch ? whereMatch[1] : '';
  
  // Extract ORDER BY
  const orderMatch = upperQuery.match(/ORDER\s+BY\s+(.+?)(?:\s+LIMIT|$)/);
  const orderBy = orderMatch ? orderMatch[1] : '';
  
  // Extract LIMIT
  const limitMatch = upperQuery.match(/LIMIT\s+(\d+)/);
  const limit = limitMatch?.[1] ? parseInt(limitMatch[1]) : undefined;
  
  return {
    tableName,
    conditions: { raw: conditions, params },
    options: { orderBy, limit }
  };
}

// GraphQL-style field selection helpers
export interface FieldSelection {
  [key: string]: boolean | FieldSelection;
}

export function processFieldSelection<T>(data: T[], selection: FieldSelection): Partial<T>[] {
  return data.map(item => selectFields(item, selection));
}

function selectFields<T>(item: T, selection: FieldSelection): Partial<T> {
  const result: Partial<T> = {};
  
  for (const [key, value] of Object.entries(selection)) {
    if (key in (item as any)) {
      if (value === true) {
        // Include the field
        (result as any)[key] = (item as any)[key];
      } else if (typeof value === 'object' && (item as any)[key]) {
        // Nested selection
        if (Array.isArray((item as any)[key])) {
          (result as any)[key] = (item as any)[key].map((subItem: any) => selectFields(subItem, value));
        } else {
          (result as any)[key] = selectFields((item as any)[key], value);
        }
      }
    }
  }
  
  return result;
}