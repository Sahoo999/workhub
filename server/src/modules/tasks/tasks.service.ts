import { AppError } from "../../utils/app-error.js";
import * as tasksRepository from "./tasks.repository.js";
import {
  createTaskSchema,
  listTasksSchema,
  updateTaskSchema,
} from "./tasks.schema.js";
import * as workspaceRepository from "../workspaces/workspaces.repository.js";
import * as activityRepository from "../activity/activity.repository.js";

export const createTask = async (
  input: unknown,
    projectId: string,
  workspaceId: string,
  userId: string,
) => {
    const data = createTaskSchema.parse(input);
    
    if (data.assignedTo) {
    const membership =
      await workspaceRepository.findMembership(
        workspaceId,
        data.assignedTo,
      );

    if (!membership) {
      throw new AppError(
        "Assigned user is not a member of this workspace",
        400,
        "INVALID_ASSIGNEE",
      );
    }
  }
  const task = await tasksRepository.createTask(
  projectId,
  userId,
  {
    title: data.title,
    description: data.description ?? null,
    status: data.status,
    priority: data.priority,
    assignedTo: data.assignedTo ?? null,
    dueDate: data.dueDate
      ? new Date(data.dueDate)
      : null,
  },
);

await activityRepository.createActivity({
  workspaceId,
  actorId: userId,
  entityType: "TASK",
  entityId: task.id,
  action: "TASK_CREATED",
  metadata: {
    title: task.title,
  },
});

return task;
};

export const getTask = async (taskId: string) => {
  const task = await tasksRepository.findTaskById(taskId);

  if (!task) {
    throw new AppError(
      "Task not found",
      404,
      "TASK_NOT_FOUND",
    );
  }

  return task;
};

export const getTasks = async (
  projectId: string,
  query: unknown,
) => {
  const data = listTasksSchema.parse(query);

  // Calculates index skip window
  const offset = (data.page - 1) * data.limit;

  // High-performance concurrent query execution
  // Fully compliant with exactOptionalPropertyTypes because repository now accepts '| undefined'
  const [tasks, total] = await Promise.all([
    tasksRepository.listTasks(projectId, {
      offset,
      limit: data.limit,
      status: data.status,
      priority: data.priority,
      assignedTo: data.assignedTo,
      search: data.search,
      sortBy: data.sortBy,
      order: data.order,
    }),

    tasksRepository.countTasks(projectId),
  ]);

  return {
    items: tasks,
    pagination: {
      page: data.page,
      limit: data.limit,
      total,
      totalPages: Math.ceil(total / data.limit),
    },
  };
};

export const updateTask = async (
  taskId: string,
  input: unknown,
  workspaceId: string,
  userId: string,
) => {
  const data = updateTaskSchema.parse(input);

  const existing =
    await tasksRepository.findTaskById(taskId);

  if (!existing) {
    throw new AppError(
      "Task not found",
      404,
      "TASK_NOT_FOUND",
    );
  }

  const updated =
  await tasksRepository.updateTask(taskId, {
    title: data.title ?? existing.title,
    description:
      data.description === undefined
        ? existing.description
        : data.description,
    status: data.status ?? existing.status,
    priority: data.priority ?? existing.priority,
    assignedTo:
      data.assignedTo === undefined
        ? existing.assigned_to
        : data.assignedTo,
    dueDate:
      data.dueDate === undefined
        ? existing.due_date
        : new Date(data.dueDate),
  });

  if (!updated) {
  throw new AppError(
    "Task could not be updated",
    500,
    "TASK_UPDATE_FAILED",
  );
}

await activityRepository.createActivity({
  workspaceId,
  actorId: userId,
  entityType: "TASK",
  entityId: taskId,
  action: "TASK_UPDATED",
  metadata: {
    oldStatus: existing.status,
    newStatus: updated.status,
    oldPriority: existing.priority,
    newPriority: updated.priority,
  },
});

return updated;
};
