import { type Locator, type Page } from '@playwright/test';
import { HrmBasePage } from './HrmBasePage';

/** Admin > User Management: system user search and the Add User form. */
export class AdminUsersPage extends HrmBasePage {
  readonly searchButton: Locator;
  readonly saveButton: Locator;
  readonly recordsFound: Locator;
  readonly rows: Locator;
  readonly usernameCells: Locator;

  constructor(page: Page) {
    super(page);
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.recordsFound = page.locator('.orangehrm-horizontal-padding .oxd-text--span');
    this.rows = page.locator('.oxd-table-card');
    // Columns: [checkbox] Username | User Role | Employee Name | Status | Actions
    this.usernameCells = this.rows.locator('.oxd-table-cell:nth-child(2)');
  }

  async gotoList(): Promise<void> {
    await this.page.goto('/web/index.php/admin/viewSystemUsers');
  }

  async gotoAddUser(): Promise<void> {
    await this.page.goto('/web/index.php/admin/saveSystemUser');
  }

  async searchByUsername(username: string): Promise<void> {
    await this.field('Username').fill(username);
    await this.searchButton.click();
  }
}
