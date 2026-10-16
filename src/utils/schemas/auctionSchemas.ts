import * as z from 'zod';
import { createValidationMessage } from '@/i18n/validation-message';

export const AuctionSchema = z.object({
  title: z.string().min(1, {
    message: createValidationMessage('validation.required'),
  }),
  startDate: z.string().min(1, {
    message: createValidationMessage('validation.required'),
  }),
  startTime: z.string().min(1, {
    message: createValidationMessage('validation.required'),
  }),
  country: z.string().min(1, {
    message: createValidationMessage('validation.required'),
  }),
  category: z.string().min(1, {
    message: createValidationMessage('validation.required'),
  }),
  image: z.string(),
});

export const AUCTION_DEFAULT_VALUES_MAP = {
  title: '',
  startDate: '',
  startTime: '',
  country: '',
  category: '',
  image: '',
};

export type AuctionFormValues = z.infer<typeof AuctionSchema>;
