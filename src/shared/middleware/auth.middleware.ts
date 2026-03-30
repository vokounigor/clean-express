import type { RequestHandler } from 'express';
import type { ISessionRepository } from '~/modules/sessions/session.repository.interface.js';
import type { IUserRepository } from '~/modules/users/user.repository.interface.js';
import type { UserEntity } from '~/modules/users/user.entity.js';
import {
  clearSessionCookie,
  getSessionIdFromRequest,
} from '~/modules/auth/auth.cookie.js';
import { HttpError } from '~/shared/errors/http-error.js';
import { SESSION_TTL_MS } from '../constants/session.constants.js';

declare global {
  namespace Express {
    interface Request {
      user: UserEntity;
    }
  }
}

export const createAuthenticateMiddleware =
  (
    sessionRepository: ISessionRepository,
    userRepository: IUserRepository
  ): RequestHandler =>
  async (req, res, next) => {
    try {
      const sessionId = getSessionIdFromRequest(req);
      if (!sessionId) {
        throw new HttpError(401, 'No session');
      }

      const session = await sessionRepository.findById(sessionId);
      if (!session || session.isExpired()) {
        clearSessionCookie(res);
        throw new HttpError(401, 'Invalid or expired session');
      }

      const user = await userRepository.findById(session.userId);
      if (!user) {
        throw new HttpError(401, 'User not found');
      }

      if (session.shouldRefresh()) {
        const newExpiresAt = new Date(Date.now() + SESSION_TTL_MS);
        await sessionRepository.touchSession(session.id, newExpiresAt);
      }

      req.user = user;
      next();
    } catch (err) {
      next(err);
    }
  };
