import { test, expect } from '../../fixtures/base.fixture';
import { buildBooking, type CreatedBooking } from '../../api/BookingClient';
import { validateBooking, validateCreatedBooking, schemaErrors } from '../../schemas/booking.schema';

/**
 * Every test creates its own booking, so tests are independent,
 * order-free, and safe to run in parallel or across shards.
 */
test.describe('Booking API', () => {
  test('auth endpoint issues a token @smoke', async ({ authToken }) => {
    expect(authToken).toMatch(/^\w{10,}$/);
  });

  test('POST /booking creates a booking that matches the schema', async ({ bookingClient }) => {
    const payload = buildBooking();
    const res = await bookingClient.create(payload);

    expect(res.status()).toBe(200);
    const body: CreatedBooking = await res.json();
    expect(validateCreatedBooking(body), schemaErrors(validateCreatedBooking)).toBe(true);
    expect(body.booking).toEqual(payload);
  });

  test('GET /booking/:id returns the stored booking', async ({ bookingClient }) => {
    const payload = buildBooking({ totalprice: 321 });
    const { bookingid } = await (await bookingClient.create(payload)).json();

    const res = await bookingClient.get(bookingid);

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(validateBooking(body), schemaErrors(validateBooking)).toBe(true);
    expect(body).toEqual(payload);
  });

  test('PUT /booking/:id replaces the booking when authorised', async ({ bookingClient, authToken }) => {
    const { bookingid } = await (await bookingClient.create(buildBooking())).json();
    const updated = buildBooking({ firstname: 'Updated', totalprice: 999, depositpaid: false });

    const res = await bookingClient.update(bookingid, updated, authToken);

    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual(updated);
  });

  test('PATCH /booking/:id changes only the given fields', async ({ bookingClient, authToken }) => {
    const original = buildBooking();
    const { bookingid } = await (await bookingClient.create(original)).json();

    const res = await bookingClient.partialUpdate(bookingid, { additionalneeds: 'Late checkout' }, authToken);

    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ...original, additionalneeds: 'Late checkout' });
  });

  test('DELETE /booking/:id removes the booking', async ({ bookingClient, authToken }) => {
    const { bookingid } = await (await bookingClient.create(buildBooking())).json();

    const del = await bookingClient.delete(bookingid, authToken);
    expect(del.status()).toBe(201); // Restful-Booker's documented (non-standard) success code

    const get = await bookingClient.get(bookingid);
    expect(get.status()).toBe(404);
  });

  test('PUT without a token is forbidden', async ({ bookingClient }) => {
    const { bookingid } = await (await bookingClient.create(buildBooking())).json();

    const res = await bookingClient.update(bookingid, buildBooking());

    expect(res.status()).toBe(403);
  });
});
