import { type Locator, type Page } from '@playwright/test';
import { HrmBasePage } from './HrmBasePage';

export class DashboardPage extends HrmBasePage {
  readonly widgetTitles: Locator;
  readonly mainMenu: Locator;
  readonly userDropdownName: Locator;

  constructor(page: Page) {
    super(page);
    this.widgetTitles = page.locator('.orangehrm-dashboard-widget-name');
    this.mainMenu = page.locator('.oxd-main-menu-item');
    this.userDropdownName = page.locator('.oxd-userdropdown-name');
  }

  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/dashboard/index');
  }
}
