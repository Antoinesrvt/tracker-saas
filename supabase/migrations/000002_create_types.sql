 -- Create all ENUM types
CREATE TYPE goal_status AS ENUM ('draft', 'active', 'completed', 'archived', 'blocked');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'completed', 'blocked');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE resource_type AS ENUM ('file', 'link', 'document');
CREATE TYPE team_role AS ENUM ('owner', 'admin', 'member', 'viewer');
CREATE TYPE update_type AS ENUM ('comment', 'status_change', 'progress_update', 'milestone', 'assignment');
CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete', 'archive', 'restore');
CREATE TYPE goal_type AS ENUM ('fondation', 'action', 'strategie', 'vision');