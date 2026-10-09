import * as z from 'zod';
import { createValidationMessage } from '@/i18n/validation-message';
export const BillingSchema = z.object({
  label: z.string().min(1, {
    message: createValidationMessage('validation.required'),
  }),
  billingName: z.string().min(1, {
    message: createValidationMessage('validation.required'),
  }),
  billingAddress: z.string().min(1, {
    message: createValidationMessage('validation.required'),
  }),
  vatNumber: z.string().min(1, {
    message: createValidationMessage('validation.required'),
  }),
  country: z.string().min(1, {
    message: createValidationMessage('validation.required'),
  }),
  city: z.string().min(1, {
    message: createValidationMessage('validation.required'),
  }),
  postalCode: z.string().min(1, {
    message: createValidationMessage('validation.required'),
  }),
});

export type BillingSchemaType = z.infer<typeof BillingSchema>;
