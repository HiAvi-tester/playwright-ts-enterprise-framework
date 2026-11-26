import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { BookingClient } from '../api/BookingClient';
import { env } from '../utils/env';

type PageFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
};

type ApiFixtures = {
  bookingClient: BookingClient;
  authToken: string;
};

/**
 * Tests import `test` from here instead of '@playwright/test'.
 * Page objects arrive pre-built, so specs contain only intent and assertions.
 */
export const test = base.extend<PageFixtures & ApiFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  bookingClient: async ({ request }, use) => {
    await use(new BookingClient(request));
  },
  authToken: async ({ bookingClient }, use) => {
    await use(await bookingClient.createToken(env.api.admin.username, env.api.admin.password));
  },
});

export { expect };
