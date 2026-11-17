import { test, expect } from '../../fixtures';
import { USERS, PASSWORD } from '../../data/users';

// Known bugs are kept as tests marked with test.fail(): the suite stays green while the bug exists,
// and turns red ("expected to fail, but passed") the day it is fixed, which is the signal to retest
// and remove the mark. Same idea as baseline vs pending checks in a regression set.
test.describe('Known issues (problem_user)', () => {
  test.beforeEach(async ({ loginPage, inventory }) => {
    await loginPage.open();
    await loginPage.login(USERS.problem, PASSWORD);
    await inventory.expectLoaded();
  });

  test('every product shows its own image @regression', async ({ inventory }) => {
    test.fail(true, 'Known bug: problem_user sees the same image for every product');
    const sources = await inventory.items.locator('img').evaluateAll((imgs) =>
      imgs.map((i) => (i as HTMLImageElement).getAttribute('src')),
    );
    expect(new Set(sources).size).toBe(sources.length);
  });

  test('sorting by price works @regression', async ({ inventory }) => {
    test.fail(true, 'Known bug: sorting does not change the order for problem_user');
    await inventory.sortBy('lohi');
    const prices = await inventory.allPrices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });
});
