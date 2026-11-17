# Playwright QA Demo

A small but production-style test automation project in **Playwright + TypeScript**. It shows how I structure UI and API tests, choose what to automate first and keep a suite fast and trustworthy.

Applications under test are public demo apps:
- **UI:** [Sauce Demo](https://www.saucedemo.com), an e-commerce flow (login → products → cart → checkout).
- **API:** [Restful Booker](https://restful-booker.herokuapp.com), a REST API with auth and CRUD.

## What it demonstrates

| Area | How |
|---|---|
| Page Object Model | `pages/` hides locators and page actions; tests read like scenarios |
| Fixtures | `fixtures.ts` injects page objects and a ready logged-in session (`loggedIn`) |
| Stable locators | `data-test` attributes via `testIdAttribute`, role-based locators for buttons |
| Smoke vs regression | `@smoke` is a fast "is it alive" gate; `@regression` covers rules and edge cases |
| Mobile | Smoke runs on emulated iPhone 14 (WebKit) and Pixel 7 (Chromium) |
| Data consistency | The same price must match on the product list, cart and checkout; subtotal, tax and total must add up |
| API testing | Full booking lifecycle (create → read → PUT → PATCH → delete), auth, negative cases, cleanup |
| Known bugs | Kept as `test.fail()` tests: green while the bug exists, red when it gets fixed, which is the signal to retest |
| CI | GitHub Actions: type check → smoke gate → regression, HTML report as an artifact, weekday scheduled run |

## Test design

Tests come from explicit techniques rather than ad-hoc clicking:

| Technique | Where |
|---|---|
| Decision table | Login: empty username / empty password / wrong password / unknown user / locked user, each with one expected error |
| Equivalence partitioning | Checkout form: one required field empty per case, plus the valid partition in the purchase flow |
| State transitions | Cart badge: 0 → 1 → 2 → 1 → 0, and cart state after page reload |
| Invariants | Sorting changes order but not the set of products; every sort option is checked on the whole list |
| Cross-checks | UI prices vs cart vs overview; API response of create vs read vs update |

## What I automated first, and why

1. **Smoke on every platform:** login, add to cart, full purchase. If any of these breaks, nothing else matters.
2. **Money and data:** price and total consistency. Wrong totals are the most expensive bugs and the hardest to notice by eye.
3. **Rules with many combinations:** login and form validation. Tedious to repeat by hand, cheap to automate with data-driven tests.
4. **Not automated on purpose:** visual layout and exploratory checks. These stay manual until the UI is stable.

## Project structure

```
pages/            page objects (LoginPage, InventoryPage, CheckoutPages)
fixtures.ts       custom fixtures: page objects + logged-in session
data/users.ts     test users and customer data
tests/ui/         UI tests: login, product list, checkout, known issues
tests/api/        API tests: booking lifecycle, auth, negative cases
.github/workflows CI pipeline
```

## Run it

```bash
npm ci
npx playwright install chromium webkit
npm test            # everything: api + desktop + mobile smoke
npm run smoke       # fast gate only
npm run regression  # rules and edge cases
npm run api         # API tests only
npm run report      # open the last HTML report
```

## Using AI agents in this project

I build tests together with an AI agent in the terminal (Claude Code) and Playwright MCP:
- the agent explores the app through Playwright MCP and suggests locators and edge cases;
- I review the test design, decide what to automate and verify every assertion against the app;
- failing runs are analyzed from Playwright's `error-context.md`, traces and screenshots.

The agent speeds up routine work; test design and the final decision on each check stay with me.

## Notes

- Credentials in `data/users.ts` and the API test are the public demo accounts published by these apps. They can be overridden with `SAUCE_PASSWORD`, `BOOKER_USER` and `BOOKER_PASSWORD`.
- Both apps are shared public demos, so API data can be reset by their owners at any time. Tests create their own data and clean it up.
