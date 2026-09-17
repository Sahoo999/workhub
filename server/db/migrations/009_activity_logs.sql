
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    workspace_id UUID NOT NULL
        REFERENCES workspaces(id)
        ON DELETE CASCADE,

    actor_id UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    entity_type VARCHAR(50) NOT NULL,

    entity_id UUID NOT NULL,

    action VARCHAR(100) NOT NULL,

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_workspace_created ON activity_logs (workspace_id, created_at DESC);

CREATE INDEX idx_activity_logs_entity ON activity_logs (entity_type, entity_id);

CREATE INDEX idx_activity_logs_actor ON activity_logs (actor_id);