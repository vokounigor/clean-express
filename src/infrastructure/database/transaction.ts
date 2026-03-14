import type { IDatabase } from './database.interface.js';
import type { PoolClient } from 'pg';

export const withTransaction = async <T>(
  db: IDatabase,
  fn: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
