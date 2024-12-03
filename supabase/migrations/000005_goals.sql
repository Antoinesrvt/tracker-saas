 -- Goal configuration table
CREATE TABLE goal_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visualization_settings JSONB NOT NULL DEFAULT '{}',
    notification_rules JSONB NOT NULL DEFAULT '{}',
    permission_matrix JSONB NOT NULL DEFAULT '{}',
    custom_fields JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Goals table
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    parent_goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
    type goal_type NOT NULL,
    level INTEGER NOT NULL DEFAULT 0,
    status goal_status NOT NULL DEFAULT 'draft',
    priority task_priority DEFAULT 'medium',
    progress FLOAT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    config_id UUID NOT NULL REFERENCES goal_configs(id) ON DELETE CASCADE,
    position_x FLOAT NOT NULL DEFAULT 0,
    position_y FLOAT NOT NULL DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    health_status TEXT CHECK (health_status IN ('on_track', 'at_risk', 'blocked')),
    last_reviewed_at TIMESTAMPTZ,
    review_frequency INTERVAL,
    visibility TEXT NOT NULL DEFAULT 'team' 
        CHECK (visibility IN ('public', 'private', 'team', 'organization')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_dates CHECK (start_date <= end_date),
    CONSTRAINT valid_title CHECK (char_length(title) >= 2)
);

-- Goal connections table
CREATE TABLE goal_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    target_goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    strength connection_strength DEFAULT 'medium',
    description TEXT,
    status connection_status DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT different_goals CHECK (source_goal_id != target_goal_id)
);

-- Indexes
CREATE INDEX idx_goals_title ON goals USING gin (title gin_trgm_ops);
CREATE INDEX idx_goals_workspace ON goals(workspace_id);
CREATE INDEX idx_goals_parent ON goals(parent_goal_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_type ON goals(type);
CREATE INDEX idx_goals_dates ON goals(start_date, end_date);
CREATE INDEX idx_goals_progress ON goals(progress);
CREATE INDEX idx_goals_fts ON goals USING gin (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
);
CREATE INDEX idx_goals_workspace_status ON goals(workspace_id, status);
CREATE INDEX idx_active_goals ON goals(workspace_id) WHERE status = 'active';

CREATE INDEX idx_goal_connections_source ON goal_connections(source_goal_id);
CREATE INDEX idx_goal_connections_target ON goal_connections(target_goal_id);

-- Triggers
CREATE TRIGGER handle_updated_at_goals
    BEFORE UPDATE ON goals
    FOR EACH ROW
    EXECUTE PROCEDURE moddatetime(updated_at);

CREATE TRIGGER handle_updated_at_goal_configs
    BEFORE UPDATE ON goal_configs
    FOR EACH ROW
    EXECUTE PROCEDURE moddatetime(updated_at);

-- Validation trigger
CREATE TRIGGER validate_goal_dates_trigger
    BEFORE INSERT OR UPDATE ON goals
    FOR EACH ROW
    EXECUTE FUNCTION validate_goal_dates();

-- Auto-assign creator as owner
CREATE TRIGGER handle_goal_creation
    AFTER INSERT ON goals
    FOR EACH ROW
    EXECUTE FUNCTION auth.handle_object_creation('goal');

-- RLS Policies
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_configs ENABLE ROW LEVEL SECURITY;

-- Goal Policies
CREATE POLICY "Goal visibility based on workspace membership"
    ON goals FOR SELECT
    USING (
        auth.has_team_access('goal', id)
        OR auth.has_team_access('workspace', workspace_id)
    );

CREATE POLICY "Goal management based on role"
    ON goals FOR ALL
    USING (
        auth.has_team_access('goal', id, ARRAY['owner', 'admin'])
        OR auth.has_team_access('workspace', workspace_id, ARRAY['owner', 'admin'])
    );

-- Goal Connection Policies
CREATE POLICY "Goal connection visibility"
    ON goal_connections FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM goals g
            JOIN team_assignments ta ON 
                ta.assignable_type = 'goal' 
                AND ta.assignable_id = g.id
            WHERE ta.user_id = auth.uid()
            AND g.id IN (source_goal_id, target_goal_id)
        )
    );

CREATE POLICY "Goal connection management"
    ON goal_connections FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM goals g
            JOIN team_assignments ta ON 
                ta.assignable_type = 'goal' 
                AND ta.assignable_id = g.id
            WHERE ta.user_id = auth.uid()
            AND ta.role IN ('owner', 'admin')
            AND g.id IN (source_goal_id, target_goal_id)
        )
    );

-- Goal Config Policies
CREATE POLICY "Goal config access"
    ON goal_configs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM goals g
            WHERE g.config_id = goal_configs.id
            AND auth.has_team_access('goal', g.id, ARRAY['owner', 'admin'])
        )
    );