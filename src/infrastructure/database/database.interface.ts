import type { QueryResult, QueryResultRow, PoolClient } from 'pg';

export interface IDatabase {
  query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: unknown[]
  ): Promise<QueryResult<T>>;

  getClient(): Promise<PoolClient>;

  withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T>;

  end(): Promise<void>;
}
