import type { UserEntity } from './user.entity.js';
import { CreateUserInput, UpdateUserInput } from './user.validators.js';

export interface IUserService {
  getUsers(): Promise<UserEntity[]>;
  getUserById(id: string): Promise<UserEntity>;
  createUser(dto: CreateUserInput): Promise<UserEntity>;
  updateUser(id: string, dto: UpdateUserInput): Promise<UserEntity>;
  deleteUser(id: string): Promise<void>;
}
