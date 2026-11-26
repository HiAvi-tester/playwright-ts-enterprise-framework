import { type Locator, type Page } from '@playwright/test';

/**
 * Shared OrangeHRM (OXD design system) helpers.
 *
 * Many OrangeHRM inputs have no name/id/test attribute, so fields are located the
 * way a user finds them: by the visible <label> inside the same `.oxd-input-group`.
 */
export abstract class HrmBasePage {
  readonly breadcrumb: Locator;
  readonly toast: Locator;

  protected constructor(protected readonly page: Page) {
    this.breadcrumb = page.locator('.oxd-topbar-header-breadcrumb-module');
    this.toast = page.locator('.oxd-toast');
  }

  /** The `.oxd-input-group` wrapper whose label text is exactly `label`. */
  protected group(label: string): Locator {
    const exact = new RegExp(`^\\s*${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`);
    return this.page.locator('.oxd-input-group').filter({ has: this.page.locator('label', { hasText: exact }) });
  }

  /** Text input belonging to the field labelled `label`. */
  field(label: string): Locator {
    return this.group(label).locator('input');
  }

  /** Inline validation message under the field labelled `label` (e.g. "Required"). */
  fieldError(label: string): Locator {
    return this.group(label).locator('.oxd-input-field-error-message');
  }

  /** Success/error toast containing `text`, e.g. "Successfully Saved". */
  toastWith(text: string): Locator {
    return this.toast.filter({ hasText: text });
  }
}
