import { api } from "@/lib/api";

import type {
  Task,
  TaskListResponse,
  TaskPriority,
  TaskStatus,
} from "./task.types";

export interface GetTasksParams {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  search?: string;
  sortBy?: "created_at" | "due_date" | "priority";
  order?: "asc" | "desc";
}

export const getTasks = async (
  accessToken: string,
  projectId: string,
  params: GetTasksParams = {},
): Promise<TaskListResponse> => {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set(
      "page",
      String(params.page),
    );
  }

  if (params.limit !== undefined) {
    searchParams.set(
      "limit",
      String(params.limit),
    );
  }

  if (params.status) {
    searchParams.set(
      "status",
      params.status,
    );
  }

  if (params.priority) {
    searchParams.set(
      "priority",
      params.priority,
    );
  }

  if (params.assignedTo) {
    searchParams.set(
      "assignedTo",
      params.assignedTo,
    );
  }

  if (params.search) {
    searchParams.set(
      "search",
      params.search,
    );
  }

  if (params.sortBy) {
    searchParams.set(
      "sortBy",
      params.sortBy,
    );
  }

  if (params.order) {
    searchParams.set(
      "order",
      params.order,
    );
  }

  const query =
    searchParams.toString();

  const path =
    `/projects/${projectId}/tasks${
      query ? `?${query}` : ""
    }`;

  const response =
    await api.get<TaskListResponse>(
      path,
      accessToken,
    );

  return response.data;
};

export const createTask = async (
  accessToken: string,
  projectId: string,
  data: {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignedTo?: string;
    dueDate?: string;
  },
): Promise<Task> => {
  const response =
    await api.post<Task>(
      `/projects/${projectId}/tasks`,
      data,
      accessToken,
    );

  return response.data;
};

export const updateTask = async (
  accessToken: string,
  taskId: string,
  data: Partial<{
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignedTo: string;
    dueDate: string;
  }>,
): Promise<Task> => {
  const response =
    await api.patch<Task>(
      `/tasks/${taskId}`,
      data,
      accessToken,
    );

  return response.data;
};

export const getTask = async (
  accessToken: string,
  taskId: string,
): Promise<Task> => {
  const response =
    await api.get<Task>(
      `/tasks/${taskId}`,
      accessToken,
    );

  return response.data;
};