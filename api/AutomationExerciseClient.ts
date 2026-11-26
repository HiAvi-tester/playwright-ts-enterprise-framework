import { type APIRequestContext, type APIResponse } from '@playwright/test';
import { uid } from '../utils/unique';

/**
 * Automation Exercise always answers HTTP 200 and reports the real outcome in a
 * `responseCode` field of the JSON body (201 created, 400 bad request, 404 not
 * found, 405 wrong method...). Trusting the HTTP status would make every negative
 * test pass by accident, so every call goes through `toApiResult`.
 */
export interface ApiResult<T> {
  /** Transport status. Expected to be 200 even for errors on this API. */
  httpStatus: number;
  /** The status the API actually means. Assert on this one. */
  responseCode: number;
  message?: string;
  body: T;
}

type Envelope = { responseCode: number; message?: string };

export async function toApiResult<T extends object = Record<string, never>>(response: APIResponse): Promise<ApiResult<T & Envelope>> {
  const httpStatus = response.status();
  const text = await response.text();
  let body: T & Envelope;
  try {
    body = JSON.parse(text) as T & Envelope;
  } catch {
    throw new Error(
      `Automation Exercise returned HTTP ${httpStatus} with a non-JSON body for ${response.url()} ` +
        `(site down or blocking automation?): ${text.slice(0, 200)}`,
    );
  }
  if (typeof body.responseCode !== 'number') {
    throw new Error(`Response from ${response.url()} has no numeric responseCode: ${text.slice(0, 200)}`);
  }
  return { httpStatus, responseCode: body.responseCode, message: body.message, body };
}

/** Form fields accepted by createAccount / updateAccount. */
export interface AeAccount {
  name: string;
  email: string;
  password: string;
  title: 'Mr' | 'Mrs' | 'Miss';
  birth_date: string;
  birth_month: string;
  birth_year: string;
  firstname: string;
  lastname: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  zipcode: string;
  state: string;
  city: string;
  mobile_number: string;
}

/** Shape returned by getUserDetailByEmail (note: different field names than the form). */
export interface AeUserDetail {
  id: number;
  name: string;
  email: string;
  title: string;
  birth_day: string;
  birth_month: string;
  birth_year: string;
  first_name: string;
  last_name: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
}

export interface AeProduct {
  id: number;
  name: string;
  price: string; // e.g. "Rs. 500"
  brand: string;
  category: { usertype: { usertype: string }; category: string };
}

export class AutomationExerciseClient {
  constructor(private readonly request: APIRequestContext) {}

  async createAccount(account: AeAccount): Promise<ApiResult<Envelope>> {
    return toApiResult(await this.request.post('/api/createAccount', { form: { ...account } }));
  }

  async verifyLogin(email: string, password: string): Promise<ApiResult<Envelope>> {
    return toApiResult(await this.request.post('/api/verifyLogin', { form: { email, password } }));
  }

  async getUserDetailByEmail(email: string): Promise<ApiResult<Envelope & { user?: AeUserDetail }>> {
    return toApiResult(await this.request.get('/api/getUserDetailByEmail', { params: { email } }));
  }

  async updateAccount(account: AeAccount): Promise<ApiResult<Envelope>> {
    return toApiResult(await this.request.put('/api/updateAccount', { form: { ...account } }));
  }

  async deleteAccount(email: string, password: string): Promise<ApiResult<Envelope>> {
    return toApiResult(await this.request.delete('/api/deleteAccount', { form: { email, password } }));
  }

  async getProducts(): Promise<ApiResult<Envelope & { products?: AeProduct[] }>> {
    return toApiResult(await this.request.get('/api/productsList'));
  }

  /** `term` undefined sends the request without the required parameter (negative test). */
  async searchProduct(term?: string): Promise<ApiResult<Envelope & { products?: AeProduct[] }>> {
    const options = term === undefined ? {} : { form: { search_product: term } };
    return toApiResult(await this.request.post('/api/searchProduct', options));
  }

  /** Raw call with an arbitrary method, for "method not allowed" checks. */
  async call(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string): Promise<ApiResult<Envelope>> {
    return toApiResult(await this.request.fetch(path, { method }));
  }
}

/** A unique, valid account so parallel tests on the shared site never collide. */
export function buildAeAccount(overrides: Partial<AeAccount> = {}): AeAccount {
  const id = uid(10);
  return {
    name: `QA ${id.slice(0, 5)}`,
    email: `qa.${id}@example.com`,
    password: `Pw-${uid(12)}`,
    title: 'Mr',
    birth_date: '15',
    birth_month: '6',
    birth_year: '1990',
    firstname: 'QA',
    lastname: `Auto${id.slice(0, 5)}`,
    company: 'Test Co',
    address1: '1 Test Street',
    address2: 'Suite 2',
    country: 'India',
    zipcode: '110001',
    state: 'Delhi',
    city: 'New Delhi',
    mobile_number: '9000000000',
    ...overrides,
  };
}
