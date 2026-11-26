import Ajv, { type JSONSchemaType } from 'ajv';
import type { Booking, CreatedBooking } from '../api/BookingClient';

const bookingSchema: JSONSchemaType<Booking> = {
  type: 'object',
  properties: {
    firstname: { type: 'string' },
    lastname: { type: 'string' },
    totalprice: { type: 'number' },
    depositpaid: { type: 'boolean' },
    bookingdates: {
      type: 'object',
      properties: {
        checkin: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        checkout: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
      },
      required: ['checkin', 'checkout'],
      additionalProperties: false,
    },
    additionalneeds: { type: 'string', nullable: true },
  },
  required: ['firstname', 'lastname', 'totalprice', 'depositpaid', 'bookingdates'],
  additionalProperties: false,
};

const createdBookingSchema: JSONSchemaType<CreatedBooking> = {
  type: 'object',
  properties: {
    bookingid: { type: 'integer' },
    booking: bookingSchema,
  },
  required: ['bookingid', 'booking'],
  additionalProperties: false,
};

const ajv = new Ajv({ allErrors: true });
export const validateBooking = ajv.compile(bookingSchema);
export const validateCreatedBooking = ajv.compile(createdBookingSchema);

/** Human-readable error list for assertion messages. */
export function schemaErrors(validator: { errors?: unknown }): string {
  return JSON.stringify(validator.errors ?? [], null, 2);
}
