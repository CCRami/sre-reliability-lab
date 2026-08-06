import { z } from "zod";

export const fulfillmentEventSchema = z.object({
  eventVersion: z.literal("1"),
  orderId: z.uuid(),
  enqueuedAt: z.iso.datetime(),
  traceparent: z.string().optional(),
  tracestate: z.string().optional(),
  attempt: z.coerce.number().int().nonnegative().default(0),
});

export type FulfillmentEvent = z.infer<typeof fulfillmentEventSchema>;

export const createOrderSchema = z.object({
  productId: z.uuid(),
  quantity: z.number().int().min(1).max(20),
});
