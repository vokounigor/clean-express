import { RequestHandler } from 'express';
import { IUserService } from './user.service.interface.js';
import { createUserValidator, updateUserValidator } from './user.validators.js';
import { uuidParam } from '~/shared/validators/common.validator.js';
import { Cradle } from '~/container.js';
import { toUserResponseDto, toUserResponseDtoList } from './user.dto.js';

export class UserController {
  private readonly userService: IUserService;

  constructor({ userService }: Pick<Cradle, 'userService'>) {
    this.userService = userService;
  }

  getAll: RequestHandler = async (_req, res) => {
    const users = await this.userService.getUsers();
    res.json(toUserResponseDtoList(users));
  };

  getOne: RequestHandler = async (req, res) => {
    const {
      params: { id },
    } = uuidParam.parse({ params: req.params });

    const user = await this.userService.getUserById(id);
    res.json(toUserResponseDto(user));
  };

  create: RequestHandler = async (req, res) => {
    const { body } = createUserValidator.parse({ body: req.body });
    const user = await this.userService.createUser(body);
    res.status(201).json(toUserResponseDto(user));
  };

  update: RequestHandler = async (req, res) => {
    const { params, body } = updateUserValidator.parse({
      params: req.params,
      body: req.body,
    });
    const user = await this.userService.updateUser(params.id, body);
    res.json(toUserResponseDto(user));
  };

  delete: RequestHandler = async (req, res) => {
    const { params } = uuidParam.parse({ params: req.params });
    await this.userService.deleteUser(params.id);
    res.status(204).send();
  };
}
