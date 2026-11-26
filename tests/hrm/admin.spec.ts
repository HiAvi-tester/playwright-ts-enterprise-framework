import { test, expect } from '../../fixtures/hrm.fixture';
import { env } from '../../utils/env';

test.describe('OrangeHRM Admin > User Management', () => {
  test('search for a system user by username', async ({ adminUsersPage }) => {
    // The admin account we log in with is the one user guaranteed to exist.
    const username = env.hrm.admin.username;

    await adminUsersPage.gotoList();
    await adminUsersPage.searchByUsername(username);

    await expect(adminUsersPage.recordsFound).toHaveText(/^\(\d+\) Records? Found$/);
    await expect(adminUsersPage.usernameCells.first()).toBeVisible();
    for (const cell of await adminUsersPage.usernameCells.all()) {
      await expect(cell).toHaveText(username, { ignoreCase: true });
    }
  });

  test('add user form validates required fields', async ({ page, adminUsersPage }) => {
    await adminUsersPage.gotoAddUser();
    await adminUsersPage.saveButton.click();

    for (const label of ['User Role', 'Employee Name', 'Status', 'Username', 'Password']) {
      await expect(adminUsersPage.fieldError(label), `${label} should be required`).toHaveText('Required');
    }

    await test.step('username shorter than 5 characters is rejected', async () => {
      await adminUsersPage.field('Username').fill('abc');
      await expect(adminUsersPage.fieldError('Username')).toHaveText('Should be at least 5 characters');
    });

    await expect(page).toHaveURL(/\/admin\/saveSystemUser/);
  });
});
