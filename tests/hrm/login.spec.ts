import { test, expect } from '../../fixtures/hrm.fixture';
import { env } from '../../utils/env';

// Login tests start logged out.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('OrangeHRM login', () => {
  test.beforeEach(async ({ hrmLoginPage }) => {
    await hrmLoginPage.goto();
    await expect(hrmLoginPage.title).toBeVisible();
  });

  test('admin can log in and reaches the dashboard @smoke', async ({ page, hrmLoginPage, dashboardPage }) => {
    await hrmLoginPage.login(env.hrm.admin.username, env.hrm.admin.password);

    await expect(page).toHaveURL(/\/dashboard\/index/);
    await expect(dashboardPage.breadcrumb).toHaveText('Dashboard');
  });

  test('invalid credentials show an error and stay on login', async ({ page, hrmLoginPage }) => {
    await hrmLoginPage.login(env.hrm.admin.username, `wrong-${Date.now()}`);

    await expect(hrmLoginPage.alert).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('empty username and password are both required', async ({ page, hrmLoginPage }) => {
    await hrmLoginPage.loginButton.click();

    await expect(hrmLoginPage.fieldError('Username')).toHaveText('Required');
    await expect(hrmLoginPage.fieldError('Password')).toHaveText('Required');
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
