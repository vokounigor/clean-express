import { Cradle } from '~/container.js';
import { IDatabase } from '~/infrastructure/database/database.interface.js';
import { SessionEntity } from './session.entity.js';
import { ISessionRepository } from './session.repository.interface.js';

export class SessionRepository implements ISessionRepository {
  private readonly db: IDatabase;
  private readonly logger: Cradle['logger'];

  constructor({ db, logger }: Pick<Cradle, 'db' | 'logger'>) {
    this.db = db;
    this.logger = logger;
  }

  async createSession(userId: string, expiresAt: Date): Promise<SessionEntity> {
    const result = await this.db.query(
      'INSERT INTO sessions (user_id, expires_at) VALUES ($1, $2) RETURNING *',
      [userId, expiresAt]
    );

    return SessionEntity.fromRow(result.rows[0]);
  }

  async findById(id: string): Promise<SessionEntity | null> {
    const result = await this.db.query('SELECT * FROM sessions WHERE id = $1', [
      id,
    ]);

    return result.rows[0] ? SessionEntity.fromRow(result.rows[0]) : null;
  }

  async deleteSession(id: string): Promise<void> {
    await this.db.query('DELETE FROM sessions WHERE id = $1', [id]);
  }

  async deleteForUser(userId: string): Promise<void> {
    await this.db.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
    this.logger.info({ userId }, 'All sessions invalidated');
  }

  async deleteExpired(): Promise<void> {
    const { rowCount } = await this.db.query(
      'DELETE FROM sessions WHERE expires_at < now()'
    );
    this.logger.info({ count: rowCount }, 'Expired sessions cleaned up');
  }
}
