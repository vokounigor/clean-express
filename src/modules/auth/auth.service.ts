import { Cradle } from '~/container.js';
import { ISessionRepository } from '../sessions/session.repository.interface.js';
import { IUserRepository } from '../users/user.repository.interface.js';
import { SessionEntity } from '../sessions/session.entity.js';
import { UserEntity } from '../users/user.entity.js';
import { AuthDto } from './auth.validators.js';
import { HttpError } from '~/shared/errors/http-error.js';
import { SESSION_TTL_MS } from '../../shared/constants/session.constants.js';
import { hashPassword, verifyPassword } from '~/shared/crypto/password.js';
import { IAuthService } from './auth.service.interface.js';

export class AuthService implements IAuthService {
  private readonly sessionRepository: ISessionRepository;
  private readonly userRepository: IUserRepository;

  constructor({
    sessionRepository,
    userRepository,
  }: Pick<Cradle, 'sessionRepository' | 'userRepository'>) {
    this.sessionRepository = sessionRepository;
    this.userRepository = userRepository;
  }

  async signUp(
    dto: AuthDto
  ): Promise<{ user: UserEntity; session: SessionEntity }> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new HttpError(409, 'Email already in use');
    }

    const passwordHash = await hashPassword(dto.password);
    const user = await this.userRepository.create({
      email: dto.email,
      password: passwordHash,
    });

    const session = await this.createSession(user.id);
    return { user, session };
  }

  async logIn(
    dto: AuthDto
  ): Promise<{ user: UserEntity; session: SessionEntity }> {
    const user = await this.userRepository.findByEmail(dto.email);

    const dummyStored = 'a'.repeat(32) + ':' + 'b'.repeat(128);
    const isValid = await verifyPassword(
      dto.password,
      user?.password ?? dummyStored
    );

    if (!user || !isValid) {
      throw new HttpError(401, 'Invalid credentials');
    }

    const session = await this.createSession(user.id);
    return { user, session };
  }

  async logOut(sessionId: string): Promise<void> {
    await this.sessionRepository.deleteSession(sessionId);
  }

  private async createSession(userId: string): Promise<SessionEntity> {
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    return this.sessionRepository.createSession(userId, expiresAt);
  }
}
