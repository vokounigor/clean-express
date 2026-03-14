import express from 'express';
import { pinoHttp } from 'pino-http';
import { AwilixContainer } from 'awilix';
import { Cradle } from './container.js';
import { createUserRouter } from './modules/users/user.routes.js';
import { createErrorHandler } from './shared/middleware/error-handler.middleware.js';

export const createApp = (container: AwilixContainer<Cradle>) => {
  const app = express();
  const { logger, userController } = container.cradle;

  app.use(express.json());
  app.use(pinoHttp({ logger }));

  app.use('/users', createUserRouter(userController));

  app.use(createErrorHandler(logger));

  return app;
};
