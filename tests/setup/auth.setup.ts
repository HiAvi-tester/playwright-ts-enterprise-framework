import { test as setup, expect } from '../../fixtures/base.fixture';
import { STORAGE_STATE_PATH } from '../../utils/env';
import users from '../../test-data/users.json';

/**
 * Runs once before the browser projects. Logs in through the UI and saves
 * cookies + localStorage, which every UI test then reuses via storageState.
 */
setup('authenticate as standard user', async ({ page, loginPage }) => {
  await loginPage.goto();
  await loginPage.login(users.standard.username, users.standard.password);
  await expect(page).toHaveURL(/inventory\.html/);
  await page.context().storageState({ path: STORAGE_STATE_PATH });
});
