import { z } from 'zod';
import { uuidParam } from '~/shared/validators/common.validator.js';

export const createUserValidator = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    email: z.email(),
  }),
});

export const updateUserValidator = z.object({
  params: uuidParam.shape.params,
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    email: z.email().optional(),
  }),
});

export type CreateUserInput = z.infer<typeof createUserValidator>['body'];
export type UpdateUserInput = z.infer<typeof updateUserValidator>['body'];
