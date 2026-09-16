import { AppError } from "../../utils/app-error.js";
import * as projectsRepository from "./projects.repository.js";
import {
  createProjectSchema,
  updateProjectSchema,
} from "./projects.schema.js";

export const createProject = async (
  input: unknown,
  workspaceId: string,
  userId: string,
) => {
  const data = createProjectSchema.parse(input);

  const project = await projectsRepository.createProject(
    workspaceId,
    userId,
    data.name,
    data.description ?? null,
  );

  return project;
};

export const getProjects = async (
  workspaceId: string,
) => {
  return projectsRepository.findProjectsByWorkspaceId(
    workspaceId,
  );
};

export const getProject = async (projectId: string) => {
  const project =
    await projectsRepository.findProjectById(projectId);

  if (!project) {
    throw new AppError(
      "Project not found",
      404,
      "PROJECT_NOT_FOUND",
    );
  }

  return project;
};

export const updateProject = async (
  projectId: string,
  input: unknown,
) => {
  const data = updateProjectSchema.parse(input);

  const existing =
    await projectsRepository.findProjectById(projectId);

  if (!existing) {
    throw new AppError(
      "Project not found",
      404,
      "PROJECT_NOT_FOUND",
    );
  }

    // merge changes and If a field isn't provided, keep the original database values
  const name = data.name ?? existing.name;
  const description =
    data.description === undefined
      ? existing.description
      : data.description;

  return projectsRepository.updateProject(
    projectId,
    name,
    description ?? null,
  );
};