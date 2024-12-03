 -- Milestones table
CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status goal_status NOT NULL DEFAULT 'draft',
    start_date TIMESTAMPTZ,
    target_date TIMESTAMPTZ,
    goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
    is_critical BOOLEAN NOT NULL DEFAULT false,
    position INTEGER NOT NULL DEFAULT 0,
    visibility TEXT NOT NULL DEFAULT 'team' 
        CHECK (visibility IN ('public', 'private', 'team', 'organization')),
    health_status TEXT CHECK (health_status IN ('on_track', 'at_risk', 'blocked')),
    progress FLOAT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    tags TEXT[] DEFAULT '{}',
    assignees UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_title CHECK (char_length(title) >= 2)
);

-- Indexes
CREATE INDEX idx_milestones_goal ON milestones(goal_id);
CREATE INDEX idx_milestones_date ON milestones(target_date);
CREATE INDEX idx_milestones_status ON milestones(status);
CREATE INDEX idx_milestones_critical ON milestones(is_critical) WHERE is_critical = true;
CREATE INDEX idx_milestones_title ON milestones USING gin (title gin_trgm_ops);
CREATE INDEX idx_milestones_composite ON milestones(goal_id, status, is_critical);

-- Triggers
CREATE TRIGGER handle_updated_at_milestones
    BEFORE UPDATE ON milestones
    FOR EACH ROW
    EXECUTE PROCEDURE moddatetime(updated_at);

-- RLS Policies
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- Milestone Policies
CREATE POLICY "Milestone visibility based on goal access"
    ON milestones FOR SELECT
    USING (auth.has_team_access('goal', goal_id));

CREATE POLICY "Milestone management"
    ON milestones FOR ALL
    USING (auth.has_team_access('goal', goal_id, ARRAY['owner', 'admin']));