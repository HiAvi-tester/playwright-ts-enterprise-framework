import { defineConfig, devices } from '@playwright/test';
import { env, HRM_STORAGE_STATE, STORAGE_STATE } from './utils/env';

/**
 * Project graph (one target application per group):
 *
 *   SauceDemo        setup ──▶ chromium
 *                          └─▶ firefox
 *   Restful-Booker   api                     (no browser)
 *   OrangeHRM        hrm-setup ──▶ hrm-chromium
 *   AutomationEx.    ae-api                  (no browser)
 *                    ae-ui                   (users seeded through the API per test)
 *
 * Setup projects log in once and save storageState, so UI tests start already
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

  // In CI each job/shard writes a blob report; a later job merges them into one HTML report.
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
    // ── SauceDemo ────────────────────────────────────────────────────────────
    {
      name: 'setup',
      testMatch: /tests\/setup\/auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium',
      testMatch: /tests\/saucedemo\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
    },
    {
      name: 'firefox',
      testMatch: /tests\/saucedemo\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Firefox'], storageState: STORAGE_STATE },
    },

    // ── Restful-Booker: API only, no browser is launched ─────────────────────
    {
      name: 'api',
      testMatch: /tests\/api\/.*\.spec\.ts/,
      use: {
        baseURL: env.api.baseURL,
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },

    // ── OrangeHRM: shared public demo, slower than the others ────────────────
    {
      name: 'hrm-setup',
      testMatch: /tests\/hrm\/.*\.setup\.ts/,
      timeout: 60_000,
      use: { ...devices['Desktop Chrome'], baseURL: env.hrm.baseURL },
    },
    {
      name: 'hrm-chromium',
      testMatch: /tests\/hrm\/.*\.spec\.ts/,
      dependencies: ['hrm-setup'],
      timeout: 60_000,
      expect: { timeout: 15_000 },
      use: {
        ...devices['Desktop Chrome'],
        baseURL: env.hrm.baseURL,
        storageState: HRM_STORAGE_STATE,
        actionTimeout: 15_000,
        navigationTimeout: 30_000,
      },
    },

    // ── Automation Exercise ──────────────────────────────────────────────────
    {
      name: 'ae-api',
      testMatch: /tests\/automationexercise\/api\/.*\.spec\.ts/,
      use: { baseURL: env.ae.baseURL },
    },
    {
      name: 'ae-ui',
      testMatch: /tests\/automationexercise\/ui\/.*\.spec\.ts/,
      // The public site rate-limits with "heavy load (queue full)" 503 pages;
      // capping concurrency keeps this suite from adding to that load.
      workers: 2,
      timeout: 45_000,
      expect: { timeout: 10_000 },
      use: { ...devices['Desktop Chrome'], baseURL: env.ae.baseURL },
    },
  ],
});
