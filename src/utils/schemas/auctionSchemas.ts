import * as z from 'zod';

export const AuctionSchema = z.object({
  title: z.string().min(1, {
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
  }),
  startDate: z.string().min(1, {
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
  }),
  startTime: z.string().min(1, {
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
  }),
  country: z.string().min(1, {
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
  }),
  category: z.string().min(1, {
    message: JSON.stringify({
      en: 'Required',
      es: 'Requerido',
    }),
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
