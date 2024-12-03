 -- Automation system
CREATE TABLE automations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN (
        'on_status_change', 'on_deadline_approach', 
        'on_assignment', 'on_progress_update',
        'scheduled', 'on_milestone_complete'
    )),
    trigger_config JSONB NOT NULL DEFAULT '{}',
    actions JSONB[] NOT NULL,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_run_at TIMESTAMPTZ
);

CREATE TABLE automation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    automation_id UUID REFERENCES automations(id),
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
    trigger_details JSONB,
    execution_result JSONB,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates system
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('goal', 'milestone', 'task_group', 'workspace')),
    structure JSONB NOT NULL,
    organization_id UUID REFERENCES organizations(id),
    created_by UUID REFERENCES auth.users(id),
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_automations_workspace ON automations(workspace_id);
CREATE INDEX idx_automations_trigger ON automations(trigger_type) WHERE enabled = true;
CREATE INDEX idx_automation_logs_automation ON automation_logs(automation_id);
CREATE INDEX idx_templates_org ON templates(organization_id);
CREATE INDEX idx_templates_type ON templates(type);

-- RLS Policies
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Automation Policies
CREATE POLICY "Automation visibility"
    ON automations FOR SELECT
    USING (auth.has_team_access('workspace', workspace_id));

CREATE POLICY "Automation management"
    ON automations FOR ALL
    USING (auth.has_team_access('workspace', workspace_id, ARRAY['owner', 'admin']));

-- Template Policies
CREATE POLICY "Template visibility"
    ON templates FOR SELECT
    USING (
        is_public OR 
        auth.has_team_access('organization', organization_id)
    );

CREATE POLICY "Template management"
    ON templates FOR ALL
    USING (auth.has_team_access('organization', organization_id, ARRAY['owner', 'admin']));