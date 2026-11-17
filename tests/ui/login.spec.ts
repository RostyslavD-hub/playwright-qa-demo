import { test, expect } from '../../fixtures';
import { USERS, PASSWORD } from '../../data/users';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('valid user lands on the product list @smoke', async ({ loginPage, inventory }) => {
    await loginPage.login(USERS.standard, PASSWORD);
    await inventory.expectLoaded();
    await expect(inventory.items).not.toHaveCount(0);
  });

  // Decision table: each row is one combination of inputs with a single expected outcome.
  const negative = [
    { name: 'empty username', user: '', pass: PASSWORD, error: 'Username is required' },
    { name: 'empty password', user: USERS.standard, pass: '', error: 'Password is required' },
    { name: 'wrong password', user: USERS.standard, pass: 'wrong', error: 'Username and password do not match' },
    { name: 'unknown user', user: 'no_such_user', pass: PASSWORD, error: 'Username and password do not match' },
    { name: 'locked out user', user: USERS.lockedOut, pass: PASSWORD, error: 'this user has been locked out' },
  ];

  for (const row of negative) {
    test(`rejects ${row.name} @regression`, async ({ page, loginPage }) => {
      await loginPage.login(row.user, row.pass);
      await expect(loginPage.error).toContainText(row.error);
      await expect(page).not.toHaveURL(/inventory\.html/);
    });
  }

  test('protected page redirects to login without a session @regression', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');
    await expect(loginPage.error).toContainText('only access');
    await expect(loginPage.submit).toBeVisible();
  });
});
