 -- Team assignments table
CREATE TABLE team_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assignable_type TEXT NOT NULL,
    assignable_id UUID NOT NULL,
    role team_role NOT NULL DEFAULT 'member',
    valid_period TSTZRANGE DEFAULT tstzrange(now(), NULL) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by UUID REFERENCES auth.users(id),
    assignment_notes TEXT,
    notifications_settings JSONB DEFAULT '{}',
    CONSTRAINT valid_assignable_type CHECK (
        assignable_type IN (
            'organization',
            'workspace',
            'goal',
            'task',
            'milestone',
            'resource'
        )
    )
);

-- Create materialized view for effective access
CREATE MATERIALIZED VIEW auth.effective_access AS
WITH RECURSIVE hierarchy AS (
    -- Direct assignments
    SELECT 
        ta.user_id,
        ta.assignable_type,
        ta.assignable_id,
        ta.role,
        1 as level,
        ARRAY[ta.assignable_type || ':' || ta.assignable_id] as path
    FROM team_assignments ta
    WHERE upper(ta.valid_period) IS NULL OR upper(ta.valid_period) > NOW()

    UNION

    -- Inherited assignments
    SELECT 
        h.user_id,
        CASE 
            WHEN g.id IS NOT NULL THEN 'goal'
            WHEN w.id IS NOT NULL THEN 'workspace'
            ELSE NULL
        END as assignable_type,
        COALESCE(g.id, w.id) as assignable_id,
        h.role,
        h.level + 1,
        h.path || COALESCE(g.id::text, w.id::text)
    FROM hierarchy h
    LEFT JOIN goals g ON 
        h.assignable_type = 'workspace' AND g.workspace_id = h.assignable_id
    LEFT JOIN workspaces w ON 
        h.assignable_type = 'organization' AND w.organization_id = h.assignable_id
    WHERE COALESCE(g.id, w.id) IS NOT NULL
        AND NOT (COALESCE(g.id::text, w.id::text) = ANY(h.path))
)
SELECT DISTINCT ON (user_id, assignable_type, assignable_id)
    user_id,
    assignable_type,
    assignable_id,
    role,
    level
FROM hierarchy
ORDER BY user_id, assignable_type, assignable_id, level;

-- Function to check team access
CREATE OR REPLACE FUNCTION auth.has_team_access(
    target_type TEXT,
    target_id UUID,
    required_roles TEXT[] DEFAULT ARRAY['owner', 'admin', 'member']::text[]
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM auth.effective_access ea
        WHERE ea.user_id = auth.uid()
        AND ea.assignable_type = target_type
        AND ea.assignable_id = target_id
        AND ea.role = ANY(required_roles)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes
CREATE INDEX idx_team_assignments_user ON team_assignments(user_id);
CREATE INDEX idx_team_assignments_assignable ON team_assignments(assignable_type, assignable_id);
CREATE INDEX idx_team_assignments_role ON team_assignments(role);
CREATE INDEX idx_team_assignments_period ON team_assignments USING gist (valid_period);
CREATE INDEX idx_team_assignments_active ON team_assignments(user_id, assignable_type, assignable_id) 
    WHERE upper(valid_period) IS NULL OR upper(valid_period) > NOW();
CREATE INDEX idx_team_assignments_lookup 
    ON team_assignments(user_id, assignable_type, assignable_id);

-- Create indexes on materialized view
CREATE UNIQUE INDEX idx_effective_access_lookup 
    ON auth.effective_access(user_id, assignable_type, assignable_id);
CREATE INDEX idx_effective_access_user 
    ON auth.effective_access(user_id);
CREATE INDEX idx_effective_access_role 
    ON auth.effective_access(role);

-- Triggers
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON team_assignments
    FOR EACH ROW
    EXECUTE PROCEDURE moddatetime(updated_at);

-- Auto-refresh trigger for materialized view
CREATE TRIGGER refresh_effective_access
    AFTER INSERT OR UPDATE OR DELETE ON team_assignments
    FOR EACH STATEMENT
    EXECUTE FUNCTION auth.refresh_effective_access();

-- RLS Policies
ALTER TABLE team_assignments ENABLE ROW LEVEL SECURITY;

-- Team Assignment Policies
CREATE POLICY "Team assignment visibility"
    ON team_assignments FOR SELECT
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM auth.effective_access ea
            WHERE ea.user_id = auth.uid()
            AND ea.assignable_id = team_assignments.assignable_id
            AND ea.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Team assignment management"
    ON team_assignments FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.effective_access ea
            WHERE ea.user_id = auth.uid()
            AND ea.assignable_id = team_assignments.assignable_id
            AND ea.role IN ('owner', 'admin')
        )
    );