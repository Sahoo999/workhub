import { z } from "zod";

export const createTaskFormSchema = z.object({
  title: z.string().trim().min(1).max(200),

  description: z.string().max(10000),

  status: z.enum([
    "TODO",
    "IN_PROGRESS",
    "IN_REVIEW",
    "DONE",
  ]),

  priority: z.enum([
    "LOW",
    "MEDIUM",
    "HIGH",
    "URGENT",
  ]),

  dueDate: z.string(),
});

export type CreateTaskFormData =
  z.infer<typeof createTaskFormSchema>;