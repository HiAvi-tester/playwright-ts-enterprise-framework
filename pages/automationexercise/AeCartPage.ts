import { type Locator, type Page } from '@playwright/test';
import { AeBasePage } from './AeBasePage';

export class AeCartPage extends AeBasePage {
  readonly rows: Locator;

  constructor(page: Page) {
    super(page);
    this.rows = page.locator('#cart_info_table tbody tr');
  }

  async goto(): Promise<void> {
    await this.page.goto('/view_cart');
  }

  row(productName: string): Locator {
    return this.rows.filter({ has: this.page.getByRole('link', { name: productName, exact: true }) });
  }

  price(productName: string): Locator {
    return this.row(productName).locator('.cart_price p');
  }

  quantity(productName: string): Locator {
    return this.row(productName).locator('.cart_quantity button');
  }

  total(productName: string): Locator {
    return this.row(productName).locator('.cart_total_price');
  }
}
