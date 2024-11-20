-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for connection strength and status if not exists
CREATE TYPE connection_strength AS ENUM ('strong', 'weak', 'medium');
CREATE TYPE connection_status AS ENUM ('active', 'blocked', 'completed');

-- Create goal connections table
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

-- Add RLS policies
ALTER TABLE goal_connections ENABLE ROW LEVEL SECURITY;

-- Add update trigger
CREATE TRIGGER handle_updated_at_goal_connections
    BEFORE UPDATE ON goal_connections
    FOR EACH ROW
    EXECUTE PROCEDURE moddatetime(updated_at);

-- Add policies
CREATE POLICY "Users can view connections for accessible goals"
    ON goal_connections FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM goals g
            JOIN team_assignments ta ON 
                ta.assignable_type = 'workspace' 
                AND ta.assignable_id = g.workspace_id
            WHERE ta.user_id = auth.uid()
            AND (g.id = goal_connections.source_goal_id OR g.id = goal_connections.target_goal_id)
        )
    );

CREATE POLICY "Users can manage connections for goals they can edit"
    ON goal_connections FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM
</file>