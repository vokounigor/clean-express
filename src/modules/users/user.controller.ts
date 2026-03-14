import { RequestHandler } from 'express';
import { UserService } from './user.service.js';
import { createUserSchema } from './user.schema.js';
import { Cradle } from '~/container.js';

export class UserController {
  private readonly userService: UserService;

  constructor({ userService }: Pick<Cradle, 'userService'>) {
    this.userService = userService;
  }

  getAll: RequestHandler = async (_req, res) => {
    const users = await this.userService.getUsers();
    res.json(users);
  };

  getOne: RequestHandler = async (req, res) => {
    // TODO: Fix
    // @ts-expect-error to be added
    const user = await this.userService.getUserById(req.params.id);
    res.json(user);
  };

  create: RequestHandler = async (req, res) => {
    const { body } = createUserSchema.parse({ body: req.body });
    const user = await this.userService.createUser(body);
    res.status(201).json(user);
  };
}
