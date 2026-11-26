import { test, expect } from '../../fixtures/base.fixture';
import users from '../../test-data/users.json';

// Login tests must start logged out, so they opt out of the shared auth state.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('standard user lands on the inventory page @smoke', async ({ page, loginPage, inventoryPage }) => {
    await loginPage.login(users.standard.username, users.standard.password);

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.title).toHaveText('Products');
  });

  test('locked-out user sees a clear error', async ({ loginPage }) => {
    await loginPage.login(users.lockedOut.username, users.lockedOut.password);

    await expect(loginPage.error).toContainText('Sorry, this user has been locked out');
  });

  test('wrong password is rejected', async ({ page, loginPage }) => {
    await loginPage.login(users.invalidPassword.username, users.invalidPassword.password);

    await expect(loginPage.error).toContainText('Username and password do not match');
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  test('empty username triggers required-field validation', async ({ loginPage }) => {
    await loginPage.login('', users.standard.password);

    await expect(loginPage.error).toContainText('Username is required');
  });

  test('protected page redirects anonymous users to login', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');

    await expect(loginPage.error).toContainText("You can only access '/inventory.html' when you are logged in");
  });
});
