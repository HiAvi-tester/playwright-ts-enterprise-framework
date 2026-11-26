import { type Locator, type Page } from '@playwright/test';
import { AeBasePage } from './AeBasePage';

export class AeProductsPage extends AeBasePage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly listTitle: Locator;
  readonly productCards: Locator;
  // "Added!" modal shown after Add to cart
  readonly cartModal: Locator;
  readonly continueShopping: Locator;
  readonly viewCartLink: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.locator('#search_product');
    this.searchButton = page.locator('#submit_search');
    this.listTitle = page.locator('.features_items h2.title');
    // .productinfo is the visible card; the hover overlay duplicates its button.
    this.productCards = page.locator('.features_items .productinfo');
    this.cartModal = page.locator('#cartModal');
    this.continueShopping = this.cartModal.getByRole('button', { name: 'Continue Shopping' });
    this.viewCartLink = this.cartModal.getByRole('link', { name: 'View Cart' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/products');
  }

  /**
   * Search navigates to /products?search=... via JavaScript. The site binds its
   * jQuery "Add to cart" handlers at the end of page load, so wait for the `load`
   * event of the results page; otherwise an early click can be silently ignored.
   */
  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
    await this.page.waitForURL((url) => url.searchParams.get('search') === term, { waitUntil: 'load' });
  }

  card(productName: string): Locator {
    return this.productCards.filter({ has: this.page.getByText(productName, { exact: true }) });
  }

  async addToCart(productName: string): Promise<void> {
    await this.card(productName).locator('a.add-to-cart').click();
  }
}
