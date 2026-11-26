import { test as base, expect } from '@playwright/test';
import { HrmClient, type HrmEmployee } from '../api/HrmClient';
import { HrmLoginPage } from '../pages/hrm/HrmLoginPage';
import { DashboardPage } from '../pages/hrm/DashboardPage';
import { PimPage } from '../pages/hrm/PimPage';
import { AdminUsersPage } from '../pages/hrm/AdminUsersPage';
import { LeaveListPage } from '../pages/hrm/LeaveListPage';
import { uid } from '../utils/unique';

type HrmFixtures = {
  hrmLoginPage: HrmLoginPage;
  dashboardPage: DashboardPage;
  pimPage: PimPage;
  adminUsersPage: AdminUsersPage;
  leaveListPage: LeaveListPage;
  /** OrangeHRM internal API, authenticated with the test's browser session. */
  hrmApi: HrmClient;
  /** A brand-new employee created through the API and deleted after the test. */
  seededEmployee: HrmEmployee & { employeeId: string };
  /** Register employees a test creates through the UI so they are deleted afterwards. */
  trackEmployee: (empNumber: number) => void;
};

/**
 * OrangeHRM is a shared public demo, so every test owns its data:
 * unique names/ids per test, and guaranteed cleanup in fixture teardown
 * (which runs even when the test fails).
 */
export const test = base.extend<HrmFixtures>({
  hrmLoginPage: async ({ page }, use) => use(new HrmLoginPage(page)),
  dashboardPage: async ({ page }, use) => use(new DashboardPage(page)),
  pimPage: async ({ page }, use) => use(new PimPage(page)),
  adminUsersPage: async ({ page }, use) => use(new AdminUsersPage(page)),
  leaveListPage: async ({ page }, use) => use(new LeaveListPage(page)),

  hrmApi: async ({ page }, use) => {
    await use(new HrmClient(page.request));
  },

  trackEmployee: async ({ hrmApi }, use) => {
    const created: number[] = [];
    await use((empNumber) => created.push(empNumber));
    await hrmApi.deleteEmployees(created);
  },

  seededEmployee: async ({ hrmApi }, use) => {
    const employeeId = uid(9);
    const employee = await hrmApi.createEmployee({ firstName: 'QA', lastName: `Seed${uid(6)}`, employeeId });
    await use({ ...employee, employeeId });
    await hrmApi.deleteEmployees([employee.empNumber]);
  },
});

export { expect };
