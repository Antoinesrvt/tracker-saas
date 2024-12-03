
-- 1. Enables RLS on all tables
-- 2. Implements hierarchical access control
-- 3. Enforces proper ownership and role-based access
-- 4. Protects sensitive operations
-- 5. Ensures data isolation between organizations
-- 6. Implements proper audit log access control
-- 7. Manages team assignments securely

-- Enable RLS on all tables
DO $$ 
DECLARE 
    t text;
BEGIN 
    FOR t IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    END LOOP;
END $$;

-- Organization Policies
CREATE POLICY "Organization owners have full access"
    ON organizations FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Organization members can view"
    ON organizations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM team_assignments
            WHERE user_id = auth.uid()
            AND assignable_type = 'organization'
            AND assignable_id = organizations.id
        )
    );

-- Workspace Policies
CREATE POLICY "Workspace members can view"
    ON workspaces FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM team_assignments ta
            WHERE ta.user_id = auth.uid()
            AND ta.assignable_type = 'workspace'
            AND ta.assignable_id = workspaces.id
        )
    );

CREATE POLICY "Organization admins can manage workspaces"
    ON workspaces FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM team_assignments ta
            WHERE ta.user_id = auth.uid()
            AND ta.assignable_type = 'organization'
            AND ta.assignable_id = workspaces.organization_id
            AND ta.role IN ('owner', 'admin')
        )
    );

-- Goal Policies
CREATE POLICY "Goal visibility based on workspace membership"
    ON goals FOR SELECT
    USING (
        workspace_id IN (
            SELECT w.id FROM workspaces w
            JOIN team_assignments ta ON 
                ta.assignable_type = 'workspace' 
                AND ta.assignable_id = w.id
            WHERE ta.user_id = auth.uid()
        )
    );

CREATE POLICY "Goal management based on role"
    ON goals FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM team_assignments ta
            WHERE ta.user_id = auth.uid()
            AND (
                (ta.assignable_type = 'goal' AND ta.assignable_id = goals.id AND ta.role IN ('owner', 'admin'))
                OR
                (ta.assignable_type = 'workspace' AND ta.assignable_id = goals.workspace_id AND ta.role IN ('owner', 'admin'))
            )
        )
    );

-- Task Policies
CREATE POLICY "Task visibility based on goal access"
    ON tasks FOR SELECT
    USING (auth.has_team_access('goal', goal_id));

CREATE POLICY "Task management based on assignment"
    ON tasks FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM team_assignments ta
            WHERE ta.user_id = auth.uid()
            AND (
                (ta.assignable_type = 'task' AND ta.assignable_id = tasks.id)
                OR
                (ta.assignable_type = 'goal' AND ta.assignable_id = tasks.goal_id AND ta.role IN ('owner', 'admin'))
            )
        )
    );

-- Resource Policies
CREATE POLICY "Resource visibility based on context"
    ON resources FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM resource_targets rt
            JOIN team_assignments ta ON 
                ta.assignable_type = rt.target_type
                AND ta.assignable_id = rt.target_id
            WHERE rt.resource_id = resources.id
            AND ta.user_id = auth.uid()
        )
    );

CREATE POLICY "Resource management based on ownership"
    ON resources FOR ALL
    USING (
        creator_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM team_assignments ta
            WHERE ta.user_id = auth.uid()
            AND ta.assignable_type = 'organization'
            AND ta.assignable_id = resources.organization_id
            AND ta.role IN ('owner', 'admin')
        )
    );

-- Metrics Policies
CREATE POLICY "Metrics visibility based on goal access"
    ON metrics FOR SELECT
    USING (
        target_id IN (
            SELECT g.id FROM goals g
            JOIN team_assignments ta ON 
                ta.assignable_type = 'goal'
                AND ta.assignable_id = g.id
            WHERE ta.user_id = auth.uid()
        )
    );

CREATE POLICY "Metrics management restricted to admins"
    ON metrics FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM team_assignments ta
            WHERE ta.user_id = auth.uid()
            AND ta.role IN ('owner', 'admin')
            AND (
                (ta.assignable_type = 'goal' AND ta.assignable_id = metrics.target_id)
                OR
                (ta.assignable_type = 'organization' AND ta.assignable_id IN (
                    SELECT organization_id FROM workspaces w
                    JOIN goals g ON g.workspace_id = w.id
                    WHERE g.id = metrics.target_id
                ))
            )
        )
    );

-- Update Policies
CREATE POLICY "Update visibility based on context"
    ON updates FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM team_assignments ta
            WHERE ta.user_id = auth.uid()
            AND ta.assignable_id = updates.target_id
        )
    );

CREATE POLICY "Update creation based on context"
    ON updates FOR INSERT
    WITH CHECK (
        creator_id = auth.uid()
        AND
        EXISTS (
            SELECT 1 FROM team_assignments ta
            WHERE ta.user_id = auth.uid()
            AND ta.assignable_id = NEW.target_id
        )
    );

-- Audit Policies
CREATE POLICY "Audit log access restricted to admins"
    ON audit.logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM team_assignments ta
            WHERE ta.user_id = auth.uid()
            AND ta.role IN ('owner', 'admin')
        )
    );

-- Team Assignment Policies
CREATE POLICY "Team assignment visibility"
    ON team_assignments FOR SELECT
    USING (
        user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM team_assignments ta
            WHERE ta.user_id = auth.uid()
            AND ta.assignable_id = team_assignments.assignable_id
            AND ta.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Team assignment management"
    ON team_assignments FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM team_assignments ta
            WHERE ta.user_id = auth.uid()
            AND ta.assignable_id = team_assignments.assignable_id
            AND ta.role IN ('owner', 'admin')
        )
    );

-- Milestone Policies
CREATE POLICY "Milestone visibility based on goal access"
    ON milestones FOR SELECT
    USING (
        goal_id IN (
            SELECT g.id FROM goals g
            JOIN team_assignments ta ON 
                ta.assignable_type = 'goal' 
                AND ta.assignable_id = g.id
            WHERE ta.user_id = auth.uid()
        )
    );

-- Subtask Policies
CREATE POLICY "Subtask visibility based on task access"
    ON subtasks FOR SELECT
    USING (
        task_id IN (
            SELECT t.id FROM tasks t
            WHERE EXISTS (
                SELECT 1 FROM team_assignments ta
                WHERE ta.user_id = auth.uid()
                AND ta.assignable_type = 'task'
                AND ta.assignable_id = t.id
            )
        )
    );

-- KPI Policies
CREATE POLICY "KPI visibility based on goal access"
    ON kpis FOR SELECT
    USING (
        goal_id IN (
            SELECT g.id FROM goals g
            JOIN team_assignments ta ON 
                ta.assignable_type = 'goal'
                AND ta.assignable_id = g.id
            WHERE ta.user_id = auth.uid()
        )
    ); 

-- -- Only allow super admins to view audit logs
-- CREATE POLICY "Super admins can view audit logs"
--     ON audit.logs FOR SELECT
--     USING (
--         EXISTS (
--             SELECT 1 FROM auth.user_private up
--             WHERE up.id = auth.uid()
--             AND up.role = 'super_admin'
--         )
--     );

-- -- Users can view their own sessions
-- CREATE POLICY "Users can view own sessions"
--     ON audit.sessions FOR SELECT
--     USING (user_id = auth.uid());