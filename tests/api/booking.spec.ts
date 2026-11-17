import { test, expect, type APIRequestContext } from '@playwright/test';

// Public demo API (restful-booker). Its credentials are published in the API docs.
const AUTH = { username: process.env.BOOKER_USER ?? 'admin', password: process.env.BOOKER_PASSWORD ?? 'password123' };

const newBooking = () => ({
  firstname: 'QA',
  lastname: `Demo-${Date.now()}`,
  totalprice: 150,
  depositpaid: true,
  bookingdates: { checkin: '2027-01-10', checkout: '2027-01-12' },
  additionalneeds: 'Breakfast',
});

async function token(request: APIRequestContext): Promise<string> {
  const res = await request.post('/auth', { data: AUTH });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.token, 'auth token').toBeTruthy();
  return body.token;
}

test.describe('Booking API', () => {
  test('health check @smoke', async ({ request }) => {
    const res = await request.get('/ping');
    expect(res.status()).toBe(201);
  });

  test('wrong credentials do not return a token @regression', async ({ request }) => {
    const res = await request.post('/auth', { data: { username: 'admin', password: 'wrong' } });
    // Quirk of this API: it answers 200 with a reason instead of 401. The test pins the contract
    // that matters to clients: no token is issued.
    const body = await res.json();
    expect(body.token).toBeUndefined();
    expect(body.reason).toBe('Bad credentials');
  });

  test('booking lifecycle: create, read, update, partial update, delete @smoke', async ({ request }) => {
    const auth = { Cookie: `token=${await token(request)}` };
    const data = newBooking();

    // Create
    const created = await request.post('/booking', { data });
    expect(created.ok()).toBeTruthy();
    const { bookingid, booking } = await created.json();
    expect(booking).toEqual(data);

    // Read: what we stored is what we get back
    const read = await request.get(`/booking/${bookingid}`);
    expect(await read.json()).toEqual(data);

    // Full update (PUT replaces the whole object)
    const updated = { ...data, totalprice: 200, additionalneeds: 'Late checkout' };
    const put = await request.put(`/booking/${bookingid}`, { data: updated, headers: auth });
    expect(put.ok()).toBeTruthy();
    expect(await put.json()).toEqual(updated);

    // Partial update (PATCH changes only the sent fields)
    const patch = await request.patch(`/booking/${bookingid}`, { data: { firstname: 'Patched' }, headers: auth });
    expect(await patch.json()).toEqual({ ...updated, firstname: 'Patched' });

    // Delete, then it must be gone
    const del = await request.delete(`/booking/${bookingid}`, { headers: auth });
    expect(del.status()).toBe(201);
    expect((await request.get(`/booking/${bookingid}`)).status()).toBe(404);
  });

  test('update without a token is rejected and data stays unchanged @regression', async ({ request }) => {
    const data = newBooking();
    const { bookingid } = await (await request.post('/booking', { data })).json();

    const put = await request.put(`/booking/${bookingid}`, { data: { ...data, totalprice: 1 } });
    expect(put.status()).toBe(403);
    expect(await (await request.get(`/booking/${bookingid}`)).json()).toEqual(data);

    // Cleanup
    await request.delete(`/booking/${bookingid}`, { headers: { Cookie: `token=${await token(request)}` } });
  });

  test('search by name finds the created booking @regression', async ({ request }) => {
    const data = newBooking();
    const { bookingid } = await (await request.post('/booking', { data })).json();

    const res = await request.get('/booking', { params: { firstname: data.firstname, lastname: data.lastname } });
    const ids = (await res.json()).map((b: { bookingid: number }) => b.bookingid);
    expect(ids).toContain(bookingid);

    await request.delete(`/booking/${bookingid}`, { headers: { Cookie: `token=${await token(request)}` } });
  });
});
