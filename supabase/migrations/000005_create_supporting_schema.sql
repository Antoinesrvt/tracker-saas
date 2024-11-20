-- Milestones
create TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status goal_status NOT NULL DEFAULT 'draft',
  start_date TIMESTAMPTZ,
  target_date TIMESTAMPTZ,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  is_critical BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_title CHECK (char_length(title) >= 2)
);


-- Tasks and related tables
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
    budget DECIMAL,
    actual_cost DECIMAL,
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_title CHECK (char_length(title) >= 2),
    CONSTRAINT valid_hours CHECK (estimated_hours >= 0 AND actual_hours >= 0),
    CONSTRAINT valid_costs CHECK (budget >= 0 AND actual_cost >= 0)
);

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

CREATE TABLE subtasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Resources and attachments
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    type resource_type NOT NULL,
    location TEXT,
    metadata JSONB DEFAULT '{}',
    creator_id UUID NOT NULL REFERENCES auth.users(id),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_title CHECK (char_length(title) >= 2)
);

CREATE TABLE resource_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    attached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_target_type CHECK (target_type IN ('goal', 'milestone', 'task'))
);

-- Updates and comments
CREATE TABLE updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_id UUID NOT NULL,
    type update_type NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    creator_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    mentions TEXT[] DEFAULT '{}',
    CONSTRAINT valid_mentions CHECK (array_length(mentions, 1) IS NULL OR array_length(mentions, 1) <= 50)
);

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES auth.users(id),
    update_id UUID NOT NULL REFERENCES updates(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    edited_at TIMESTAMPTZ,
    mentions JSONB DEFAULT '[]',
    reactions JSONB DEFAULT '[]'
);

-- Metrics and KPIs

CREATE TABLE metric_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    calculation_rules JSONB NOT NULL DEFAULT '{}',
    thresholds JSONB NOT NULL DEFAULT '{}',
    required_datapoints TEXT[] DEFAULT '{}',
    refresh_rate INTERVAL NOT NULL DEFAULT '1 day'::INTERVAL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_id UUID NOT NULL,
    config_id UUID NOT NULL REFERENCES metric_configs(id) ON DELETE CASCADE,
    current_values JSONB NOT NULL DEFAULT '{}',
    historical_values JSONB NOT NULL DEFAULT '{}',
    last_calculated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);



CREATE TABLE kpis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    value DECIMAL NOT NULL,
    target DECIMAL NOT NULL,
    unit TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('percentage', 'number', 'currency', 'time')),
    color TEXT,
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add moddatetime triggers
CREATE TRIGGER handle_updated_at_tasks
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE PROCEDURE moddatetime(updated_at);

CREATE TRIGGER handle_updated_at_task_templates
    BEFORE UPDATE ON task_templates
    FOR EACH ROW
    EXECUTE PROCEDURE moddatetime(updated_at);

CREATE TRIGGER handle_updated_at_subtasks
    BEFORE UPDATE ON subtasks
    FOR EACH ROW
    EXECUTE PROCEDURE moddatetime(updated_at);

CREATE TRIGGER handle_updated_at_resources
    BEFORE UPDATE ON resources
    FOR EACH ROW
    EXECUTE PROCEDURE moddatetime(updated_at);

CREATE TRIGGER handle_updated_at_kpis
    BEFORE UPDATE ON kpis
    FOR EACH ROW
    EXECUTE PROCEDURE moddatetime(updated_at); 