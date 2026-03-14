import { z } from 'zod';

export const uuidParam = z.object({
  params: z.object({
    id: z.uuid(),
  }),
});
