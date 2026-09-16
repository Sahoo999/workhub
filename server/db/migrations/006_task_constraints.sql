ALTER TABLE tasks
ADD CONSTRAINT task_status_check CHECK (
    status IN (
        'TODO',
        'IN_PROGRESS',
        'IN_REVIEW',
        'DONE'
    )
);

ALTER TABLE tasks
ADD CONSTRAINT task_priority_check CHECK (
    priority IN (
        'LOW',
        'MEDIUM',
        'HIGH',
        'URGENT'
    )
);

# speeds up queries that look up tasks inside a specific project
CREATE INDEX idx_tasks_project_id ON tasks (project_id);

# speeds up queries that look up work assigned to a specific user
CREATE INDEX idx_tasks_assigned_to ON tasks (assigned_to);

# optimizes queries that filter tasks by their current state
CREATE INDEX idx_tasks_status ON tasks (status);