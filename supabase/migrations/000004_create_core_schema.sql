-- Create core tables
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    subscription_plan TEXT NOT NULL DEFAULT 'free',
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    settings JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT valid_name CHECK (char_length(name) >= 2)
);

CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    settings JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_name CHECK (char_length(name) >= 2)
);

CREATE TABLE team_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assignable_type TEXT NOT NULL,
    assignable_id UUID NOT NULL,
    role team_role NOT NULL DEFAULT 'member',
    valid_period TSTZRANGE DEFAULT tstzrange(now(), NULL) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_assignable_type CHECK (
        assignable_type IN (
            'organization',
            'workspace',
            'goal',
            'task'
        )
    )
);

CREATE TABLE goal_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visualization_settings JSONB NOT NULL DEFAULT '{}',
    notification_rules JSONB NOT NULL DEFAULT '{}',
    permission_matrix JSONB NOT NULL DEFAULT '{}',
    custom_fields JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    parent_goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
    connections JSONB NOT NULL DEFAULT '[]',
    type goal_type NOT NULL,
    level INTEGER NOT NULL DEFAULT 0,
    status goal_status NOT NULL DEFAULT 'draft',
    progress FLOAT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    config_id UUID NOT NULL REFERENCES goal_configs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_dates CHECK (start_date <= end_date),
    CONSTRAINT valid_title CHECK (char_length(title) >= 2)
);

ALTER TABLE goals
ADD COLUMN position_x FLOAT NOT NULL DEFAULT 0,
ADD COLUMN position_y FLOAT NOT NULL DEFAULT 0;

-- Add moddatetime triggers
CREATE TRIGGER handle_updated_at_workspaces
    BEFORE UPDATE ON workspaces
    FOR EACH ROW
    EXECUTE PROCEDURE moddatetime(updated_at);

CREATE TRIGGER handle_updated_at_goal_configs
    BEFORE UPDATE ON goal_configs
    FOR EACH ROW
    EXECUTE PROCEDURE moddatetime(updated_at);

CREATE TRIGGER handle_updated_at_goals
    BEFORE UPDATE ON goals
    FOR EACH ROW
    EXECUTE PROCEDURE moddatetime(updated_at); 