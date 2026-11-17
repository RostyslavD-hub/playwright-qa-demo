import { type Page, type Locator, expect } from '@playwright/test';
import { toPrice } from './InventoryPage';

export class CartPage {
  readonly list: Locator;
  readonly items: Locator;
  readonly checkout: Locator;

  constructor(private readonly page: Page) {
    this.list = page.getByTestId('cart-list');
    this.items = this.list.getByTestId('inventory-item');
    this.checkout = page.getByTestId('checkout');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/cart\.html/);
    await expect(this.list).toBeVisible();
  }

  async lines(): Promise<{ name: string; price: number }[]> {
    const names = await this.items.getByTestId('inventory-item-name').allInnerTexts();
    const prices = (await this.items.getByTestId('inventory-item-price').allInnerTexts()).map(toPrice);
    return names.map((name, i) => ({ name, price: prices[i] }));
  }
}

export class CheckoutInfoPage {
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continue: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    this.firstName = page.getByTestId('firstName');
    this.lastName = page.getByTestId('lastName');
    this.postalCode = page.getByTestId('postalCode');
    this.continue = page.getByTestId('continue');
    this.error = page.getByTestId('error');
  }

  async fill(data: { firstName: string; lastName: string; postalCode: string }) {
    await this.firstName.fill(data.firstName);
    await this.lastName.fill(data.lastName);
    await this.postalCode.fill(data.postalCode);
    await this.continue.click();
  }
}

export class CheckoutOverviewPage {
  readonly itemPrices: Locator;
  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly finish: Locator;
  readonly completeHeader: Locator;

  constructor(private readonly page: Page) {
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.subtotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
    this.finish = page.getByTestId('finish');
    this.completeHeader = page.getByTestId('complete-header');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/checkout-step-two/);
    await expect(this.total).toBeVisible();
  }

  async amounts() {
    await this.expectLoaded();
    return {
      items: (await this.itemPrices.allInnerTexts()).map(toPrice),
      subtotal: toPrice(await this.subtotal.innerText()),
      tax: toPrice(await this.tax.innerText()),
      total: toPrice(await this.total.innerText()),
    };
  }
}
