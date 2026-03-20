import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '~/modules/auth/auth.service.js';
import { HttpError } from '~/shared/errors/http-error.js';
import type { UserRepository } from '~/modules/users/user.repository.js';
import type { SessionRepository } from '~/modules/sessions/session.repository.js';
import { UserEntity } from '~/modules/users/user.entity.js';
import { SessionEntity } from '~/modules/sessions/session.entity.js';
import { hashPassword, verifyPassword } from '~/shared/crypto/password.js';
import { SESSION_TTL_MS } from '~/shared/constants/session.constants.js';

// Mock the crypto module so tests are deterministic and fast —
// scrypt is intentionally slow, we don't want that in unit tests
vi.mock('~/shared/crypto/password.js', () => ({
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
}));

const makeUser = (overrides?: Partial<UserEntity>): UserEntity =>
  new UserEntity(
    overrides?.id ?? 'user-uuid-1',
    overrides?.email ?? 'alice@example.com',
    overrides?.password ?? 'salt:hash',
    overrides?.createdAt ?? new Date('2024-01-01'),
    overrides?.updatedAt ?? new Date('2024-01-01')
  );

const makeSession = (overrides?: Partial<SessionEntity>): SessionEntity =>
  new SessionEntity(
    overrides?.id ?? 'session-uuid-1',
    overrides?.userId ?? 'user-uuid-1',
    overrides?.createdAt ?? new Date('2024-01-01'),
    overrides?.expiresAt ?? new Date(Date.now() + SESSION_TTL_MS)
  );

const mockUserRepository = {
  findByEmail: vi.fn(),
  create: vi.fn(),
} as unknown as UserRepository;

const mockSessionRepository = {
  createSession: vi.fn(),
  deleteSession: vi.fn(),
} as unknown as SessionRepository;

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new AuthService({
      userRepository: mockUserRepository,
      sessionRepository: mockSessionRepository,
    });
  });

  describe('signUp', () => {
    const dto = { email: 'alice@example.com', password: 'password123' };

    it('creates a user and session when email is not taken', async () => {
      const user = makeUser();
      const session = makeSession();

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(hashPassword).mockResolvedValue('salt:hashedpassword');
      vi.mocked(mockUserRepository.create).mockResolvedValue(user);
      vi.mocked(mockSessionRepository.createSession).mockResolvedValue(session);

      const result = await authService.signUp(dto);

      expect(result.user).toBe(user);
      expect(result.session).toBe(session);
    });

    it('hashes the password before storing it', async () => {
      const user = makeUser();

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(hashPassword).mockResolvedValue('salt:hashedpassword');
      vi.mocked(mockUserRepository.create).mockResolvedValue(user);
      vi.mocked(mockSessionRepository.createSession).mockResolvedValue(
        makeSession()
      );

      await authService.signUp(dto);

      expect(hashPassword).toHaveBeenCalledWith(dto.password);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: dto.email,
        password: 'salt:hashedpassword',
      });
    });

    it('throws 409 when email is already in use', async () => {
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(makeUser());

      await expect(authService.signUp(dto)).rejects.toMatchObject({
        statusCode: 409,
        message: 'Email already in use',
      });
    });

    it('does not create a user or session when email is taken', async () => {
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(makeUser());

      await expect(authService.signUp(dto)).rejects.toThrow(HttpError);

      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockSessionRepository.createSession).not.toHaveBeenCalled();
    });

    it('creates a session with a future expiry', async () => {
      const before = Date.now();

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(hashPassword).mockResolvedValue('salt:hash');
      vi.mocked(mockUserRepository.create).mockResolvedValue(makeUser());
      vi.mocked(mockSessionRepository.createSession).mockResolvedValue(
        makeSession()
      );

      await authService.signUp(dto);

      const session = vi.mocked(mockSessionRepository.createSession).mock
        .calls[0];
      expect((session![1] as Date).getTime()).toBeGreaterThan(before);
    });
  });

  describe('logIn', () => {
    const dto = { email: 'alice@example.com', password: 'password123' };

    it('returns user and session when credentials are valid', async () => {
      const user = makeUser();
      const session = makeSession();

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(user);
      vi.mocked(verifyPassword).mockResolvedValue(true);
      vi.mocked(mockSessionRepository.createSession).mockResolvedValue(session);

      const result = await authService.logIn(dto);

      expect(result.user).toBe(user);
      expect(result.session).toBe(session);
    });

    it('verifies against the stored password hash', async () => {
      const user = makeUser({ password: 'salt:correcthash' });

      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(user);
      vi.mocked(verifyPassword).mockResolvedValue(true);
      vi.mocked(mockSessionRepository.createSession).mockResolvedValue(
        makeSession()
      );

      await authService.logIn(dto);

      expect(verifyPassword).toHaveBeenCalledWith(
        dto.password,
        'salt:correcthash'
      );
    });

    it('throws 401 when password is wrong', async () => {
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(makeUser());
      vi.mocked(verifyPassword).mockResolvedValue(false);

      await expect(authService.logIn(dto)).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid credentials',
      });
    });

    it('throws 401 when user does not exist', async () => {
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(verifyPassword).mockResolvedValue(false);

      await expect(authService.logIn(dto)).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid credentials',
      });
    });

    it('still calls verifyPassword when user does not exist to prevent timing attacks', async () => {
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(verifyPassword).mockResolvedValue(false);

      await expect(authService.logIn(dto)).rejects.toThrow(HttpError);

      // Must always reach verifyPassword — skipping it would leak whether
      // the email exists via response timing
      expect(verifyPassword).toHaveBeenCalledOnce();
    });

    it('does not create a session when credentials are invalid', async () => {
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(makeUser());
      vi.mocked(verifyPassword).mockResolvedValue(false);

      await expect(authService.logIn(dto)).rejects.toThrow(HttpError);

      expect(mockSessionRepository.createSession).not.toHaveBeenCalled();
    });
  });

  describe('logOut', () => {
    it('deletes the session by id', async () => {
      vi.mocked(mockSessionRepository.deleteSession).mockResolvedValue(
        undefined
      );

      await authService.logOut('session-uuid-1');

      expect(mockSessionRepository.deleteSession).toHaveBeenCalledWith(
        'session-uuid-1'
      );
    });

    it('does not throw if session does not exist', async () => {
      vi.mocked(mockSessionRepository.deleteSession).mockResolvedValue(
        undefined
      );

      await expect(
        authService.logOut('nonexistent-session')
      ).resolves.not.toThrow();
    });
  });
});
