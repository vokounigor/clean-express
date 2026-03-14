import { HttpError } from '~/shared/errors/http-error.js';
import { UserRepository, User } from './user.repository.js';
import { CreateUserInput } from './user.schema.js';
import { Cradle } from '~/container.js';

export class UserService {
  private readonly userRepository: UserRepository;

  constructor({ userRepository }: Pick<Cradle, 'userRepository'>) {
    this.userRepository = userRepository;
  }

  async getUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new HttpError(404, `User with id ${id} not found`);
    return user;
  }

  async createUser(input: CreateUserInput): Promise<User> {
    return this.userRepository.create(input);
  }
}
