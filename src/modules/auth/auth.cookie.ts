import cookie from 'cookie';
import { Request, Response } from 'express';
import {
  SESSION_COOKIE_OPTIONS,
  SESSION_COOKIE_NAME,
} from '../../shared/constants/session.constants.js';

export function setSessionCookie(res: Response, sessionId: string): void {
  res.setHeader(
    'Set-Cookie',
    cookie.serialize(SESSION_COOKIE_NAME, sessionId, SESSION_COOKIE_OPTIONS)
  );
}

export function clearSessionCookie(res: Response): void {
  res.setHeader(
    'Set-Cookie',
    cookie.serialize(SESSION_COOKIE_NAME, '', {
      ...SESSION_COOKIE_OPTIONS,
      maxAge: 0,
    })
  );
}

export function getSessionIdFromRequest(req: Request): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  const parsed = cookie.parse(header);
  return parsed[SESSION_COOKIE_NAME] ?? null;
}
