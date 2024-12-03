 -- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    status task_status NOT NULL DEFAULT 'todo',
    priority task_priority NOT NULL DEFAULT 'medium',
    deadline TIMESTAMPTZ,
    estimated_hours FLOAT,
    actual_hours FLOAT,
    assignees UUID[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    order_index FLOAT,
    recurring_config JSONB DEFAULT NULL,
    time_tracking JSONB DEFAULT '{}',
    visibility TEXT NOT NULL DEFAULT 'team' 
        CHECK (visibility IN ('public', 'private', 'team', 'organization')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_title CHECK (char_length(title) >= 2),
    CONSTRAINT valid_hours CHECK (estimated_hours >= 0 AND actual_hours >= 0)
);

-- Subtasks table
CREATE TABLE subtasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Task templates table
CREATE TABLE task_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    estimated_time FLOAT,
    priority task_priority NOT NULL DEFAULT 'medium',
    checklist JSONB DEFAULT '[]',
    category TEXT,
    labels TEXT[] DEFAULT '{}',
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Checklist items table
CREATE TABLE checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_title ON tasks USING gin (title gin_trgm_ops);
CREATE INDEX idx_tasks_goal ON tasks(goal_id);
CREATE INDEX idx_tasks_milestone ON tasks(milestone_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_tasks_fts ON tasks USING gin (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
);
CREATE INDEX idx_tasks_goal_status_priority ON tasks(goal_id, status, priority);
CREATE INDEX idx_pending_tasks ON tasks(goal_id) WHERE status IN ('todo', 'in_progress');

CREATE INDEX idx_subtasks_task ON subtasks(task_id);
CREATE INDEX idx_subtasks_completion ON subtasks(task_id, completed);

CREATE INDEX idx_task_templates_workspace ON task_templates(workspace_id);
CREATE INDEX idx_checklist_items_task ON checklist_items(task_id);

-- Triggers
CREATE TRIGGER handle_updated_at_tasks
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE PROCEDURE moddatetime(updated_at);

CREATE TRIGGER handle_updated_at_subtasks
    BEFORE UPDATE ON subtasks
    FOR EACH ROW
    EXECUTE PROCEDURE moddatetime(updated_at);

CREATE TRIGGER handle_updated_at_task_templates
    BEFORE UPDATE ON task_templates
    FOR EACH ROW
    EXECUTE PROCEDURE moddatetime(updated_at);

-- Update goal progress on task changes
CREATE TRIGGER update_goal_progress
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_goal_on_task_change();

-- RLS Policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

-- Task Policies
CREATE POLICY "Task visibility based on goal access"
    ON tasks FOR SELECT
    USING (auth.has_team_access('goal', goal_id));

CREATE POLICY "Task management based on role"
    ON tasks FOR ALL
    USING (
        auth.has_team_access('task', id, ARRAY['owner', 'admin'])
        OR auth.has_team_access('goal', goal_id, ARRAY['owner', 'admin'])
    );

-- Subtask Policies
CREATE POLICY "Subtask visibility"
    ON subtasks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tasks t
            WHERE t.id = subtasks.task_id
            AND auth.has_team_access('goal', t.goal_id)
        )
    );

CREATE POLICY "Subtask management"
    ON subtasks FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM tasks t
            WHERE t.id = subtasks.task_id
            AND (
                auth.has_team_access('task', t.id, ARRAY['owner', 'admin'])
                OR auth.has_team_access('goal', t.goal_id, ARRAY['owner', 'admin'])
            )
        )
    );

-- Template Policies
CREATE POLICY "Template visibility"
    ON task_templates FOR SELECT
    USING (auth.has_team_access('workspace', workspace_id));

CREATE POLICY "Template management"
    ON task_templates FOR ALL
    USING (auth.has_team_access('workspace', workspace_id, ARRAY['owner', 'admin']));

-- Checklist Policies
CREATE POLICY "Checklist visibility"
    ON checklist_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tasks t
            WHERE t.id = checklist_items.task_id
            AND auth.has_team_access('goal', t.goal_id)
        )
    );

CREATE POLICY "Checklist management"
    ON checklist_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM tasks t
            WHERE t.id = checklist_items.task_id
            AND (
                auth.has_team_access('task', t.id)
                OR auth.has_team_access('goal', t.goal_id, ARRAY['owner', 'admin'])
            )
        )
    );