import pino from 'pino';
import { config } from '~/config/index.js';
import path from 'node:path';

const logPath = path.join(process.cwd(), 'src', 'storage', 'logs');

export const createLogger = (name?: string) =>
  pino({
    name,
    level: config.LOG_LEVEL,
    transport:
      config.NODE_ENV === 'development'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : {
            target: 'pino/file',
            options: {
              destination: path.join(
                logPath,
                `app-${new Date().toISOString().split('T')[0]}.log`
              ),
            },
          },
  });

export type AppLogger = ReturnType<typeof createLogger>;
