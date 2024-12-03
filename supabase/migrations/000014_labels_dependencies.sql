 -- Labels/Tags Management
CREATE TABLE labels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    color TEXT,
    description TEXT,
    organization_id UUID REFERENCES organizations(id),
    workspace_id UUID REFERENCES workspaces(id),
    created_by UUID REFERENCES auth.users(id),
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, organization_id)
);

-- Dependencies Management
CREATE TABLE dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_type TEXT NOT NULL,
    source_id UUID NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    dependency_type TEXT CHECK (dependency_type IN ('blocks', 'requires', 'relates_to')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_type, source_id, target_type, target_id)
);

-- Indexes
CREATE INDEX idx_labels_org ON labels(organization_id);
CREATE INDEX idx_labels_workspace ON labels(workspace_id);
CREATE INDEX idx_labels_usage ON labels(usage_count DESC);

CREATE INDEX idx_dependencies_source ON dependencies(source_type, source_id);
CREATE INDEX idx_dependencies_target ON dependencies(target_type, target_id);

-- RLS Policies
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE dependencies ENABLE ROW LEVEL SECURITY;

-- Label Policies
CREATE POLICY "Label visibility"
    ON labels FOR SELECT
    USING (
        auth.has_team_access('organization', organization_id) OR
        auth.has_team_access('workspace', workspace_id)
    );

CREATE POLICY "Label management"
    ON labels FOR ALL
    USING (
        auth.has_team_access('organization', organization_id, ARRAY['owner', 'admin']) OR
        auth.has_team_access('workspace', workspace_id, ARRAY['owner', 'admin'])
    );

-- Dependency Policies
CREATE POLICY "Dependency visibility"
    ON dependencies FOR SELECT
    USING (
        auth.has_team_access(source_type, source_id) OR
        auth.has_team_access(target_type, target_id)
    );

CREATE POLICY "Dependency management"
    ON dependencies FOR ALL
    USING (
        auth.has_team_access(source_type, source_id, ARRAY['owner', 'admin']) OR
        auth.has_team_access(target_type, target_id, ARRAY['owner', 'admin'])
    );