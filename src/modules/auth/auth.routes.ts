import { Router } from 'express';
import type { AuthController } from './auth.controller.js';

export const createAuthRouter = (controller: AuthController): Router => {
  const router = Router();

  router.post('/signup', controller.signUp);
  router.post('/login', controller.logIn);
  router.post('/logout', controller.logOut);

  return router;
};
