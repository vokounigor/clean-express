import { createContainer, asClass, asValue, InjectionMode } from 'awilix';
import { createLogger } from './infrastructure/logger/index.js';
import { PostgresDatabase } from './infrastructure/database/pg-database.js';
import type { IDatabase } from './infrastructure/database/database.interface.js';
import { UserRepository } from './modules/users/user.repository.js';
import { UserService } from './modules/users/user.service.js';
import { UserController } from './modules/users/user.controller.js';
import { SessionRepository } from './modules/sessions/session.repository.js';
import { AuthService } from './modules/auth/auth.service.js';
import { AuthController } from './modules/auth/auth.controller.js';
import type { IUserRepository } from '~/modules/users/user.repository.interface.js';
import type { IUserService } from '~/modules/users/user.service.interface.js';
import type { ISessionRepository } from '~/modules/sessions/session.repository.interface.js';
import type { IAuthService } from '~/modules/auth/auth.service.interface.js';

export interface Cradle {
  logger: ReturnType<typeof createLogger>;
  db: IDatabase;
  userRepository: IUserRepository;
  userService: IUserService;
  userController: UserController;
  sessionRepository: ISessionRepository;
  authService: IAuthService;
  authController: AuthController;
}

export const createAppContainer = () => {
  const container = createContainer<Cradle>({
    injectionMode: InjectionMode.PROXY,
  });

  const logger = createLogger('app');

  container.register({
    logger: asValue(logger),
    db: asClass(PostgresDatabase).singleton(),
    userRepository: asClass(UserRepository).singleton(),
    userService: asClass(UserService).singleton(),
    userController: asClass(UserController).singleton(),
    sessionRepository: asClass(SessionRepository).singleton(),
    authService: asClass(AuthService).singleton(),
    authController: asClass(AuthController).singleton(),
  });

  return container;
};
