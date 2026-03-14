import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '~': resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/e2e/**/*.e2e.test.ts'],
    pool: 'forks',
  },
});
