import { type APIRequestContext, type APIResponse } from '@playwright/test';

export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: { checkin: string; checkout: string };
  additionalneeds?: string;
}

export interface CreatedBooking {
  bookingid: number;
  booking: Booking;
}

/**
 * Thin, typed wrapper around the Restful-Booker API.
 * Keeps endpoint paths and auth handling out of the test bodies.
 */
export class BookingClient {
  constructor(private readonly request: APIRequestContext) {}

  async createToken(username: string, password: string): Promise<string> {
    const res = await this.request.post('/auth', { data: { username, password } });
    const body = await res.json();
    if (!body.token) throw new Error(`Auth failed: ${JSON.stringify(body)}`);
    return body.token as string;
  }

  create(booking: Booking): Promise<APIResponse> {
    return this.request.post('/booking', { data: booking });
  }

  get(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  update(id: number, booking: Booking, token?: string): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, { data: booking, headers: this.authHeader(token) });
  }

  partialUpdate(id: number, patch: Partial<Booking>, token: string): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, { data: patch, headers: this.authHeader(token) });
  }

  delete(id: number, token: string): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, { headers: this.authHeader(token) });
  }

  private authHeader(token?: string): Record<string, string> {
    return token ? { Cookie: `token=${token}` } : {};
  }
}

/** Builds a unique, valid booking so parallel tests never collide on data. */
export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return {
    firstname: 'QA',
    lastname: `Auto${suffix}`,
    totalprice: 150,
    depositpaid: true,
    bookingdates: { checkin: '2027-01-10', checkout: '2027-01-15' },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}
