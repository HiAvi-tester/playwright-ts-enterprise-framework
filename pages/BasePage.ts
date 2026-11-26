import type { Locator, Page } from '@playwright/test';

/**
 * Shared header/navigation behaviour present on every authenticated SauceDemo screen.
 */
export abstract class BasePage {
  readonly title: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;

  protected constructor(protected readonly page: Page) {
    this.title = page.getByTestId('title');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
    this.logoutLink = page.getByTestId('logout-sidebar-link');
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  /** Number shown on the cart badge; 0 when the badge is hidden. */
  async cartCount(): Promise<number> {
    if (!(await this.cartBadge.isVisible())) return 0;
    return Number(await this.cartBadge.innerText());
  }

  async logout(): Promise<void> {
    await this.menuButton.click();
    await this.logoutLink.click();
  }

  /** Converts "$29.99" / "Item total: $29.99" into 29.99. */
  protected static parsePrice(text: string): number {
    const match = text.match(/\$(\d+(?:\.\d{1,2})?)/);
    if (!match) throw new Error(`No price found in "${text}"`);
    return Number(match[1]);
  }
}
