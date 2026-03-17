import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '~/modules/users/user.service.js';
import { UserRepository } from '~/modules/users/user.repository.js';
import { HttpError } from '~/shared/errors/http-error.js';

const mockRepo = {
  findById: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
} as unknown as UserRepository;

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new UserService({ userRepository: mockRepo });
  });

  describe('getUserById', () => {
    it('returns user when found', async () => {
      const user = {
        id: '1',
        email: 'a@example.com',
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(mockRepo.findById!).mockResolvedValue(user);

      await expect(service.getUserById('1')).resolves.toEqual(user);
    });

    it('throws 404 HttpError when not found', async () => {
      vi.mocked(mockRepo.findById!).mockResolvedValue(null);

      await expect(service.getUserById('999')).rejects.toThrow(HttpError);
      await expect(service.getUserById('999')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });
});
