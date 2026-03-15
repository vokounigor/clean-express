import pg from 'pg';
import type { QueryResult, QueryResultRow, PoolClient } from 'pg';
import type { IDatabase } from './database.interface.js';
import { config } from '~/config/index.js';
import { Cradle } from '~/container.js';

export class PostgresDatabase implements IDatabase {
  private readonly pool: pg.Pool;

  constructor({ logger }: Pick<Cradle, 'logger'>) {
    this.pool = new pg.Pool({
      host: config.PGHOST,
      port: config.PGPORT,
      user: config.PGUSER,
      password: config.PGPASSWORD,
      database: config.PGDATABASE,
      ssl: config.PGSSL ? { rejectUnauthorized: false } : false,
      max: config.PG_POOL_MAX,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });

    this.pool.on('error', (err) => {
      logger.error({ err }, 'Idle database client encountered an error');
    });

    this.pool.on('connect', () => {
      logger.debug('New database client connected');
    });
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: unknown[]
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(sql, params);
  }

  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async end(): Promise<void> {
    await this.pool.end();
  }
}
