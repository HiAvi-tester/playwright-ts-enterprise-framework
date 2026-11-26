import { type Locator, type Page } from '@playwright/test';
import { HrmBasePage } from './HrmBasePage';

export class LeaveListPage extends HrmBasePage {
  readonly filterTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.filterTitle = page.locator('.oxd-table-filter-title');
  }

  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/leave/viewLeaveList');
  }
}
