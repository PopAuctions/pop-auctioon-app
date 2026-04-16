import * as z from 'zod';

export const ContactUsSchema = z.object({
  name: z.string().min(1, {
    message: JSON.stringify({
      en: 'Name is required',
      es: 'El nombre es requerido',
    }),
  }),
  email: z.string().email({
    message: JSON.stringify({
      en: 'Valid email is required',
      es: 'Email válido es requerido',
    }),
  }),
  phone: z.string().optional(),
  message: z.string().min(10, {
    message: JSON.stringify({
      en: 'Message must be at least 10 characters',
      es: 'El mensaje debe tener al menos 10 caracteres',
    }),
  }),
  wantToSell: z.boolean(),
});

export type ContactUsSchemaType = z.infer<typeof ContactUsSchema>;
