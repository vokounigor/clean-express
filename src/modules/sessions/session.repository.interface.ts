import type { SessionEntity } from './session.entity.js';

export interface ISessionRepository {
  createSession(userId: string, expiresAt: Date): Promise<SessionEntity>;
  touchSession(id: string, newExpiresAt: Date): Promise<void>;
  findById(id: string): Promise<SessionEntity | null>;
  deleteSession(id: string): Promise<void>;
  deleteExpired(): Promise<void>;
  deleteForUser(userId: string): Promise<void>;
}
