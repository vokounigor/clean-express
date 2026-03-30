import { z } from 'zod';
import { SESSION_REFRESH_THRESHOLD_MS } from '~/shared/constants/session.constants.js';

const sessionRowSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  created_at: z.date(),
  expires_at: z.date(),
  updated_at: z.date(),
});

export class SessionEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly createdAt: Date,
    public readonly expiresAt: Date,
    public readonly updatedAt: Date
  ) {}

  static fromRow(row: unknown): SessionEntity {
    const parsed = sessionRowSchema.parse(row);
    return new SessionEntity(
      parsed.id,
      parsed.userId,
      parsed.created_at,
      parsed.expires_at,
      parsed.updated_at
    );
  }

  isExpired(): boolean {
    return this.expiresAt < new Date();
  }

  shouldRefresh(): boolean {
    return this.updatedAt.getTime() < Date.now() - SESSION_REFRESH_THRESHOLD_MS;
  }
}
