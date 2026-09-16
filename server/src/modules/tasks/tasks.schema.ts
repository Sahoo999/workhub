import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),

  description: z.string().trim().max(10000).optional(),

  status: z
    .enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"])
    .default("TODO"),

  priority: z
    .enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
    .default("MEDIUM"),

  assignedTo: z.uuid().optional(),

  dueDate: z.iso.datetime().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

// optimized schema for handling URL query parameters when fetching lists of tasks
//  (e.g., GET /tasks?page=2&status=IN_PROGRESS)
export const listTasksSchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().positive().max(100).default(20),

  status: z
    .enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"])
    .optional(),

  priority: z
    .enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
    .optional(),

  assignedTo: z.uuid().optional(),

  search: z.string().trim().max(100).optional(),

  sortBy: z
    .enum(["created_at", "due_date", "priority"])
    .default("created_at"),

  order: z.enum(["asc", "desc"]).default("desc"),
});