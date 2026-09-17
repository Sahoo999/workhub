import { z } from "zod";

export const createLabelSchema = z.object({
  name: z.string().trim().min(1).max(50),
  color: z.string().trim().max(20).optional(),
});

export const labelIdSchema = z.object({
  labelId: z.string().uuid(),
});