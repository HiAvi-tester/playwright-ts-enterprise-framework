import { test as setup, expect } from '../../fixtures/hrm.fixture';
import { env, HRM_STORAGE_STATE } from '../../utils/env';

/** Logs in to OrangeHRM once and saves the session for the hrm-chromium project. */
setup('authenticate as OrangeHRM admin', async ({ page, hrmLoginPage, dashboardPage }) => {
  await hrmLoginPage.goto();
  await hrmLoginPage.login(env.hrm.admin.username, env.hrm.admin.password);

  await expect(page).toHaveURL(/\/dashboard\/index/);
  await expect(dashboardPage.breadcrumb).toHaveText('Dashboard');
  await page.context().storageState({ path: HRM_STORAGE_STATE });
});
