import { z } from 'zod';

export const authValidator = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(1),
  }),
});

export type AuthDto = z.infer<typeof authValidator>['body'];
