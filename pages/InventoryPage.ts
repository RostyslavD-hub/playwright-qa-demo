import { type Page, type Locator, expect } from '@playwright/test';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage {
  readonly title: Locator;
  readonly items: Locator;
  readonly names: Locator;
  readonly prices: Locator;
  readonly sort: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.names = page.getByTestId('inventory-item-name');
    this.prices = page.getByTestId('inventory-item-price');
    this.sort = page.getByTestId('product-sort-container');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.cartLink = page.getByTestId('shopping-cart-link');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.title).toHaveText('Products');
  }

  item(name: string): Locator {
    return this.items.filter({ has: this.page.getByTestId('inventory-item-name').getByText(name, { exact: true }) });
  }

  async add(name: string) {
    await this.item(name).getByRole('button', { name: 'Add to cart' }).click();
  }

  async remove(name: string) {
    await this.item(name).getByRole('button', { name: 'Remove' }).click();
  }

  async priceOf(name: string): Promise<number> {
    return toPrice(await this.item(name).getByTestId('inventory-item-price').innerText());
  }

  async allNames(): Promise<string[]> {
    return this.names.allInnerTexts();
  }

  async allPrices(): Promise<number[]> {
    return (await this.prices.allInnerTexts()).map(toPrice);
  }

  async sortBy(option: SortOption) {
    await this.sort.selectOption(option);
  }
}

export function toPrice(text: string): number {
  const m = text.match(/\d+(\.\d+)?/);
  if (!m) throw new Error(`No price in "${text}"`);
  return Number(m[0]);
}
