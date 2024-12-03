 -- Metric configuration table
CREATE TABLE metric_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    calculation_rules JSONB NOT NULL DEFAULT '{}',
    thresholds JSONB NOT NULL DEFAULT '{}',
    required_datapoints TEXT[] DEFAULT '{}',
    refresh_rate INTERVAL NOT NULL DEFAULT '1 day'::INTERVAL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Metrics table
CREATE TABLE metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_id UUID NOT NULL,
    config_id UUID NOT NULL REFERENCES metric_configs(id) ON DELETE CASCADE,
    current_values JSONB NOT NULL DEFAULT '{}',
    historical_values JSONB NOT NULL DEFAULT '{}',
    last_calculated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- KPIs table
CREATE TABLE kpis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    value DECIMAL NOT NULL,
    target DECIMAL NOT NULL,
    unit TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('percentage', 'number', 'currency', 'time')),
    color TEXT,
    trend_direction TEXT CHECK (trend_direction IN ('up', 'down', 'neutral')),
    comparison_period INTERVAL,
    alert_thresholds JSONB DEFAULT '{}',
    data_source TEXT,
    visibility TEXT NOT NULL DEFAULT 'team'
        CHECK (visibility IN ('public', 'private', 'team', 'organization')),
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- KPI history table
CREATE TABLE kpi_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kpi_id UUID NOT NULL REFERENCES kpis(id) ON DELETE CASCADE,
    value DECIMAL NOT NULL,
    target DECIMAL NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_metrics_target ON metrics(target_id);
CREATE INDEX idx_metrics_last_calculated ON metrics(last_calculated);
CREATE INDEX idx_metrics_values ON metrics USING gin (current_values);
CREATE INDEX idx_metric_configs_rules ON metric_configs USING gin (calculation_rules);

CREATE INDEX idx_kpis_goal ON kpis(goal_id);
CREATE INDEX idx_kpis_type_value ON kpis(type, value);
CREATE INDEX idx_kpis_performance ON kpis(goal_id, value, target);

CREATE INDEX idx_kpi_history_kpi ON kpi_history(kpi_id);
CREATE INDEX idx_kpi_history_recorded ON kpi_history(recorded_at);

-- Triggers
CREATE TRIGGER handle_updated_at_kpis
    BEFORE UPDATE ON kpis
    FOR EACH ROW
    EXECUTE PROCEDURE moddatetime(updated_at);

-- RLS Policies
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_history ENABLE ROW LEVEL SECURITY;

-- Metric Policies
CREATE POLICY "Metric visibility"
    ON metrics FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM goals g
            WHERE g.id = metrics.target_id
            AND auth.has_team_access('goal', g.id)
        )
    );

-- KPI Policies
CREATE POLICY "KPI visibility"
    ON kpis FOR SELECT
    USING (auth.has_team_access('goal', goal_id));

CREATE POLICY "KPI management"
    ON kpis FOR ALL
    USING (auth.has_team_access('goal', goal_id, ARRAY['owner', 'admin']));

-- KPI History Policies
CREATE POLICY "KPI history visibility"
    ON kpi_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM kpis k
            WHERE k.id = kpi_history.kpi_id
            AND auth.has_team_access('goal', k.goal_id)
        )
    );