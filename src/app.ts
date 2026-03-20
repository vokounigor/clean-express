import express from 'express';
import { pinoHttp } from 'pino-http';
import { AwilixContainer } from 'awilix';
import { Cradle } from './container.js';
import { createUserRouter } from './modules/users/user.routes.js';
import { createErrorHandler } from './shared/middleware/error-handler.middleware.js';
import { createAuthRouter } from './modules/auth/auth.routes.js';
import { createAuthenticateMiddleware } from './shared/middleware/auth.middleware.js';

export const createApp = (container: AwilixContainer<Cradle>) => {
  const app = express();
  const {
    logger,
    userController,
    authController,
    sessionRepository,
    userRepository,
  } = container.cradle;
  const authenticate = createAuthenticateMiddleware(
    sessionRepository,
    userRepository
  );

  app.use(express.json());
  app.use(pinoHttp({ logger }));

  app.use('/health', (_, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/auth', createAuthRouter(authController));

  // Protected routes
  app.use(authenticate);
  app.use('/users', createUserRouter(userController));

  app.use(createErrorHandler(logger));

  return app;
};
