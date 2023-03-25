import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['**/*.test.cjs'],
  },
  esbuild: {
    format: 'cjs',
  },
});
