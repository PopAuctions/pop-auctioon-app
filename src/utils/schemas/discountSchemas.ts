import { z } from 'zod';

export const NewDiscountSchema = z.object({
  code: z
    .string()
    .min(1, {
      message: JSON.stringify({
        en: 'Required',
        es: 'Requerido',
      }),
    })
    .regex(/^\S+$/, {
      message: JSON.stringify({
        en: 'No spaces allowed',
        es: 'No se permiten espacios',
      }),
    })
    .transform((val) => val.toUpperCase()),
  discountValue: z.string().min(1, {
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
  }),
  expiresAt: z.preprocess(
    (val) => (val === '' ? null : val),
    z.date().nullable().optional()
  ),
});

export type NewDiscountValues = z.infer<typeof NewDiscountSchema>;
