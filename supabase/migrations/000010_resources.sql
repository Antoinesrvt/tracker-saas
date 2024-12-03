 -- Resources table
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    type resource_type NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID,
    link TEXT NOT NULL,
    encryption_key TEXT,
    size BIGINT,
    mime_type TEXT,
    preview_url TEXT,
    version INTEGER DEFAULT 1,
    tags TEXT[] DEFAULT '{}',
    shared_with JSONB DEFAULT '{}',
    visibility TEXT NOT NULL DEFAULT 'team'
        CHECK (visibility IN ('public', 'private', 'team', 'organization')),
    metadata JSONB DEFAULT '{}',
    creator_id UUID NOT NULL REFERENCES auth.users(id),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_target_type CHECK (target_type IN ('goal', 'milestone', 'task', 'workspace')),
    CONSTRAINT valid_title CHECK (char_length(title) >= 2)
);

-- Indexes
CREATE INDEX idx_resources_title ON resources USING gin (title gin_trgm_ops);
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_creator ON resources(creator_id);
CREATE INDEX idx_resources_metadata ON resources USING gin (metadata);
CREATE INDEX idx_resources_target ON resources(target_type, target_id);
CREATE INDEX idx_resources_organization ON resources(organization_id);
CREATE INDEX idx_resources_fts ON resources USING gin (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(metadata::text, ''))
);

-- Triggers
CREATE TRIGGER handle_updated_at_resources
    BEFORE UPDATE ON resources
    FOR EACH ROW
    EXECUTE PROCEDURE moddatetime(updated_at);

-- RLS Policies
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Resource Policies
CREATE POLICY "Resource visibility based on target"
    ON resources FOR SELECT
    USING (
        auth.has_team_access(target_type, target_id)
        OR auth.has_team_access('organization', organization_id)
    );

CREATE POLICY "Resource management"
    ON resources FOR ALL
    USING (
        creator_id = auth.uid()
        OR auth.has_team_access(target_type, target_id, ARRAY['owner', 'admin'])
        OR auth.has_team_access('organization', organization_id, ARRAY['owner', 'admin'])
    );