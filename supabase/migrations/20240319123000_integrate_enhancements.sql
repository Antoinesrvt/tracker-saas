 -- Add new notification rules system
CREATE TABLE notification_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id),
    rule_type TEXT NOT NULL CHECK (rule_type IN (
        'deadline_approaching', 'task_overdue',
        'milestone_at_risk', 'resource_underutilized',
        'team_performance_drop'
    )),
    conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    enabled BOOLEAN DEFAULT true
);

-- Add performance tracking
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id),
    metric_type TEXT NOT NULL CHECK (metric_type IN (
        'completion_rate', 'response_time', 'quality_score',
        'team_velocity', 'resource_efficiency'
    )),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    value DECIMAL,
    target DECIMAL,
    metadata JSONB DEFAULT '{}'
);

-- Add resource optimization
CREATE TABLE resource_allocation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id),
    resource_type TEXT NOT NULL,
    allocation_period TSTZRANGE NOT NULL,
    capacity DECIMAL,
    allocated DECIMAL,
    utilization_rate DECIMAL GENERATED ALWAYS AS 
        (CASE WHEN capacity > 0 THEN (allocated / capacity * 100) ELSE 0 END) STORED,
    metadata JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE notification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_allocation ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Workspace members can view notification rules" 
    ON notification_rules FOR SELECT
    USING (auth.has_team_access('workspace', workspace_id));

CREATE POLICY "Workspace admins can manage notification rules" 
    ON notification_rules FOR ALL
    USING (auth.has_team_access('workspace', workspace_id, ARRAY['owner', 'admin']));

CREATE POLICY "Workspace members can view metrics" 
    ON performance_metrics FOR SELECT
    USING (auth.has_team_access('workspace', workspace_id));

CREATE POLICY "Resource allocation access" 
    ON resource_allocation FOR ALL
    USING (auth.has_team_access('workspace', workspace_id, ARRAY['owner', 'admin']));