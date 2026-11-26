import { test, expect } from '../../../fixtures/ae.fixture';

/** Hybrid: the account is created through the API, the login is exercised in the UI. */
test.describe('Automation Exercise UI: login', () => {
  test.beforeEach(async ({ aeLoginPage }) => {
    await aeLoginPage.goto();
  });

  test('API-seeded user can log in through the UI @smoke', async ({ aeLoginPage, aeAccount }) => {
    const { account } = aeAccount;
    await aeLoginPage.login(account.email, account.password);

    await expect(aeLoginPage.loggedInAs).toHaveText(`Logged in as ${account.name}`);
    await expect(aeLoginPage.logoutLink).toBeVisible();
  });

  test('wrong password shows an error and does not log in', async ({ page, aeLoginPage, aeAccount }) => {
    await aeLoginPage.login(aeAccount.account.email, 'wrong-password');

    await expect(aeLoginPage.error).toHaveText('Your email or password is incorrect!');
    await expect(aeLoginPage.loggedInAs).toBeHidden();
    await expect(page).toHaveURL(/\/login$/);
  });
});
