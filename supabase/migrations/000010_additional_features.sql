-- Goal connections for visualization
CREATE TABLE goal_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    target_goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    type goal_type NOT NULL,
    strength TEXT CHECK (strength IN ('strong', 'weak', 'medium')),
    description TEXT,
    status TEXT CHECK (status IN ('active', 'blocked', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT different_goals CHECK (source_goal_id != target_goal_id)
);

-- KPI history tracking
CREATE TABLE kpi_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kpi_id UUID NOT NULL REFERENCES kpis(id) ON DELETE CASCADE,
    value DECIMAL NOT NULL,
    target DECIMAL NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Team notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    resource_type TEXT NOT NULL,
    resource_id UUID NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Goal templates
CREATE TABLE goal_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    type goal_type NOT NULL,
    default_config JSONB NOT NULL DEFAULT '{}',
    milestone_templates JSONB[] DEFAULT '{}',
    task_templates JSONB[] DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES auth.users(id),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_goal_connections_source ON goal_connections(source_goal_id);
CREATE INDEX idx_goal_connections_target ON goal_connections(target_goal_id);
CREATE INDEX idx_kpi_history_kpi ON kpi_history(kpi_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_resource ON notifications(resource_type, resource_id);
CREATE INDEX idx_goal_templates_org ON goal_templates(organization_id);

-- Add policies
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

CREATE POLICY "Notification access"
    ON notifications FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Goal template access"
    ON goal_templates FOR SELECT
    USING (
        organization_id IN (
            SELECT assignable_id FROM team_assignments
            WHERE user_id = auth.uid()
            AND assignable_type = 'organization'
        )
    ); 