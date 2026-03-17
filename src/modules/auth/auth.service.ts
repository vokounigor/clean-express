import { Cradle } from '~/container.js';
import { SessionRepository } from '../sessions/session.repository.js';

export class AuthService {
  private readonly sessionRepository: SessionRepository;

  constructor({ sessionRepository }: Pick<Cradle, 'sessionRepository'>) {
    this.sessionRepository = sessionRepository;
  }
}
