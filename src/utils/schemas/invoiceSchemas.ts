import { z } from 'zod';

export const InvoicePayloadSchema = z.object({
  paymentId: z.number(),
  billingInfo: z.object({
    billingName: z.string(),
    billingAddress: z.string(),
    vatNumber: z.string(),
  }),
});

export type InvoicePayloadType = z.infer<typeof InvoicePayloadSchema>;
