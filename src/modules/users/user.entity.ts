import { z } from 'zod';

const userRowSchema = z.object({
  id: z.uuid(),
  password: z.string(),
  email: z.email(),
  created_at: z.date(),
  updated_at: z.date(),
});

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly password: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static fromRow(row: unknown): UserEntity {
    const parsed = userRowSchema.parse(row);
    return new UserEntity(
      parsed.id,
      parsed.email,
      parsed.password,
      parsed.created_at,
      parsed.updated_at
    );
  }
}
