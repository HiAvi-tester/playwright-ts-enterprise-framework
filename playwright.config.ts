import { defineConfig, devices } from '@playwright/test';
import { env, STORAGE_STATE } from './utils/env';

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
  retries: env.retries,
  workers: env.workers,
  timeout: 30_000,
  expect: { timeout: 7_000 },

  // In CI each shard writes a blob report; a later job merges them into one HTML report.
  reporter: env.isCI
    ? [['blob'], ['github'], ['allure-playwright', { resultsDir: 'allure-results' }]]
    : [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }], ['allure-playwright', { resultsDir: 'allure-results' }]],

  use: {
    baseURL: env.web.baseURL,
    testIdAttribute: 'data-test', // SauceDemo exposes stable data-test hooks
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },

  projects: [
    // 1. Logs in once through the UI and saves the session to STORAGE_STATE.
    {
      name: 'setup',
      testMatch: /setup\/.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // 2. Browser E2E suites reuse the saved session (no UI login per test).
    {
      name: 'chromium',
      testMatch: /e2e\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
    },
    {
      name: 'firefox',
      testMatch: /e2e\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Firefox'], storageState: STORAGE_STATE },
    },

    // 3. API suite: no browser is launched, only APIRequestContext.
    {
      name: 'api',
      testMatch: /api\/.*\.spec\.ts/,
      use: {
        baseURL: env.api.baseURL,
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
  ],
});
