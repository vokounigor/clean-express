import { z } from 'zod';

const userRowSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  created_at: z.date(),
});

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly createdAt: Date
  ) {}

  static fromRow(row: unknown): UserEntity {
    const parsed = userRowSchema.parse(row);
    return new UserEntity(
      parsed.id,
      parsed.name,
      parsed.email,
      parsed.created_at
    );
  }
}
