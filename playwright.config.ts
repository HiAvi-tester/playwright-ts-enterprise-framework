import { defineConfig, devices } from '@playwright/test';
import { env, STORAGE_STATE_PATH } from './utils/env';

/**
 * Project graph:
 *   setup ──▶ chromium
 *         └─▶ firefox
 *   api   (independent, no browser)
 *
 * `setup` logs in once and saves storageState, so UI tests start already
 * authenticated instead of repeating the login flow in every test.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: env.isCI,
  retries: env.isCI ? 2 : 0,
  workers: env.isCI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_000 },

  // In CI each shard writes a blob report that a later job merges into one HTML report.
  reporter: env.isCI
    ? [['blob'], ['github'], ['allure-playwright', { resultsDir: 'allure-results' }]]
    : [['list'], ['html', { open: 'never' }], ['allure-playwright', { resultsDir: 'allure-results' }]],

  use: {
    baseURL: env.baseUrl,
    testIdAttribute: 'data-test', // SauceDemo exposes stable data-test hooks
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },

  projects: [
    {
      name: 'setup',
      testMatch: /setup\/.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      testMatch: /e2e\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE_PATH },
    },
    {
      name: 'firefox',
      testMatch: /e2e\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Firefox'], storageState: STORAGE_STATE_PATH },
    },
    {
      name: 'api',
      testMatch: /api\/.*\.spec\.ts/,
      use: {
        baseURL: env.apiBaseUrl,
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
  ],
});
