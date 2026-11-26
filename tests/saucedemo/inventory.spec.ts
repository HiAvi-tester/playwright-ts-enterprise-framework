import { test, expect } from '../../fixtures/base.fixture';

const BACKPACK = 'Sauce Labs Backpack';
const BIKE_LIGHT = 'Sauce Labs Bike Light';

test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto(); // already authenticated via storageState
  });

  test('sorts products by price, low to high @smoke', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');

    const prices = await inventoryPage.prices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('sorts products by name, Z to A', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('za');

    const names = await inventoryPage.names();
    expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));
  });

  test('cart badge tracks add and remove', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(BACKPACK);
    await inventoryPage.addToCart(BIKE_LIGHT);
    await expect(inventoryPage.cartBadge).toHaveText('2');

    await inventoryPage.removeFromCart(BACKPACK);
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('cart contents persist across a page reload', async ({ page, inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(BACKPACK);
    await page.reload();

    await expect(inventoryPage.cartBadge).toHaveText('1');
    await inventoryPage.openCart();
    expect(await cartPage.names()).toEqual([BACKPACK]);
  });
});
