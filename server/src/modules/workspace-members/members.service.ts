import {
  AppError,
} from "../../utils/app-error.js";

import {
  findMembership,
} from "../workspaces/workspaces.repository.js";

import {
  addMemberSchema,
  updateMemberRoleSchema,
} from "./members.schema.js";

import * as membersRepository from "./members.repository.js";

export type WorkspaceRole =
  | "OWNER"
  | "ADMIN"
  | "MEMBER"
  | "VIEWER";

const isWorkspaceRole = (
  role: string,
): role is WorkspaceRole => {
  return (
    role === "OWNER" ||
    role === "ADMIN" ||
    role === "MEMBER" ||
    role === "VIEWER"
  );
};

const getActorRole = async (
  workspaceId: string,
  actorUserId: string,
): Promise<WorkspaceRole> => {

  const membership =
  await findMembership(
    workspaceId,
    actorUserId,
  );

  if (!membership) {
    throw new AppError(
      "You are not a member of this workspace.",
      403,
      "WORKSPACE_ACCESS_DENIED",
    );
  }

  if (!isWorkspaceRole(membership.role)) {
    throw new AppError(
      "Invalid workspace role.",
      500,
      "INVALID_WORKSPACE_ROLE",
    );
  }

  return membership.role;
};

export const getMembers = async (
  workspaceId: string,
  actorUserId: string,
) => {
  await getActorRole(
    workspaceId,
    actorUserId,
  );

  return membersRepository.listMembers(
    workspaceId,
  );
};

export const addMember = async (
  workspaceId: string,
  actorUserId: string,
  input: unknown,
) => {
  const actorRole =
    await getActorRole(
      workspaceId,
      actorUserId,
    );

  if (
    actorRole !== "OWNER" &&
    actorRole !== "ADMIN"
  ) {
    throw new AppError(
      "You do not have permission to add members.",
      403,
      "INSUFFICIENT_ROLE",
    );
  }

  const data =
    addMemberSchema.parse(input);

  if (
    actorRole !== "OWNER" &&
    data.role === "ADMIN"
  ) {
    throw new AppError(
      "Only the workspace owner can add administrators.",
      403,
      "INSUFFICIENT_ROLE",
    );
  }

  const targetUser =
    await membersRepository.findUserByEmail(
      data.email,
    );

  if (!targetUser) {
    throw new AppError(
      "No user exists with that email address.",
      404,
      "USER_NOT_FOUND",
    );
  }

  if (
    targetUser.id === actorUserId
  ) {
    throw new AppError(
      "You are already a member of this workspace.",
      400,
      "CANNOT_ADD_SELF",
    );
  }

  const existingMember =
    await membersRepository.findMember(
      workspaceId,
      targetUser.id,
    );

  if (existingMember) {
    throw new AppError(
      "This user is already a member of the workspace.",
      409,
      "ALREADY_MEMBER",
    );
  }

  return membersRepository.addMember(
    workspaceId,
    targetUser.id,
    data.role,
  );
};

export const updateMemberRole = async (
  workspaceId: string,
  actorUserId: string,
  targetUserId: string,
  input: unknown,
) => {
  const actorRole =
    await getActorRole(
      workspaceId,
      actorUserId,
    );

  if (
    actorRole !== "OWNER" &&
    actorRole !== "ADMIN"
  ) {
    throw new AppError(
      "You do not have permission to change member roles.",
      403,
      "INSUFFICIENT_ROLE",
    );
  }

  if (
    actorUserId === targetUserId
  ) {
    throw new AppError(
      "You cannot change your own workspace role.",
      400,
      "CANNOT_CHANGE_OWN_ROLE",
    );
  }

  const data =
    updateMemberRoleSchema.parse(input);

  const target =
    await membersRepository.findMember(
      workspaceId,
      targetUserId,
    );

  if (!target) {
    throw new AppError(
      "Workspace member not found.",
      404,
      "MEMBER_NOT_FOUND",
    );
  }

  if (target.role === "OWNER") {
    throw new AppError(
      "The workspace owner role cannot be changed here.",
      403,
      "OWNER_ROLE_PROTECTED",
    );
  }

  if (
    actorRole !== "OWNER" &&
    target.role === "ADMIN"
  ) {
    throw new AppError(
      "Only the workspace owner can modify an administrator.",
      403,
      "INSUFFICIENT_ROLE",
    );
  }

  if (
    actorRole !== "OWNER" &&
    data.role === "ADMIN"
  ) {
    throw new AppError(
      "Only the workspace owner can promote a member to administrator.",
      403,
      "INSUFFICIENT_ROLE",
    );
  }

  const updated =
    await membersRepository.updateMemberRole(
      workspaceId,
      targetUserId,
      data.role,
    );

  if (!updated) {
    throw new AppError(
      "The member role could not be updated.",
      409,
      "ROLE_UPDATE_FAILED",
    );
  }

  return updated;
};

export const removeMember = async (
  workspaceId: string,
  actorUserId: string,
  targetUserId: string,
): Promise<void> => {
  const actorRole =
    await getActorRole(
      workspaceId,
      actorUserId,
    );

  if (
    actorRole !== "OWNER" &&
    actorRole !== "ADMIN"
  ) {
    throw new AppError(
      "You do not have permission to remove members.",
      403,
      "INSUFFICIENT_ROLE",
    );
  }

  if (
    actorUserId === targetUserId
  ) {
    throw new AppError(
      "You cannot remove yourself from the workspace.",
      400,
      "CANNOT_REMOVE_SELF",
    );
  }

  const target =
    await membersRepository.findMember(
      workspaceId,
      targetUserId,
    );

  if (!target) {
    throw new AppError(
      "Workspace member not found.",
      404,
      "MEMBER_NOT_FOUND",
    );
  }

  if (target.role === "OWNER") {
    throw new AppError(
      "The workspace owner cannot be removed.",
      403,
      "OWNER_CANNOT_BE_REMOVED",
    );
  }

  if (
    actorRole !== "OWNER" &&
    target.role === "ADMIN"
  ) {
    throw new AppError(
      "Only the workspace owner can remove an administrator.",
      403,
      "INSUFFICIENT_ROLE",
    );
  }

  const removed =
    await membersRepository.removeMember(
      workspaceId,
      targetUserId,
    );

  if (!removed) {
    throw new AppError(
      "The member could not be removed.",
      409,
      "REMOVE_FAILED",
    );
  }
};