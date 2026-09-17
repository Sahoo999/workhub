import { z } from "zod";

export const createNotificationSchema = z.object({
  type: z.string().trim().min(1).max(50),

  title: z.string().trim().min(1).max(200),

  message: z.string().trim().min(1).max(5000),

  entityType: z.string().trim().max(50).optional(),

  entityId: z.string().uuid().optional(),
});

export type CreateNotificationInput = z.infer<
  typeof createNotificationSchema
>;