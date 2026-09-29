import { pool } from "../../db/client.js";
import { AppError } from "../../utils/app-error.js";

import * as tasksRepository from "./tasks.repository.js";

import {
  createTaskSchema,
  listTasksSchema,
  updateTaskSchema,
} from "./tasks.schema.js";

import * as workspaceRepository from "../workspaces/workspaces.repository.js";
import * as activityRepository from "../activity/activity.repository.js";
import * as notificationsRepository from "../notifications/notifications.repository.js";

export const createTask = async (
  input: unknown,
  projectId: string,
  workspaceId: string,
  userId: string,
) => {
  const data = createTaskSchema.parse(input);

  /*
   * Validate the assignee before opening the transaction.
   *
   * A task can only be assigned to someone who belongs
   * to the same workspace.
   */
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

  const client = await pool.connect();

  try {
    /*
     * Start transaction.
     */
    await client.query("BEGIN");

    /*
     * 1. Create the task.
     */
    const task =
      await tasksRepository.createTaskTx(
        client,
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

    /*
     * 2. Create notification if the task
     *    was assigned to someone.
     *
     * This uses createNotificationTx()
     * so it is part of the SAME transaction.
     */
    if (data.assignedTo) {
      await notificationsRepository.createNotificationTx(
        client,
        data.assignedTo,
        "TASK_ASSIGNED",
        "You were assigned a task",
        `You were assigned "${task.title}"`,
        "TASK",
        task.id,
      );
    }

    /*
     * 3. Create activity log.
     *
     * This also uses the SAME transaction.
     */
    await activityRepository.createActivityTx(
      client,
      {
        workspaceId,
        actorId: userId,
        entityType: "TASK",
        entityId: task.id,
        action: "TASK_CREATED",
        metadata: {
          title: task.title,
        },
      },
    );

    /*
     * Everything succeeded.
     * Permanently save all changes.
     */
    await client.query("COMMIT");

    return task;
  } catch (error) {
    /*
     * Something failed.
     * Undo EVERYTHING done inside this transaction.
     */
    await client.query("ROLLBACK");

    throw error;
  } finally {
    /*
     * Return the database connection to the pool.
     */
    client.release();
  }
};

export const getTask = async (
  taskId: string,
) => {
  const task =
    await tasksRepository.findTaskById(taskId);

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

  const offset =
    (data.page - 1) * data.limit;

  const [tasks, total] =
    await Promise.all([
      tasksRepository.listTasks(
        projectId,
        {
          offset,
          limit: data.limit,
          status: data.status,
          priority: data.priority,
          assignedTo: data.assignedTo,
          search: data.search,
          sortBy: data.sortBy,
          order: data.order,
        },
      ),

      tasksRepository.countTasks(
        projectId,
      ),
    ]);

  return {
    items: tasks,

    pagination: {
      page: data.page,
      limit: data.limit,
      total,
      totalPages:
        Math.ceil(
          total / data.limit,
        ),
    },
  };
};

export const updateTask = async (
  taskId: string,
  input: unknown,
  workspaceId: string,
  userId: string,
) => {
  const data =
    updateTaskSchema.parse(input);

  /*
   * First find the existing task.
   * We need its current values because PATCH
   * only changes fields that were supplied.
   */
  const existing =
    await tasksRepository.findTaskById(
      taskId,
    );

  if (!existing) {
    throw new AppError(
      "Task not found",
      404,
      "TASK_NOT_FOUND",
    );
  }

  /*
   * If the request is assigning the task
   * to a user, make sure that user belongs
   * to the workspace.
   */
  if (
    data.assignedTo !== undefined &&
    data.assignedTo !== null
  ) {
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

  /*
   * Determine the final assignee.
   *
   * undefined = don't change it
   * null      = remove assignment
   * user ID   = assign to that user
   */
  const nextAssignedTo =
    data.assignedTo === undefined
      ? existing.assigned_to
      : data.assignedTo;

  const client =
    await pool.connect();

  try {
    /*
     * Start transaction.
     */
    await client.query("BEGIN");

    /*
     * 1. Update task.
     */
    const updated =
      await tasksRepository.updateTaskTx(
        client,
        taskId,
        {
          title:
            data.title ??
            existing.title,

          description:
            data.description ===
            undefined
              ? existing.description
              : data.description,

          status:
            data.status ??
            existing.status,

          priority:
            data.priority ??
            existing.priority,

          assignedTo:
            nextAssignedTo,

          dueDate:
            data.dueDate ===
            undefined
              ? existing.due_date
              : data.dueDate
                ? new Date(
                    data.dueDate,
                  )
                : null,
        },
      );

    if (!updated) {
      throw new AppError(
        "Task could not be updated",
        500,
        "TASK_UPDATE_FAILED",
      );
    }

    /*
     * Check whether the assignee actually changed.
     */
    const assignmentChanged =
      existing.assigned_to !==
      updated.assigned_to;

    /*
     * 2. If a NEW user was assigned,
     *    create a notification.
     */
    if (
      assignmentChanged &&
      updated.assigned_to
    ) {
      await notificationsRepository.createNotificationTx(
        client,
        updated.assigned_to,
        "TASK_ASSIGNED",
        "You were assigned a task",
        `You were assigned "${updated.title}"`,
        "TASK",
        updated.id,
      );
    }

    /*
     * 3. Record the update in activity logs.
     */
    await activityRepository.createActivityTx(
      client,
      {
        workspaceId,
        actorId: userId,
        entityType: "TASK",
        entityId: taskId,
        action: "TASK_UPDATED",
        metadata: {
          oldStatus: existing.status,
          newStatus: updated.status,

          oldPriority:
            existing.priority,
          newPriority:
            updated.priority,

          oldAssignedTo:
            existing.assigned_to,
          newAssignedTo:
            updated.assigned_to,
        },
      },
    );

    /*
     * Everything succeeded.
     */
    await client.query("COMMIT");

    return updated;
  } catch (error) {
    /*
     * Undo the task update,
     * notification and activity log.
     */
    await client.query("ROLLBACK");

    throw error;
  } finally {
    /*
     * Return connection to pool.
     */
    client.release();
  }
};