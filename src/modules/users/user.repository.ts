import { IDatabase } from '~/infrastructure/database/database.interface.js';
import { AppLogger } from '~/infrastructure/logger/index.js';
import { CreateUserInput } from './user.schema.js';
import { Cradle } from '~/container.js';

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: Date;
}

export class UserRepository {
  private readonly db: IDatabase;
  private readonly logger: AppLogger;

  constructor({ db, logger }: Pick<Cradle, 'db' | 'logger'>) {
    this.db = db;
    this.logger = logger;
  }

  async findAll(): Promise<User[]> {
    const result = await this.db.query<User>(
      'SELECT * FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.db.query<User>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] ?? null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const result = await this.db.query<User>(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [input.name, input.email]
    );
    // TODO: FIX
    // @ts-expect-error to be fixed
    this.logger.info({ userId: result.rows[0].id }, 'User created');
    // @ts-expect-error to be fixed
    return result.rows[0];
  }
}
