import { test, expect } from '../../fixtures';
import type { SortOption } from '../../pages/InventoryPage';

test.describe('Product list', () => {
  const byName = (a: string, b: string) => a.localeCompare(b);

  const sorts: { option: SortOption; check: (names: string[], prices: number[]) => void }[] = [
    { option: 'az', check: (n) => expect(n).toEqual([...n].sort(byName)) },
    { option: 'za', check: (n) => expect(n).toEqual([...n].sort(byName).reverse()) },
    { option: 'lohi', check: (_, p) => expect(p).toEqual([...p].sort((a, b) => a - b)) },
    { option: 'hilo', check: (_, p) => expect(p).toEqual([...p].sort((a, b) => b - a)) },
  ];

  for (const { option, check } of sorts) {
    test(`sorting "${option}" orders the whole list @regression`, async ({ loggedIn }) => {
      await loggedIn.sortBy(option);
      check(await loggedIn.allNames(), await loggedIn.allPrices());
    });
  }

  test('sorting does not change the set of products @regression', async ({ loggedIn }) => {
    const before = (await loggedIn.allNames()).sort();
    await loggedIn.sortBy('hilo');
    expect((await loggedIn.allNames()).sort()).toEqual(before);
  });

  // State transitions of the cart badge: 0 -> 1 -> 2 -> 1 -> 0.
  test('cart badge follows add / remove @smoke', async ({ loggedIn }) => {
    await expect(loggedIn.cartBadge).toHaveCount(0);
    await loggedIn.add('Sauce Labs Backpack');
    await expect(loggedIn.cartBadge).toHaveText('1');
    await loggedIn.add('Sauce Labs Bike Light');
    await expect(loggedIn.cartBadge).toHaveText('2');
    await loggedIn.remove('Sauce Labs Backpack');
    await expect(loggedIn.cartBadge).toHaveText('1');
    await loggedIn.remove('Sauce Labs Bike Light');
    await expect(loggedIn.cartBadge).toHaveCount(0);
  });

  test('cart survives a page reload @regression', async ({ page, loggedIn }) => {
    await loggedIn.add('Sauce Labs Onesie');
    await page.reload();
    await expect(loggedIn.cartBadge).toHaveText('1');
    await expect(loggedIn.item('Sauce Labs Onesie').getByRole('button', { name: 'Remove' })).toBeVisible();
  });
});
