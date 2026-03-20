import type { UserEntity } from './user.entity.js';
import { CreateUserInput, UpdateUserInput } from './user.validators.js';

export interface IUserRepository {
  findAll(): Promise<UserEntity[]>;
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(dto: CreateUserInput): Promise<UserEntity>;
  update(id: string, dto: UpdateUserInput): Promise<UserEntity | null>;
  delete(id: string): Promise<boolean>;
}
