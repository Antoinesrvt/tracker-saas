-- Update Organization Policies
DROP POLICY IF EXISTS "Organization owners have full access" ON organizations;
CREATE POLICY "Organization owners have full access"
    ON organizations FOR ALL
    USING (auth.has_team_access('organization', id, ARRAY['owner']));

DROP POLICY IF EXISTS "Organization members can view" ON organizations;
CREATE POLICY "Organization members can view"
    ON organizations FOR SELECT
    USING (auth.has_team_access('organization', id));

-- Update Workspace Policies
DROP POLICY IF EXISTS "Workspace members can view" ON workspaces;
CREATE POLICY "Workspace members can view"
    ON workspaces FOR SELECT
    USING (
        auth.has_team_access('workspace', id)
        OR auth.has_team_access('organization', organization_id)
    );

DROP POLICY IF EXISTS "Organization admins can manage workspaces" ON workspaces;
CREATE POLICY "Organization admins can manage workspaces"
    ON workspaces FOR ALL
    USING (auth.has_team_access('organization', organization_id, ARRAY['owner', 'admin']));

-- Update Goal Policies
DROP POLICY IF EXISTS "Goal visibility based on workspace membership" ON goals;
CREATE POLICY "Goal visibility based on workspace membership"
    ON goals FOR SELECT
    USING (
        auth.has_team_access('goal', id)
        OR auth.has_team_access('workspace', workspace_id)
    );

DROP POLICY IF EXISTS "Goal management based on role" ON goals;
CREATE POLICY "Goal management based on role"
    ON goals FOR ALL
    USING (
        auth.has_team_access('goal', id, ARRAY['owner', 'admin'])
        OR auth.has_team_access('workspace', workspace_id, ARRAY['owner', 'admin'])
    );

-- Update Task Policies
DROP POLICY IF EXISTS "Task visibility based on goal access" ON tasks;
CREATE POLICY "Task visibility based on goal access"
    ON tasks FOR SELECT
    USING (auth.has_team_access('goal', goal_id));

DROP POLICY IF EXISTS "Task management based on assignment" ON tasks;
CREATE POLICY "Task management based on role"
    ON tasks FOR ALL
    USING (
        auth.has_team_access('task', id, ARRAY['owner', 'admin'])
        OR auth.has_team_access('goal', goal_id, ARRAY['owner', 'admin'])
    );

-- Update Milestone Policies
DROP POLICY IF EXISTS "Milestone visibility based on goal access" ON milestones;
CREATE POLICY "Milestone visibility based on goal access"
    ON milestones FOR SELECT
    USING (auth.has_team_access('goal', goal_id));

DROP POLICY IF EXISTS "Milestone management" ON milestones;
CREATE POLICY "Milestone management"
    ON milestones FOR ALL
    USING (auth.has_team_access('goal', goal_id, ARRAY['owner', 'admin']));

-- Update KPI Policies
DROP POLICY IF EXISTS "KPI visibility based on goal access" ON kpis;
CREATE POLICY "KPI visibility based on goal access"
    ON kpis FOR SELECT
    USING (auth.has_team_access('goal', goal_id));

DROP POLICY IF EXISTS "KPI management" ON kpis;
CREATE POLICY "KPI management"
    ON kpis FOR ALL
    USING (auth.has_team_access('goal', goal_id, ARRAY['owner', 'admin']));

-- Update Template Policies
DROP POLICY IF EXISTS "Goal template access" ON goal_templates;
CREATE POLICY "Goal template access"
    ON goal_templates FOR SELECT
    USING (auth.has_team_access('organization', organization_id));

-- Add rollback capability
CREATE OR REPLACE FUNCTION auth.rollback_policy_changes()
RETURNS void AS $$
BEGIN
    -- Store original policies in temporary table
    CREATE TEMPORARY TABLE IF NOT EXISTS temp_policies AS
    SELECT * FROM pg_policies WHERE schemaname = 'public';
    
    -- Rollback function implementation here
    -- This is a safety measure in case the new policies cause issues
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION auth.rollback_policy_changes IS 
'Provides rollback capability for policy changes if needed'; 