
-- 1. Adds text search capabilities using GIN indexes
-- 2. Optimizes common query patterns with composite indexes
-- 3. Uses partial indexes for specific conditions
-- 4. Adds JSONB indexing for flexible fields
-- 5. Optimizes date range queries
-- 6. Adds trigram indexes for fuzzy text search
-- 7. Optimizes team assignment queries
-- 8. Adds indexes for metrics and monitoring


-- User-related indexes
CREATE INDEX idx_user_profiles_display_name ON public.user_profiles USING gin (display_name gin_trgm_ops);
CREATE INDEX idx_user_profiles_last_active ON public.user_profiles(last_active);
CREATE INDEX idx_user_profiles_fts ON public.user_profiles USING gin (
    to_tsvector('english', coalesce(display_name, '') || ' ' || coalesce(bio, ''))
);

CREATE INDEX idx_user_private_email ON auth.user_private(email);
CREATE INDEX idx_user_private_role ON auth.user_private(role);
CREATE INDEX idx_user_private_jsonb ON auth.user_private USING gin (preferences);


-- Core table indexes
CREATE INDEX idx_organizations_name ON organizations USING gin (name gin_trgm_ops);
CREATE INDEX idx_organizations_subscription ON organizations(subscription_plan);
CREATE INDEX idx_organizations_active ON organizations(is_active);

CREATE INDEX idx_workspaces_name ON workspaces USING gin (name gin_trgm_ops);
CREATE INDEX idx_workspaces_org ON workspaces(organization_id);
CREATE INDEX idx_workspaces_active ON workspaces(is_active);

CREATE INDEX idx_goals_title ON goals USING gin (title gin_trgm_ops);
CREATE INDEX idx_goals_workspace ON goals(workspace_id);
CREATE INDEX idx_goals_parent ON goals(parent_goal_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_type ON goals(type);
CREATE INDEX idx_goals_dates ON goals(start_date, end_date);
CREATE INDEX idx_goals_progress ON goals(progress);

-- Task and milestone indexes
CREATE INDEX idx_milestones_goal ON milestones(goal_id);
CREATE INDEX idx_milestones_date ON milestones(target_date);
CREATE INDEX idx_milestones_status ON milestones(status);
CREATE INDEX idx_milestones_critical ON milestones(is_critical) WHERE is_critical = true;

CREATE INDEX idx_tasks_title ON tasks USING gin (title gin_trgm_ops);
CREATE INDEX idx_tasks_goal ON tasks(goal_id);
CREATE INDEX idx_tasks_milestone ON tasks(milestone_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_tasks_pending ON tasks(goal_id, status) WHERE status IN ('todo', 'in_progress');

-- Resource indexes
CREATE INDEX idx_resources_title ON resources USING gin (title gin_trgm_ops);
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_creator ON resources(creator_id);
CREATE INDEX idx_resources_active ON resources(is_active);
CREATE INDEX idx_resources_metadata ON resources USING gin (metadata);

CREATE INDEX idx_resource_targets_resource ON resource_targets(resource_id);
CREATE INDEX idx_resource_targets_target ON resource_targets(target_type, target_id);
CREATE INDEX idx_resource_targets_date ON resource_targets(attached_at);

-- Team assignment indexes
CREATE INDEX idx_team_assignments_user ON team_assignments(user_id);
CREATE INDEX idx_team_assignments_assignable ON team_assignments(assignable_type, assignable_id);
CREATE INDEX idx_team_assignments_role ON team_assignments(role);
CREATE INDEX idx_team_assignments_period ON team_assignments USING gist (valid_period);
CREATE INDEX idx_team_assignments_active ON team_assignments(user_id, assignable_type, assignable_id) 
    WHERE upper(valid_period) IS NULL OR upper(valid_period) > NOW();

-- Update and comment indexes
CREATE INDEX idx_updates_target ON updates(target_id);
CREATE INDEX idx_updates_type ON updates(type);
CREATE INDEX idx_updates_creator ON updates(creator_id);
CREATE INDEX idx_updates_created ON updates(created_at);
CREATE INDEX idx_updates_mentions ON updates USING gin (mentions);
CREATE INDEX idx_updates_payload ON updates USING gin (payload);

-- Metrics indexes
CREATE INDEX idx_metrics_target ON metrics(target_id);
CREATE INDEX idx_metrics_last_calculated ON metrics(last_calculated);
CREATE INDEX idx_metrics_values ON metrics USING gin (current_values);

CREATE INDEX idx_metric_configs_rules ON metric_configs USING gin (calculation_rules);
CREATE INDEX idx_metric_configs_thresholds ON metric_configs USING gin (thresholds);

-- Full text search indexes
CREATE INDEX idx_goals_fts ON goals USING gin (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
);

CREATE INDEX idx_tasks_fts ON tasks USING gin (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
);

CREATE INDEX idx_resources_fts ON resources USING gin (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(metadata::text, ''))
);

-- Composite indexes for common queries
CREATE INDEX idx_goals_workspace_status ON goals(workspace_id, status);
CREATE INDEX idx_tasks_goal_status_priority ON tasks(goal_id, status, priority);
CREATE INDEX idx_team_assignments_composite ON team_assignments(user_id, assignable_type, role);

-- Partial indexes for performance optimization
CREATE INDEX idx_active_goals ON goals(workspace_id) WHERE status = 'active';
CREATE INDEX idx_critical_milestones ON milestones(goal_id) WHERE is_critical = true;
CREATE INDEX idx_pending_tasks ON tasks(goal_id) WHERE status IN ('todo', 'in_progress');
CREATE INDEX idx_recent_updates ON updates(target_id, created_at) 
    WHERE created_at > (NOW() - INTERVAL '30 days'); 

-- Team assignment indexes
CREATE INDEX idx_team_assignments_lookup 
ON team_assignments(user_id, assignable_type, assignable_id);


-- Milestone indexes
CREATE INDEX idx_milestones_title ON milestones USING gin (title gin_trgm_ops);
CREATE INDEX idx_milestones_composite ON milestones(goal_id, status, is_critical);

-- Subtask indexes
CREATE INDEX idx_subtasks_task ON subtasks(task_id);
CREATE INDEX idx_subtasks_completion ON subtasks(task_id, completed);

-- KPI indexes
CREATE INDEX idx_kpis_goal ON kpis(goal_id);
CREATE INDEX idx_kpis_type_value ON kpis(type, value);
CREATE INDEX idx_kpis_performance ON kpis(goal_id, value, target);