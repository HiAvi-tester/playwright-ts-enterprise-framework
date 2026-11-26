import { test as setup, expect } from '../../fixtures/base.fixture';
import { env, STORAGE_STATE } from '../../utils/env';

/**
 * Runs once before the browser projects. Logs in through the UI and saves
 * cookies + localStorage, which every UI test then reuses via storageState.
 */
setup('authenticate as standard user', async ({ page, loginPage }) => {
  await loginPage.goto();
  await loginPage.login(env.web.user.username, env.web.user.password);
  await expect(page).toHaveURL(/inventory\.html/);
  await page.context().storageState({ path: STORAGE_STATE });
});
