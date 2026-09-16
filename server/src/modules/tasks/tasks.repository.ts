import { pool } from "../../db/client.js";

export interface TaskRecord {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assigned_to: string | null;
  created_by: string;
  due_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

export const createTask = async (
  projectId: string,
  userId: string,
  data: {
    title: string;
    description: string | null;
    status: string;
    priority: string;
    assignedTo: string | null;
    dueDate: Date | null;
  },
): Promise<TaskRecord | undefined> => {
  const { rows } = await pool.query<TaskRecord>(
    `
      INSERT INTO tasks (
        project_id,
        title,
        description,
        status,
        priority,
        assigned_to,
        created_by,
        due_date
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
    `,
    [
      projectId,
      data.title,
      data.description,
      data.status,
      data.priority,
      data.assignedTo,
      userId,
      data.dueDate,
    ],
  );

    return rows[0] ?? undefined;
};

export const findTaskById = async (
  taskId: string,
): Promise<TaskRecord | null> => {
  const { rows } = await pool.query<TaskRecord>(
    `
      SELECT *
      FROM tasks
      WHERE id = $1
      LIMIT 1
    `,
    [taskId],
  );

  return rows[0] ?? null;
};

export const listTasks = async (
  projectId: string,
  // New fixed signature in tasks.repository.ts
options: {
  offset: number;
  limit: number;
  status?: string | undefined;
  priority?: string | undefined;
  assignedTo?: string | undefined;
  search?: string | undefined;
  sortBy: string;
  order: "asc" | "desc";
}
,
): Promise<TaskRecord[]> => {
  const values: unknown[] = [projectId];

  let parameterIndex = 2;

  let query = `
    SELECT *
    FROM tasks
    WHERE project_id = $1
  `;

  if (options.status) {
    query += ` AND status = $${parameterIndex}`;
    values.push(options.status);
    parameterIndex++;
  }

  if (options.priority) {
    query += ` AND priority = $${parameterIndex}`;
    values.push(options.priority);
    parameterIndex++;
  }

  if (options.assignedTo) {
    query += ` AND assigned_to = $${parameterIndex}`;
    values.push(options.assignedTo);
    parameterIndex++;
  }

  if (options.search) {
    query += ` AND title ILIKE $${parameterIndex}`;
    values.push(`%${options.search}%`);
    parameterIndex++;
  }

  const allowedSortColumns = {
    created_at: "created_at",
    due_date: "due_date",
    priority: "priority",
  } as const;

  const sortColumn =
    allowedSortColumns[
      options.sortBy as keyof typeof allowedSortColumns
    ];

  query += ` ORDER BY ${sortColumn} ${options.order.toUpperCase()}`;
  query += ` LIMIT $${parameterIndex}`;
  values.push(options.limit);
  parameterIndex++;

  query += ` OFFSET $${parameterIndex}`;
  values.push(options.offset);

  const { rows } = await pool.query<TaskRecord>(
    query,
    values,
  );

  return rows;
};

export const countTasks = async (
  projectId: string,
): Promise<number> => {
  const { rows } = await pool.query<{ count: string }>(
    `
      SELECT COUNT(*)::text AS count
      FROM tasks
      WHERE project_id = $1
    `,
    [projectId],
  );

  return Number(rows[0]?.count);
};

export const updateTask = async (
  taskId: string,
  data: {
    title: string;
    description: string | null;
    status: string;
    priority: string;
    assignedTo: string | null;
    dueDate: Date | null;
  },
): Promise<TaskRecord | null> => {
  const { rows } = await pool.query<TaskRecord>(
    `
      UPDATE tasks
      SET
        title = $1,
        description = $2,
        status = $3,
        priority = $4,
        assigned_to = $5,
        due_date = $6,
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `,
    [
      data.title,
      data.description,
      data.status,
      data.priority,
      data.assignedTo,
      data.dueDate,
      taskId,
    ],
  );

  return rows[0] ?? null;
};