import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '~/modules/users/user.service.js';
import { UserRepository } from '~/modules/users/user.repository.js';
import { HttpError } from '~/shared/errors/http-error.js';

const mockRepo: Partial<UserRepository> = {
  findById: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new UserService(mockRepo as UserRepository);
  });

  describe('getUserById', () => {
    it('returns user when found', async () => {
      const user = {
        id: '1',
        name: 'Alice',
        email: 'a@example.com',
        created_at: new Date(),
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
