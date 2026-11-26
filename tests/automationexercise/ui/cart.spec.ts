import { test, expect } from '../../../fixtures/ae.fixture';
import { AeLoginPage } from '../../../pages/automationexercise/AeLoginPage';
import { AeCartPage } from '../../../pages/automationexercise/AeCartPage';

const PRODUCT = 'Blue Top';

/**
 * Hybrid flow: user seeded through the API, shopping done in the UI, expected
 * price taken from the products API, user deleted through the API afterwards.
 * Each test has its own user, so carts never interfere across parallel workers.
 */
test.describe('Automation Exercise UI: cart', () => {
  test.beforeEach(async ({ aeLoginPage, aeAccount }) => {
    await aeLoginPage.goto();
    await aeLoginPage.login(aeAccount.account.email, aeAccount.account.password);
    await expect(aeLoginPage.loggedInAs).toBeVisible();
  });

  test('search, add to cart, and verify cart contents @smoke', async ({ aeApi, aeProductsPage, aeCartPage }) => {
    const catalogue = await aeApi.getProducts();
    const expected = catalogue.body.products?.find((p) => p.name === PRODUCT);
    expect(expected, `${PRODUCT} should be in the catalogue`).toBeDefined();

    await aeProductsPage.goto();
    await aeProductsPage.search(PRODUCT);
    await expect(aeProductsPage.listTitle).toHaveText('Searched Products');
    await aeProductsPage.addToCart(PRODUCT);

    await expect(aeProductsPage.cartModal.getByRole('heading', { name: 'Added!' })).toBeVisible();
    await aeProductsPage.viewCartLink.click();

    await expect(aeCartPage.rows).toHaveCount(1);
    await expect(aeCartPage.price(PRODUCT)).toHaveText(expected!.price);
    await expect(aeCartPage.quantity(PRODUCT)).toHaveText('1');
    await expect(aeCartPage.total(PRODUCT)).toHaveText(expected!.price);
  });

  test('cart is stored server-side and survives a new browser session', async ({
    browser,
    aeProductsPage,
    aeAccount,
    prepareAeContext,
  }) => {
    await aeProductsPage.goto();
    await aeProductsPage.addToCart(PRODUCT);
    await expect(aeProductsPage.cartModal).toBeVisible();

    // A completely separate browser context: no shared cookies or storage.
    const context = await browser.newContext();
    try {
      await prepareAeContext(context);
      const page = await context.newPage();
      const login = new AeLoginPage(page);
      const cart = new AeCartPage(page);

      await login.goto();
      await login.login(aeAccount.account.email, aeAccount.account.password);
      await expect(login.loggedInAs).toBeVisible();
      await cart.goto();

      await expect(cart.rows).toHaveCount(1);
      await expect(cart.row(PRODUCT)).toBeVisible();
    } finally {
      await context.close();
    }
  });
});
