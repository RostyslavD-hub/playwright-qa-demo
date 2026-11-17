import { test as base } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { InventoryPage } from './pages/InventoryPage';
import { CartPage, CheckoutInfoPage, CheckoutOverviewPage } from './pages/CheckoutPages';
import { USERS, PASSWORD } from './data/users';

type Pages = {
  loginPage: LoginPage;
  inventory: InventoryPage;
  cart: CartPage;
  checkoutInfo: CheckoutInfoPage;
  overview: CheckoutOverviewPage;
  /** Inventory page opened as standard_user. */
  loggedIn: InventoryPage;
};

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventory: async ({ page }, use) => use(new InventoryPage(page)),
  cart: async ({ page }, use) => use(new CartPage(page)),
  checkoutInfo: async ({ page }, use) => use(new CheckoutInfoPage(page)),
  overview: async ({ page }, use) => use(new CheckoutOverviewPage(page)),
  loggedIn: async ({ loginPage, inventory }, use) => {
    await loginPage.open();
    await loginPage.login(USERS.standard, PASSWORD);
    await inventory.expectLoaded();
    await use(inventory);
  },
});

export { expect } from '@playwright/test';
