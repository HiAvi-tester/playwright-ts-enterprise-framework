import { test, expect } from '../../../fixtures/ae.fixture';
import { validateProductsResponse } from '../../../schemas/automationexercise.schema';
import { schemaErrors } from '../../../schemas/booking.schema';

/** Read-only catalogue endpoints: no data is created, so no cleanup is needed. */
test.describe('Automation Exercise API: products', () => {
  test('productsList matches the contract @smoke', async ({ aeApi }) => {
    const result = await aeApi.getProducts();

    expect(result.responseCode).toBe(200);
    expect(validateProductsResponse(result.body), schemaErrors(validateProductsResponse)).toBe(true);
    const products = result.body.products ?? [];
    expect(products.length).toBeGreaterThan(0);
    expect(new Set(products.map((p) => p.id)).size, 'product ids must be unique').toBe(products.length);
  });

  test('searchProduct returns only matching products', async ({ aeApi }) => {
    const term = 'top';
    const result = await aeApi.searchProduct(term);

    expect(result.responseCode).toBe(200);
    expect(validateProductsResponse(result.body), schemaErrors(validateProductsResponse)).toBe(true);
    const products = result.body.products ?? [];
    expect(products.length).toBeGreaterThan(0);
    for (const p of products) {
      const haystack = `${p.name} ${p.category.category}`.toLowerCase();
      expect(haystack, `product ${p.id} "${p.name}" should match "${term}"`).toContain(term);
    }
  });

  test('searchProduct without the search_product parameter is a 400', async ({ aeApi }) => {
    const result = await aeApi.searchProduct(undefined);

    expect(result).toMatchObject({
      httpStatus: 200,
      responseCode: 400,
      message: 'Bad request, search_product parameter is missing in POST request.',
    });
  });

  test('productsList rejects POST with 405', async ({ aeApi }) => {
    const result = await aeApi.call('POST', '/api/productsList');

    expect(result).toMatchObject({ responseCode: 405, message: 'This request method is not supported.' });
  });
});
