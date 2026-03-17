import { asValue } from 'awilix';
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import supertest from 'supertest';
import { createAppContainer } from '~/container.js';
import { createApp } from '~/app.js';
import { IDatabase } from '~/infrastructure/database/database.interface.js';

const mockDb: IDatabase = {
  query: vi.fn(),
  getClient: vi.fn(),
  end: vi.fn(),
  withTransaction: vi.fn(),
};

describe('Users API (e2e)', () => {
  let request: supertest.Agent;
  let container: ReturnType<typeof createAppContainer>;

  beforeAll(() => {
    container = createAppContainer();

    container.register({ db: asValue(mockDb) });
    const app = createApp(container);
    request = supertest(app);
  });

  afterAll(async () => {
    await container.cradle.db.end();
  });

  it('GET /users returns 200', async () => {
    vi.mocked(mockDb.query).mockResolvedValueOnce({
      rows: [],
      rowCount: 0,
    } as any);

    const res = await request.get('/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /users validates input', async () => {
    const res = await request.post('/users').send({ name: '' });
    expect(res.status).toBe(422);
  });
});
