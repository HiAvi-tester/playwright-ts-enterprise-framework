import { type JSONSchemaType } from 'ajv';
import { ajv } from './booking.schema';
import type { AeProduct, AeUserDetail } from '../api/AutomationExerciseClient';

/**
 * Contract checks for Automation Exercise. `additionalProperties: false` means a
 * renamed or newly added field fails the test, which is the point of a contract test.
 */

const productSchema: JSONSchemaType<AeProduct> = {
  type: 'object',
  properties: {
    id: { type: 'integer', minimum: 1 },
    name: { type: 'string', minLength: 1 },
    price: { type: 'string', pattern: '^Rs\\. \\d+$' },
    brand: { type: 'string', minLength: 1 },
    category: {
      type: 'object',
      properties: {
        usertype: {
          type: 'object',
          properties: { usertype: { type: 'string', minLength: 1 } },
          required: ['usertype'],
          additionalProperties: false,
        },
        category: { type: 'string', minLength: 1 },
      },
      required: ['usertype', 'category'],
      additionalProperties: false,
    },
  },
  required: ['id', 'name', 'price', 'brand', 'category'],
  additionalProperties: false,
};

interface ProductsResponse {
  responseCode: number;
  products: AeProduct[];
}

const productsResponseSchema: JSONSchemaType<ProductsResponse> = {
  type: 'object',
  properties: {
    responseCode: { type: 'integer', const: 200 },
    products: { type: 'array', items: productSchema },
  },
  required: ['responseCode', 'products'],
  additionalProperties: false,
};

const str = { type: 'string' } as const;

interface UserDetailResponse {
  responseCode: number;
  user: AeUserDetail;
}

const userDetailResponseSchema: JSONSchemaType<UserDetailResponse> = {
  type: 'object',
  properties: {
    responseCode: { type: 'integer', const: 200 },
    user: {
      type: 'object',
      properties: {
        id: { type: 'integer', minimum: 1 },
        name: str,
        email: { type: 'string', pattern: '^[^@\\s]+@[^@\\s]+$' },
        title: str,
        birth_day: str,
        birth_month: str,
        birth_year: str,
        first_name: str,
        last_name: str,
        company: str,
        address1: str,
        address2: str,
        country: str,
        state: str,
        city: str,
        zipcode: str,
      },
      required: [
        'id', 'name', 'email', 'title', 'birth_day', 'birth_month', 'birth_year', 'first_name',
        'last_name', 'company', 'address1', 'address2', 'country', 'state', 'city', 'zipcode',
      ],
      additionalProperties: false,
    },
  },
  required: ['responseCode', 'user'],
  additionalProperties: false,
};

export const validateProductsResponse = ajv.compile(productsResponseSchema);
export const validateUserDetailResponse = ajv.compile(userDetailResponseSchema);
