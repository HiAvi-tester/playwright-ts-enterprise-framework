import { test, expect } from '../../fixtures/hrm.fixture';

/** Read-only checks: they assert structure, never data other users can change. */
test.describe('OrangeHRM Dashboard and Leave', () => {
  test('dashboard shows the core widgets and main menu @smoke', async ({ dashboardPage }) => {
    await dashboardPage.goto();

    await expect(dashboardPage.breadcrumb).toHaveText('Dashboard');
    for (const widget of ['Time at Work', 'My Actions', 'Quick Launch']) {
      await expect(dashboardPage.widgetTitles.filter({ hasText: widget })).toBeVisible();
    }
    for (const item of ['Admin', 'PIM', 'Leave', 'Dashboard']) {
      await expect(dashboardPage.mainMenu.filter({ hasText: new RegExp(`^${item}$`) })).toBeVisible();
    }
  });

  test('leave list page opens with its filter form', async ({ leaveListPage }) => {
    await leaveListPage.goto();

    await expect(leaveListPage.breadcrumb).toHaveText('Leave');
    await expect(leaveListPage.filterTitle).toHaveText('Leave List');
    await expect(leaveListPage.field('From Date')).toBeVisible();
    await expect(leaveListPage.field('To Date')).toBeVisible();
  });
});
