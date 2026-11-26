import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly itemNames: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.itemNames = page.getByTestId('inventory-item-name');
    this.checkoutButton = page.getByTestId('checkout');
  }

  async goto(): Promise<void> {
    await this.page.goto('/cart.html');
  }

  /** A single cart row, found by product name. */
  item(productName: string): Locator {
    return this.page.getByTestId('inventory-item').filter({ hasText: productName });
  }

  itemQuantity(productName: string): Locator {
    return this.item(productName).getByTestId('item-quantity');
  }

  async names(): Promise<string[]> {
    return this.itemNames.allInnerTexts();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
