import * as z from 'zod';
import { createValidationMessage } from '@/i18n/validation-message';

export const ContactUsSchema = z.object({
  name: z.string().min(1, {
    message: createValidationMessage('validation.nameRequired'),
  }),
  email: z.string().email({
    message: createValidationMessage('validation.validEmailRequired'),
  }),
  phone: z.string().optional(),
  message: z.string().min(10, {
    message: createValidationMessage('validation.messageMin10'),
  }),
  wantToSell: z.boolean(),
});

export type ContactUsSchemaType = z.infer<typeof ContactUsSchema>;
