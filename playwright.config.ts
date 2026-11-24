import { defineConfig } from '@playwright/test';

// End-to-end tests drive the built app (`npm run build`) with Electron.
// Set E2E_EXECUTABLE to a packaged binary to test that instead.
export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  use: { trace: 'retain-on-failure' },
});
