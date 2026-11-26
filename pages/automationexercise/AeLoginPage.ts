import { type Locator, type Page } from '@playwright/test';
import { AeBasePage } from './AeBasePage';

export class AeLoginPage extends AeBasePage {
  readonly email: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly error: Locator;

  constructor(page: Page) {
    super(page);
    // The site ships stable data-qa hooks (this project's testIdAttribute is data-test).
    this.email = page.locator('[data-qa="login-email"]');
    this.password = page.locator('[data-qa="login-password"]');
    this.loginButton = page.locator('[data-qa="login-button"]');
    this.error = page.locator('.login-form p');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.loginButton.click();
  }
}
