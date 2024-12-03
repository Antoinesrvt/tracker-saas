 -- Workspace Integrations
CREATE TABLE workspace_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id),
    provider TEXT NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    credentials JSONB,
    enabled BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'error', 'disabled')),
    error_log JSONB DEFAULT '[]',
    last_sync_at TIMESTAMPTZ,
    sync_frequency INTERVAL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports
CREATE TABLE saved_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    workspace_id UUID REFERENCES workspaces(id),
    creator_id UUID REFERENCES auth.users(id),
    query_config JSONB NOT NULL,
    visualization_config JSONB DEFAULT '{}',
    schedule JSONB DEFAULT NULL,
    recipients JSONB DEFAULT '[]',
    last_run_at TIMESTAMPTZ,
    visibility TEXT NOT NULL DEFAULT 'team'
        CHECK (visibility IN ('public', 'private', 'team', 'organization')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Report Results
CREATE TABLE report_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES saved_reports(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    execution_time INTEGER, -- in milliseconds
    status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'partial', 'error')),
    error_details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_integrations_workspace ON workspace_integrations(workspace_id);
CREATE INDEX idx_integrations_provider ON workspace_integrations(provider);
CREATE INDEX idx_integrations_status ON workspace_integrations(status);

CREATE INDEX idx_reports_workspace ON saved_reports(workspace_id);
CREATE INDEX idx_reports_creator ON saved_reports(creator_id);
CREATE INDEX idx_report_results_report ON report_results(report_id);
CREATE INDEX idx_report_results_status ON report_results(status);

-- RLS Policies
ALTER TABLE workspace_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_results ENABLE ROW LEVEL SECURITY;

-- Integration Policies
CREATE POLICY "Integration visibility"
    ON workspace_integrations FOR SELECT
    USING (auth.has_team_access('workspace', workspace_id));

CREATE POLICY "Integration management"
    ON workspace_integrations FOR ALL
    USING (auth.has_team_access('workspace', workspace_id, ARRAY['owner', 'admin']));

-- Report Policies
CREATE POLICY "Report visibility"
    ON saved_reports FOR SELECT
    USING (
        CASE 
            WHEN visibility = 'private' THEN creator_id = auth.uid()
            WHEN visibility = 'team' THEN auth.has_team_access('workspace', workspace_id)
            WHEN visibility = 'organization' THEN 
                EXISTS (
                    SELECT 1 FROM workspaces w
                    WHERE w.id = saved_reports.workspace_id
                    AND auth.has_team_access('organization', w.organization_id)
                )
            ELSE true -- public
        END
    );

CREATE POLICY "Report management"
    ON saved_reports FOR ALL
    USING (
        creator_id = auth.uid() OR
        auth.has_team_access('workspace', workspace_id, ARRAY['owner', 'admin'])
    );

-- Report Results Policies
CREATE POLICY "Report results visibility"
    ON report_results FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM saved_reports sr
            WHERE sr.id = report_results.report_id
            AND (
                sr.creator_id = auth.uid() OR
                auth.has_team_access('workspace', sr.workspace_id)
            )
        )
    );