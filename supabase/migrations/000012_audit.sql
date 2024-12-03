 -- Create audit schema if not exists
CREATE SCHEMA IF NOT EXISTS audit;

-- Audit log table
CREATE TABLE audit.logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    actor_id UUID NOT NULL REFERENCES auth.users(id),
    action audit_action NOT NULL,
    changes JSONB NOT NULL DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    context JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Session tracking table
CREATE TABLE audit.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Security events table
CREATE TABLE audit.security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
    mitigated_at TIMESTAMPTZ,
    mitigation_notes TEXT,
    related_events UUID[],
    tags TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_entity ON audit.logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_actor ON audit.logs(actor_id);
CREATE INDEX idx_audit_logs_timestamp ON audit.logs(timestamp);
CREATE INDEX idx_audit_logs_action ON audit.logs(action);

CREATE INDEX idx_audit_sessions_user ON audit.sessions(user_id);
CREATE INDEX idx_audit_sessions_active ON audit.sessions(is_active, last_activity);

CREATE INDEX idx_security_events_user ON audit.security_events(user_id);
CREATE INDEX idx_security_events_type ON audit.security_events(event_type);
CREATE INDEX idx_security_events_created ON audit.security_events(created_at);
CREATE INDEX idx_security_events_severity ON audit.security_events(severity);
CREATE INDEX idx_security_events_risk ON audit.security_events(risk_score);

-- RLS Policies
ALTER TABLE audit.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit.security_events ENABLE ROW LEVEL SECURITY;

-- Audit Policies
CREATE POLICY "Admin audit log access"
    ON audit.logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.user_private up
            WHERE up.id = auth.uid()
            AND up.role IN ('admin', 'super_admin')
        )
    );

-- Session Policies
CREATE POLICY "Users can view own sessions"
    ON audit.sessions FOR SELECT
    USING (user_id = auth.uid());

-- Security Event Policies
CREATE POLICY "Admin security event access"
    ON audit.security_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.user_private up
            WHERE up.id = auth.uid()
            AND up.role IN ('admin', 'super_admin')
        )
    );