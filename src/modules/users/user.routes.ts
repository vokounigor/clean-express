import { Router } from 'express';
import { UserController } from './user.controller.js';

export const createUserRouter = (controller: UserController): Router => {
  const router = Router();

  router.get('/', controller.getAll);
  router.get('/:id', controller.getOne);
  router.post('/', controller.create);

  return router;
};
