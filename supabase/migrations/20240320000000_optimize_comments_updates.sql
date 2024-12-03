-- Add indexes for better query performance
CREATE INDEX idx_comments_target ON comments(target_type, target_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX idx_updates_target ON updates(target_type, target_id);
CREATE INDEX idx_updates_created_at ON updates(created_at DESC);

-- Add a materialized view for hierarchical relationships
CREATE MATERIALIZED VIEW object_hierarchy AS
WITH RECURSIVE hierarchy AS (
  -- Base cases for workspace and organization
  SELECT 
    id as object_id,
    id as root_id,
    type as object_type,
    type as root_type,
    1 as level
  FROM (
    SELECT id, 'workspace' as type FROM workspaces
    UNION ALL
    SELECT id, 'organization' as type FROM organizations
    UNION ALL
    SELECT id, 'goal' as type FROM goals
  ) as base

  UNION ALL

  -- Recursive part
  SELECT 
    child.id,
    h.root_id,
    CASE 
      WHEN child.goal_id IS NOT NULL THEN 'goal'
      WHEN child.milestone_id IS NOT NULL THEN 'milestone'
      WHEN child.task_id IS NOT NULL THEN 'task'
    END as object_type,
    h.root_type,
    h.level + 1
  FROM hierarchy h
  JOIN (
    SELECT id, workspace_id as parent_id FROM goals
    UNION ALL
    SELECT id, goal_id as parent_id FROM milestones
    UNION ALL
    SELECT id, milestone_id as parent_id FROM tasks
  ) child ON child.parent_id = h.object_id
)
SELECT DISTINCT ON (object_id, root_id)
  object_id,
  root_id,
  object_type,
  root_type,
  level
FROM hierarchy;

-- Create indexes on the materialized view
CREATE INDEX idx_hierarchy_root ON object_hierarchy(root_id, root_type);
CREATE INDEX idx_hierarchy_object ON object_hierarchy(object_id, object_type);

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_object_hierarchy()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY object_hierarchy;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers to keep the materialized view updated
CREATE TRIGGER refresh_hierarchy_on_workspace_change
AFTER INSERT OR UPDATE OR DELETE ON workspaces
FOR EACH STATEMENT EXECUTE FUNCTION refresh_object_hierarchy();

CREATE TRIGGER refresh_hierarchy_on_goal_change
AFTER INSERT OR UPDATE OR DELETE ON goals
FOR EACH STATEMENT EXECUTE FUNCTION refresh_object_hierarchy();

-- Similar triggers for other relevant tables... 