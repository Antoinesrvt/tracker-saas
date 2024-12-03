 -- Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    domain TEXT,
    subscription_plan TEXT NOT NULL DEFAULT 'free',
    max_workspaces INTEGER DEFAULT 5,
    max_members INTEGER DEFAULT 10,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    settings JSONB NOT NULL DEFAULT '{}',
    branding_settings JSONB DEFAULT '{}', -- Logo, colors, etc.
    default_workspace_settings JSONB DEFAULT '{}', -- Template for new workspaces
    archived_at TIMESTAMPTZ,
    CONSTRAINT valid_name CHECK (char_length(name) >= 2)
);

-- Workspaces table
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
     description TEXT,
    icon TEXT,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    settings JSONB NOT NULL DEFAULT '{}',
    visibility TEXT NOT NULL DEFAULT 'organization' 
        CHECK (visibility IN ('public', 'private', 'organization')),
    archived_at TIMESTAMPTZ,
    CONSTRAINT valid_name CHECK (char_length(name) >= 2)
);

-- Indexes
CREATE INDEX idx_organizations_name ON organizations USING gin (name gin_trgm_ops);
CREATE INDEX idx_organizations_subscription ON organizations(subscription_plan);
CREATE INDEX idx_organizations_active ON organizations(is_active);

CREATE INDEX idx_workspaces_name ON workspaces USING gin (name gin_trgm_ops);
CREATE INDEX idx_workspaces_org ON workspaces(organization_id);
CREATE INDEX idx_workspaces_active ON workspaces(is_active);

-- Triggers
CREATE TRIGGER handle_updated_at_workspaces
    BEFORE UPDATE ON workspaces
    FOR EACH ROW
    EXECUTE PROCEDURE moddatetime(updated_at);

-- RLS Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Organization Policies
CREATE POLICY "Organization owners have full access"
    ON organizations FOR ALL
    USING (auth.has_team_access('organization', id, ARRAY['owner']));

CREATE POLICY "Organization members can view"
    ON organizations FOR SELECT
    USING (auth.has_team_access('organization', id));

-- Workspace Policies
CREATE POLICY "Workspace members can view"
    ON workspaces FOR SELECT
    USING (
        auth.has_team_access('workspace', id)
        OR auth.has_team_access('organization', organization_id)
    );

CREATE POLICY "Organization admins can manage workspaces"
    ON workspaces FOR ALL
    USING (auth.has_team_access('organization', organization_id, ARRAY['owner', 'admin']));

-- Auto-assign creator as owner
CREATE TRIGGER handle_organization_creation
    AFTER INSERT ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION auth.handle_object_creation('organization');

CREATE TRIGGER handle_workspace_creation
    AFTER INSERT ON workspaces
    FOR EACH ROW
    EXECUTE FUNCTION auth.handle_object_creation('workspace');