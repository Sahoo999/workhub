import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { pool } from "../../db/client.js";

import * as tasksRepository from "./tasks.repository.js";
import * as activityRepository from "../activity/activity.repository.js";
import * as notificationsRepository from "../notifications/notifications.repository.js";
import * as workspaceRepository from "../workspaces/workspaces.repository.js";

import { createTask } from "./tasks.service.js";

vi.mock("../../db/client.js", () => ({
  pool: {
    connect: vi.fn(),
  },
}));

vi.mock("./tasks.repository.js", () => ({
  createTaskTx: vi.fn(),
  findTaskById: vi.fn(),
  listTasks: vi.fn(),
  countTasks: vi.fn(),
  updateTask: vi.fn(),
  updateTaskTx: vi.fn(),
}));

vi.mock("../activity/activity.repository.js", () => ({
  createActivityTx: vi.fn(),
  createActivity: vi.fn(),
  listEntityActivity: vi.fn(),
}));

vi.mock("../notifications/notifications.repository.js", () => ({
  createNotificationTx: vi.fn(),
  createNotification: vi.fn(),
  listNotifications: vi.fn(),
  markAsRead: vi.fn(),
}));

vi.mock("../workspaces/workspaces.repository.js", () => ({
  findMembership: vi.fn(),
}));

describe("tasks.service", () => {
  const workspaceId =
    "11111111-1111-4111-8111-111111111111";

  const projectId =
    "22222222-2222-4222-8222-222222222222";

  const userId =
    "33333333-3333-4333-8333-333333333333";

  const assigneeId =
    "44444444-4444-4444-8444-444444444444";

  const taskId =
    "55555555-5555-4555-8555-555555555555";

  const client = {
    query: vi.fn(),
    release: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(pool.connect).mockResolvedValue(
      client as never,
    );

    client.query.mockResolvedValue({});

    vi.mocked(
      workspaceRepository.findMembership,
    ).mockResolvedValue({
      user_id: assigneeId,
      role: "MEMBER",
    } as never);

    vi.mocked(
      tasksRepository.createTaskTx,
    ).mockResolvedValue({
      id: taskId,
      project_id: projectId,
      title: "Build login API",
      description: null,
      status: "TODO",
      priority: "MEDIUM",
      assigned_to: assigneeId,
      created_by: userId,
      due_date: null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    vi.mocked(
      notificationsRepository.createNotificationTx,
    ).mockResolvedValue({
      id: "66666666-6666-4666-8666-666666666666",
      user_id: assigneeId,
      type: "TASK_ASSIGNED",
      title: "You were assigned a task",
      message: 'You were assigned "Build login API"',
      entity_type: "TASK",
      entity_id: taskId,
      read_at: null,
      created_at: new Date(),
    });

    vi.mocked(
      activityRepository.createActivityTx,
    ).mockResolvedValue();
  });

  it("commits the transaction when task creation succeeds", async () => {
    const result = await createTask(
      {
        title: "Build login API",
        status: "TODO",
        priority: "MEDIUM",
        assignedTo: assigneeId,
      },
      projectId,
      workspaceId,
      userId,
    );

    expect(result.id).toBe(taskId);

    expect(client.query).toHaveBeenNthCalledWith(
      1,
      "BEGIN",
    );

    expect(
      tasksRepository.createTaskTx,
    ).toHaveBeenCalled();

    expect(
      notificationsRepository.createNotificationTx,
    ).toHaveBeenCalled();

    expect(
      activityRepository.createActivityTx,
    ).toHaveBeenCalled();

    expect(client.query).toHaveBeenLastCalledWith(
      "COMMIT",
    );

    expect(client.release).toHaveBeenCalledTimes(1);
  });

  it("rolls back when activity logging fails", async () => {
    vi.mocked(
      activityRepository.createActivityTx,
    ).mockRejectedValue(
      new Error("Activity insert failed"),
    );

    await expect(
      createTask(
        {
          title: "Build login API",
          status: "TODO",
          priority: "MEDIUM",
          assignedTo: assigneeId,
        },
        projectId,
        workspaceId,
        userId,
      ),
    ).rejects.toThrow(
      "Activity insert failed",
    );

    expect(client.query).toHaveBeenNthCalledWith(
      1,
      "BEGIN",
    );

    expect(client.query).toHaveBeenLastCalledWith(
      "ROLLBACK",
    );

    expect(
      client.query,
    ).not.toHaveBeenCalledWith(
      "COMMIT",
    );

    expect(client.release).toHaveBeenCalledTimes(1);
  });
});