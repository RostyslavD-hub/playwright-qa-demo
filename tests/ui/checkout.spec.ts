import { test, expect } from '../../fixtures';
import { CUSTOMER } from '../../data/users';

const PRODUCTS = ['Sauce Labs Backpack', 'Sauce Labs Fleece Jacket', 'Sauce Labs Onesie'];
const TAX_RATE = 0.08;
const round2 = (n: number) => Math.round(n * 100) / 100;

test.describe('Checkout', () => {
  test('full purchase flow completes @smoke', async ({ loggedIn, cart, checkoutInfo, overview }) => {
    await loggedIn.add(PRODUCTS[0]);
    await loggedIn.cartLink.click();
    await cart.expectLoaded();
    await cart.checkout.click();
    await checkoutInfo.fill(CUSTOMER);
    await overview.finish.click();
    await expect(overview.completeHeader).toHaveText('Thank you for your order!');
  });

  // Data consistency: the same price must match on every screen, and totals must add up.
  test('prices and totals are consistent across list, cart and overview @regression', async ({
    loggedIn, cart, checkoutInfo, overview,
  }) => {
    const listPrices: Record<string, number> = {};
    for (const name of PRODUCTS) {
      listPrices[name] = await loggedIn.priceOf(name);
      await loggedIn.add(name);
    }

    await loggedIn.cartLink.click();
    await cart.expectLoaded();
    const lines = await cart.lines();
    expect(lines.map((l) => l.name).sort()).toEqual([...PRODUCTS].sort());
    for (const line of lines) expect(line.price, `cart price of ${line.name}`).toBe(listPrices[line.name]);

    await cart.checkout.click();
    await checkoutInfo.fill(CUSTOMER);
    const a = await overview.amounts();
    const expectedSubtotal = round2(Object.values(listPrices).reduce((s, p) => s + p, 0));

    const num = (x: number[]) => [...x].sort((p, q) => p - q);
    expect(num(a.items)).toEqual(num(Object.values(listPrices)));
    expect(a.subtotal).toBe(expectedSubtotal);
    expect(a.tax).toBe(round2(expectedSubtotal * TAX_RATE));
    expect(a.total).toBe(round2(a.subtotal + a.tax));
  });

  // Required fields: each row leaves exactly one field empty.
  const required = [
    { field: 'first name', data: { ...CUSTOMER, firstName: '' }, error: 'First Name is required' },
    { field: 'last name', data: { ...CUSTOMER, lastName: '' }, error: 'Last Name is required' },
    { field: 'postal code', data: { ...CUSTOMER, postalCode: '' }, error: 'Postal Code is required' },
  ];

  for (const row of required) {
    test(`checkout blocks an empty ${row.field} @regression`, async ({ page, loggedIn, cart, checkoutInfo }) => {
      await loggedIn.add(PRODUCTS[0]);
      await loggedIn.cartLink.click();
      await cart.checkout.click();
      await checkoutInfo.fill(row.data);
      await expect(checkoutInfo.error).toContainText(row.error);
      await expect(page).toHaveURL(/checkout-step-one/);
    });
  }
});
