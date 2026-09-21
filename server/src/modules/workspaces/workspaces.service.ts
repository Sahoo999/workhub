import { pool } from "../../db/client.js";
import { AppError } from "../../utils/app-error.js";
import {
  createWorkspaceSchema,
} from "./workspaces.schema.js";
import * as workspaceRepository from "./workspaces.repository.js";

export const createWorkspace = async (
  input: unknown,
  userId: string,
) => {
  const data = createWorkspaceSchema.parse(input);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const workspace =
      await workspaceRepository.createWorkspace(
        client,
        data.name,
        userId,
          );
      

      if (!workspace) {
      throw new AppError(
        "Database failed to generate workspace container",
        500,
        "DATABASE_ERROR",
      );
    }

    await workspaceRepository.addMember(
      client,
      workspace.id,
      userId,
      "OWNER",
    );

    await client.query("COMMIT");

    return {
      id: workspace.id,
      name: workspace.name,
      createdBy: workspace.created_by,
      createdAt: workspace.created_at,
    };
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Create workspace transaction failed:", error);

    throw new AppError(
      "Unable to create workspace",
      500,
      "WORKSPACE_CREATION_FAILED",
    );
  } finally {
    client.release();
  }
};

export const getWorkspaces = async (
  userId: string,
) => {
  return workspaceRepository.findWorkspacesByUserId(
    userId,
  );
};

export const getWorkspace = async (
  workspaceId: string,
) => {
  const workspace =
    await workspaceRepository.findWorkspaceById(
      workspaceId,
    );

  if (!workspace) {
    throw new AppError(
      "Workspace not found",
      404,
      "WORKSPACE_NOT_FOUND",
    );
  }

  return workspace;
};