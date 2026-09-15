ALTER TABLE workspace_members
ADD CONSTRAINT workspace_member_role_check CHECK (
    role IN (
        'OWNER',
        'ADMIN',
        'MEMBER',
        'VIEWER'
    )
);