import { test, expect } from '../../fixtures/base.fixture';

test.describe('Cart', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('adding a product shows quantity 1 in the cart @smoke', async ({ inventoryPage, cartPage }) => {
    const product = 'Sauce Labs Backpack';
    await inventoryPage.addToCart(product);
    await inventoryPage.openCart();

    await expect(cartPage.item(product)).toBeVisible();
    await expect(cartPage.itemQuantity(product)).toHaveText('1');
  });
});
