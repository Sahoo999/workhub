CREATE TABLE labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, name)
);

CREATE TABLE task_labels (
    task_id UUID NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
    label_id UUID NOT NULL REFERENCES labels (id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, label_id)
);

CREATE INDEX idx_labels_workspace_id ON labels (workspace_id);

CREATE INDEX idx_task_labels_label_id ON task_labels (label_id);