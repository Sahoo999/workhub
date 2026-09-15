import { z } from "zod";

export const createWorkspaceSchema = z.object({
    // Schema for workspace name
  name: z.string().trim().min(2).max(150),
});

export type CreateWorkspaceInput = z.infer<
  typeof createWorkspaceSchema
>;