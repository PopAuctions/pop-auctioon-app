import { z } from 'zod';
import { createValidationMessage } from '@/i18n/validation-message';

export const NewDiscountSchema = z.object({
  code: z
    .string()
    .min(1, {
      message: createValidationMessage('validation.required'),
    })
    .regex(/^\S+$/, {
      message: createValidationMessage('validation.noSpacesAllowed'),
    })
    .transform((val) => val.toUpperCase()),
  discountValue: z.string().min(1, {
    message: createValidationMessage('validation.required'),
  }),
  expiresAt: z.preprocess(
    (val) => (val === '' ? null : val),
    z.date().nullable().optional()
  ),
});

export type NewDiscountValues = z.infer<typeof NewDiscountSchema>;
