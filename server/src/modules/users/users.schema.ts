import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(100),

  email: z.string().trim().toLowerCase().pipe(z.email()),

  password: z.string().min(8).max(72),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;