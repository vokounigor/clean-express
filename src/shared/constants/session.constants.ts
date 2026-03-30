import type { SerializeOptions } from 'cookie';
import { config } from '~/config/index.js';

export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const SESSION_REFRESH_THRESHOLD_MS = 60 * 60 * 1000;

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: SESSION_TTL_MS,
  path: '/',
} as SerializeOptions;

export const SESSION_COOKIE_NAME = 'session_id' as const;
