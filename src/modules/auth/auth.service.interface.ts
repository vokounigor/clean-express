import type { UserEntity } from '~/modules/users/user.entity.js';
import type { SessionEntity } from '~/modules/sessions/session.entity.js';
import type { AuthDto } from './auth.validators.js';

export interface IAuthService {
  signUp(dto: AuthDto): Promise<{ user: UserEntity; session: SessionEntity }>;
  logIn(dto: AuthDto): Promise<{ user: UserEntity; session: SessionEntity }>;
  logOut(sessionId: string): Promise<void>;
}
