import pino from 'pino';
import { config } from '~/config/index.js';

export const createLogger = (name?: string) =>
  pino({
    name,
    level: config.LOG_LEVEL,
    transport:
      config.NODE_ENV === 'development'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
  });

export type AppLogger = ReturnType<typeof createLogger>;
