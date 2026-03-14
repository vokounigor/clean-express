import 'dotenv/config';
import { runner } from 'node-pg-migrate';
import { createAppContainer } from './container.js';
import { createApp } from './app.js';
import { config } from './config/index.js';

const container = createAppContainer();
const app = createApp(container);
const { logger } = container.cradle;

await runner({
  databaseUrl: {
    host: config.PGHOST,
    port: config.PGPORT,
    user: config.PGUSER,
    password: config.PGPASSWORD,
    database: config.PGDATABASE,
  },
  dir: 'db/migrations',
  direction: 'up',
  migrationsTable: 'pgmigrations',
});

const server = app.listen(config.PORT, () => {
  logger.info({ port: config.PORT, env: config.NODE_ENV }, 'Server started');
});

const shutdown = async (signal: string) => {
  logger.info({ signal }, 'Shutting down...');
  server.close(async () => {
    await container.cradle.db.end();
    logger.info('Shutdown complete');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
