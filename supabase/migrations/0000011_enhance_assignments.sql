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
        AND NOT (COALESCE(g.id::text, w.id::text) = ANY(h.path)) -- Prevent cycles
)
SELECT DISTINCT ON (user_id, assignable_type, assignable_id)
    user_id,
    assignable_type,
    assignable_id,
    role,
    level
FROM hierarchy
ORDER BY user_id, assignable_type, assignable_id, level;

-- Create indexes on materialized view
CREATE UNIQUE INDEX idx_effective_access_lookup 
ON auth.effective_access(user_id, assignable_type, assignable_id);

CREATE INDEX idx_effective_access_user 
ON auth.effective_access(user_id);

CREATE INDEX idx_effective_access_role 
ON auth.effective_access(role);

-- Function to check access
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

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION auth.refresh_effective_access()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY auth.effective_access;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-refresh trigger
CREATE TRIGGER refresh_effective_access
    AFTER INSERT OR UPDATE OR DELETE ON team_assignments
    FOR EACH STATEMENT
    EXECUTE FUNCTION auth.refresh_effective_access();

-- Add audit logging for team assignments
CREATE TRIGGER log_team_assignment_changes
    AFTER INSERT OR UPDATE OR DELETE ON team_assignments
    FOR EACH ROW
    EXECUTE FUNCTION audit.log_action();

-- Enhanced team assignment policies using materialized view
DROP POLICY IF EXISTS "Team assignment visibility" ON team_assignments;
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

DROP POLICY IF EXISTS "Team assignment management" ON team_assignments;
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

-- Function to get all user permissions
CREATE OR REPLACE FUNCTION auth.get_user_permissions(user_uuid UUID)
RETURNS TABLE (
    assignable_type TEXT,
    assignable_id UUID,
    role TEXT,
    inherited_from JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE inheritance AS (
        SELECT 
            ea.assignable_type,
            ea.assignable_id,
            ea.role,
            ea.level,
            jsonb_build_object(
                'type', ea.assignable_type,
                'id', ea.assignable_id,
                'role', ea.role
            ) as source
        FROM auth.effective_access ea
        WHERE ea.user_id = user_uuid
    )
    SELECT 
        i.assignable_type,
        i.assignable_id,
        i.role,
        CASE 
            WHEN i.level > 1 THEN 
                jsonb_build_array(i.source)
            ELSE NULL
        END as inherited_from
    FROM inheritance i;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON MATERIALIZED VIEW auth.effective_access IS 
'Stores computed team access permissions including inherited access through organization/workspace hierarchy';

COMMENT ON FUNCTION auth.has_team_access IS 
'Checks if the current user has specific access to a target resource';

COMMENT ON FUNCTION auth.get_user_permissions IS 
'Returns all permissions for a user including inheritance information';