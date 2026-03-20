import { HttpError } from '~/shared/errors/http-error.js';
import type { IUserRepository } from './user.repository.interface.js';
import { CreateUserInput, UpdateUserInput } from './user.validators.js';
import { UserEntity } from './user.entity.js';
import { Cradle } from '~/container.js';
import { IUserService } from './user.service.interface.js';

export class UserService implements IUserService {
  private readonly userRepository: IUserRepository;

  constructor({ userRepository }: Pick<Cradle, 'userRepository'>) {
    this.userRepository = userRepository;
  }

  async getUsers(): Promise<UserEntity[]> {
    return this.userRepository.findAll();
  }

  async getUserById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new HttpError(404, `User with id ${id} not found`);
    return user;
  }

  async createUser(input: CreateUserInput): Promise<UserEntity> {
    return this.userRepository.create(input);
  }

  async updateUser(id: string, dto: UpdateUserInput): Promise<UserEntity> {
    // TODO: Create password hash
    const user = await this.userRepository.update(id, dto);
    if (!user) throw new HttpError(404, `User ${id} not found`);
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    const deleted = await this.userRepository.delete(id);
    if (!deleted) throw new HttpError(404, `User ${id} not found`);
  }
}
