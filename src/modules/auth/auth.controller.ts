import type { RequestHandler } from 'express';
import type { Cradle } from '~/container.js';
import type { IAuthService } from './auth.service.interface.js';
import { authValidator } from './auth.validators.js';
import { toUserResponseDto } from '~/modules/users/user.dto.js';
import {
  clearSessionCookie,
  getSessionIdFromRequest,
  setSessionCookie,
} from './auth.cookie.js';

export class AuthController {
  private readonly authService: IAuthService;

  constructor({ authService }: Pick<Cradle, 'authService'>) {
    this.authService = authService;
  }

  signUp: RequestHandler = async (req, res) => {
    const { body } = authValidator.parse({ body: req.body });
    const { user, session } = await this.authService.signUp(body);

    setSessionCookie(res, session.id);
    res.status(201).json(toUserResponseDto(user));
  };

  logIn: RequestHandler = async (req, res) => {
    const { body } = authValidator.parse({ body: req.body });
    const { user, session } = await this.authService.logIn(body);

    setSessionCookie(res, session.id);
    res.json(toUserResponseDto(user));
  };

  logOut: RequestHandler = async (req, res) => {
    const sessionId = getSessionIdFromRequest(req);
    if (sessionId) await this.authService.logOut(sessionId);

    clearSessionCookie(res);
    res.status(204).send();
  };
}
