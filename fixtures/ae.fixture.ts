import { test as base, expect, type BrowserContext } from '@playwright/test';
import { AutomationExerciseClient, buildAeAccount, type AeAccount, type ApiResult } from '../api/AutomationExerciseClient';
import { AeLoginPage } from '../pages/automationexercise/AeLoginPage';
import { AeProductsPage } from '../pages/automationexercise/AeProductsPage';
import { AeCartPage } from '../pages/automationexercise/AeCartPage';
import { env } from '../utils/env';

/**
 * Third-party ad/consent hosts the site loads. Their overlays can cover buttons and
 * they slow every page, so UI tests block them at the network layer.
 */
export const AD_HOSTS =
  /googlesyndication|doubleclick|googleadservices|adservice|fundingchoices|googletagmanager|google-analytics/;

type AeFixtures = {
  aeApi: AutomationExerciseClient;
  /**
   * A fresh account created through the API before the test and deleted after it
   * (teardown runs even if the test fails). `created` is the raw createAccount result.
   */
  aeAccount: { account: AeAccount; created: ApiResult<{ responseCode: number; message?: string }> };
  aeLoginPage: AeLoginPage;
  aeProductsPage: AeProductsPage;
  aeCartPage: AeCartPage;
  /**
   * Prepares any browser context for this site: blocks ad hosts and watches for the
   * site's 503 "heavy load (queue full)" responses. Applied to the default `page`
   * automatically; call it yourself for extra contexts a test creates.
   */
  prepareAeContext: (context: BrowserContext) => Promise<void>;
};

export const test = base.extend<AeFixtures>({
  prepareAeContext: async ({}, use, testInfo) => {
    const overloaded: string[] = [];
    await use(async (context) => {
      await context.route(AD_HOSTS, (route) => route.abort());
      context.on('response', (response) => {
        if (response.status() === 503 && response.url().startsWith(env.ae.baseURL)) overloaded.push(response.url());
      });
    });

    // Label failures the public site caused, so they are not mistaken for test defects.
    if (overloaded.length > 0 && testInfo.status !== testInfo.expectedStatus) {
      const description =
        `Automation Exercise returned HTTP 503 "heavy load (queue full)" for ${overloaded.length} request(s), ` +
        `first: ${overloaded[0]}. The public demo site was overloaded; this is not a test defect.`;
      testInfo.annotations.push({ type: 'site-issue', description });
      console.warn(`[site-issue] ${testInfo.title}: ${description}`);
    }
  },

  // Only UI tests ask for `page`, so API-only tests never launch a browser.
  page: async ({ page, prepareAeContext }, use) => {
    await prepareAeContext(page.context());
    await use(page);
  },

  aeApi: async ({ request }, use) => {
    await use(new AutomationExerciseClient(request));
  },

  aeAccount: async ({ aeApi }, use) => {
    const account = buildAeAccount();
    const created = await aeApi.createAccount(account);
    if (created.responseCode !== 201) {
      throw new Error(`Could not seed account ${account.email}: ${created.responseCode} ${created.message}`);
    }
    await use({ account, created });
    // Idempotent cleanup: a test may already have deleted the account (responseCode 404).
    const deleted = await aeApi.deleteAccount(account.email, account.password);
    if (![200, 404].includes(deleted.responseCode)) {
      throw new Error(`Cleanup failed for ${account.email}: ${deleted.responseCode} ${deleted.message}`);
    }
  },

  aeLoginPage: async ({ page }, use) => use(new AeLoginPage(page)),
  aeProductsPage: async ({ page }, use) => use(new AeProductsPage(page)),
  aeCartPage: async ({ page }, use) => use(new AeCartPage(page)),
});

export { expect };
