import { IDatabase } from '~/infrastructure/database/database.interface.js';
import { CreateUserInput, UpdateUserInput } from './user.validators.js';
import { Cradle } from '~/container.js';
import { UserEntity } from './user.entity.js';

export class UserRepository {
  private readonly db: IDatabase;

  constructor({ db }: Pick<Cradle, 'db'>) {
    this.db = db;
  }

  async findAll(): Promise<UserEntity[]> {
    const { rows } = await this.db.query<UserEntity>(
      'SELECT * FROM users ORDER BY created_at DESC'
    );

    return rows.map(UserEntity.fromRow);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const result = await this.db.query<UserEntity>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    return result.rows[0] ? UserEntity.fromRow(result.rows[0]) : null;
  }

  async create(input: CreateUserInput): Promise<UserEntity> {
    const result = await this.db.query<UserEntity>(
      'INSERT INTO users (password, email) VALUES ($1, $2) RETURNING *',
      [input.password, input.email]
    );

    return UserEntity.fromRow(result.rows[0]);
  }

  async update(id: string, dto: UpdateUserInput): Promise<UserEntity | null> {
    const { rows } = await this.db.query(
      `UPDATE users
       SET password = COALESCE($1, password), email = COALESCE($2, email), updated_at = now()
       WHERE id = $3
       RETURNING *`,
      [dto.password ?? null, dto.email ?? null, id]
    );

    return rows[0] ? UserEntity.fromRow(rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const { rowCount } = await this.db.query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );

    return (rowCount ?? 0) > 0;
  }
}
