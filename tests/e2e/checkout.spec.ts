import { test, expect } from '../../fixtures/base.fixture';
import users from '../../test-data/users.json';

const PRODUCTS = ['Sauce Labs Backpack', 'Sauce Labs Fleece Jacket'];

test.describe('Checkout', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
    for (const product of PRODUCTS) await inventoryPage.addToCart(product);
    await inventoryPage.openCart();
  });

  test('completes a purchase end to end @smoke', async ({ page, cartPage, checkoutPage }) => {
    expect(await cartPage.names()).toEqual(PRODUCTS);
    await cartPage.checkout();

    await checkoutPage.fillCustomerInfo(users.checkoutCustomer);
    await checkoutPage.finish();

    await expect(page).toHaveURL(/checkout-complete\.html/);
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    await expect(checkoutPage.cartBadge).toBeHidden();
  });

  test('order total equals item subtotal plus tax', async ({ cartPage, checkoutPage }) => {
    await cartPage.checkout();
    await checkoutPage.fillCustomerInfo(users.checkoutCustomer);

    const { subtotal, tax, total } = await checkoutPage.totals();
    expect(subtotal).toBeGreaterThan(0);
    // Compare in cents to avoid floating-point rounding noise.
    expect(Math.round((subtotal + tax) * 100)).toBe(Math.round(total * 100));
  });

  test('missing postal code blocks checkout', async ({ page, cartPage, checkoutPage }) => {
    await cartPage.checkout();
    const { firstName, lastName } = users.checkoutCustomer;
    await checkoutPage.fillCustomerInfo({ firstName, lastName });

    await expect(checkoutPage.error).toContainText('Postal Code is required');
    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });
});
