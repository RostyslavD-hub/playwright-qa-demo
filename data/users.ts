// Public demo accounts. Saucedemo prints them on its own login page,
// so they are not secrets. Real projects should read credentials from env / a secret store.
export const PASSWORD = process.env.SAUCE_PASSWORD ?? 'secret_sauce';

export const USERS = {
  standard: 'standard_user',
  lockedOut: 'locked_out_user',
  problem: 'problem_user',
} as const;

export const CUSTOMER = { firstName: 'Test', lastName: 'Customer', postalCode: '81101' };
