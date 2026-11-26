import { type Locator, type Page } from '@playwright/test';

/** Header navigation shared by every Automation Exercise page. */
export abstract class AeBasePage {
  readonly loggedInAs: Locator;
  readonly logoutLink: Locator;
  readonly loginLink: Locator;
  readonly cartLink: Locator;

  protected constructor(protected readonly page: Page) {
    const menu = page.locator('.shop-menu');
    this.loggedInAs = menu.getByText(/Logged in as/);
    this.logoutLink = menu.getByRole('link', { name: 'Logout' });
    this.loginLink = menu.getByRole('link', { name: /Signup \/ Login/ });
    this.cartLink = menu.getByRole('link', { name: 'Cart' });
  }
}
