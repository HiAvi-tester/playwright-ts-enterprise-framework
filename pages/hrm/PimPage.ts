import { type Locator, type Page } from '@playwright/test';
import { HrmBasePage } from './HrmBasePage';

/** PIM: employee list/search, Add Employee form, and the Personal Details form. */
export class PimPage extends HrmBasePage {
  // Employee list
  readonly searchButton: Locator;
  readonly recordsFound: Locator;
  readonly rows: Locator;
  readonly confirmDeleteButton: Locator;
  // Add employee / personal details (same input placeholders on both screens)
  readonly firstName: Locator;
  readonly middleName: Locator;
  readonly lastName: Locator;
  readonly saveButton: Locator;
  readonly employeeNameHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.recordsFound = page.locator('.orangehrm-horizontal-padding .oxd-text--span');
    this.rows = page.locator('.oxd-table-card');
    this.confirmDeleteButton = page.getByRole('button', { name: 'Yes, Delete' });

    this.firstName = page.getByPlaceholder('First Name');
    this.middleName = page.getByPlaceholder('Middle Name');
    this.lastName = page.getByPlaceholder('Last Name');
    // Personal Details has a second form (custom fields) with its own Save button.
    this.saveButton = page.locator('form').filter({ has: this.firstName }).getByRole('button', { name: 'Save' });
    this.employeeNameHeader = page.locator('.orangehrm-edit-employee-name h6');
  }

  async gotoList(): Promise<void> {
    await this.page.goto('/web/index.php/pim/viewEmployeeList');
  }

  async gotoAdd(): Promise<void> {
    await this.page.goto('/web/index.php/pim/addEmployee');
  }

  async gotoPersonalDetails(empNumber: number): Promise<void> {
    await this.page.goto(`/web/index.php/pim/viewPersonalDetails/empNumber/${empNumber}`);
  }

  /** Search by Employee Id: exact and deterministic, unlike the name autocomplete. */
  async searchByEmployeeId(employeeId: string): Promise<void> {
    await this.field('Employee Id').fill(employeeId);
    await this.searchButton.click();
  }

  row(text: string): Locator {
    return this.rows.filter({ hasText: text });
  }

  async deleteRow(text: string): Promise<void> {
    await this.row(text).locator('button').filter({ has: this.page.locator('i.bi-trash') }).click();
    await this.confirmDeleteButton.click();
  }

  /**
   * Fills the Add Employee form and saves. Returns the new empNumber, read from the
   * create-employee API response so the caller can register cleanup immediately.
   *
   * Does not wait for the redirect: OrangeHRM shows the "Successfully Saved" toast on
   * this page and then does a full page load to Personal Details, which removes it.
   * Callers assert the toast first, then the URL.
   */
  async addEmployee(firstName: string, lastName: string, employeeId: string): Promise<number> {
    await this.firstName.fill(firstName);
    await this.lastName.fill(lastName);
    await this.field('Employee Id').fill(employeeId); // replaces the auto-generated id

    const created = this.page.waitForResponse(
      (r) => r.request().method() === 'POST' && /\/api\/v2\/pim\/employees$/.test(new URL(r.url()).pathname),
    );
    await this.saveButton.click();
    const response = await created;
    if (!response.ok()) throw new Error(`Create employee request failed: HTTP ${response.status()}`);
    const body = (await response.json()) as { data: { empNumber: number } };
    return body.data.empNumber;
  }
}
