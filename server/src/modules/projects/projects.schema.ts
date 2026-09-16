import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(5000).optional(),
});

// .partial() is a Zod utility that automatically takes
//  the exact rules from createProjectSchema and makes all properties optional.
export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.infer<
  typeof createProjectSchema
>;

export type UpdateProjectInput = z.infer<
  typeof updateProjectSchema
>;