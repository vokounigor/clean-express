import type { RequestHandler } from 'express';
import type { SessionRepository } from '~/modules/sessions/session.repository.js';
import type { UserRepository } from '~/modules/users/user.repository.js';
import { getSessionIdFromRequest } from '~/modules/auth/auth.cookie.js';
import { HttpError } from '~/shared/errors/http-error.js';
import type { UserEntity } from '~/modules/users/user.entity.js';

declare global {
  namespace Express {
    interface Request {
      user: UserEntity;
    }
  }
}

export const createAuthenticateMiddleware =
  (
    sessionRepository: SessionRepository,
    userRepository: UserRepository
  ): RequestHandler =>
  async (req, _res, next) => {
    try {
      const sessionId = getSessionIdFromRequest(req);
      if (!sessionId) {
        throw new HttpError(401, 'No session');
      }

      const session = await sessionRepository.findById(sessionId);
      if (!session || session.isExpired()) {
        throw new HttpError(401, 'Invalid or expired session');
      }

      const user = await userRepository.findById(session.userId);
      if (!user) {
        throw new HttpError(401, 'User not found');
      }

      req.user = user;
      next();
    } catch (err) {
      next(err);
    }
  };
