import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage extends BasePage {
  readonly sortDropdown: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;

  constructor(page: Page) {
    super(page);
    this.sortDropdown = page.getByTestId('product-sort-container');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
  }

  async goto(): Promise<void> {
    await this.page.goto('/inventory.html');
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async names(): Promise<string[]> {
    return this.itemNames.allInnerTexts();
  }

  /** Prices as numbers, e.g. "$29.99" -> 29.99 */
  async prices(): Promise<number[]> {
    const raw = await this.itemPrices.allInnerTexts();
    return raw.map((p) => BasePage.parsePrice(p));
  }

  /** Converts a product name to SauceDemo's data-test slug, e.g. "Sauce Labs Backpack" -> "sauce-labs-backpack". */
  private slug(productName: string): string {
    return productName.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-|-$/g, '');
  }

  async addToCart(productName: string): Promise<void> {
    await this.page.getByTestId(`add-to-cart-${this.slug(productName)}`).click();
  }

  async removeFromCart(productName: string): Promise<void> {
    await this.page.getByTestId(`remove-${this.slug(productName)}`).click();
  }
}
