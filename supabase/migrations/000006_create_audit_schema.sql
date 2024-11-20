-- Create audit schema
CREATE SCHEMA IF NOT EXISTS audit;

-- Create audit log table
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

-- Create session tracking table
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

-- Create rate limiting table
CREATE TABLE audit.rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    action_type TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 1,
    window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, action_type, window_start)
);

-- Create security events table
CREATE TABLE audit.security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX idx_audit_logs_entity ON audit.logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_actor ON audit.logs(actor_id);
CREATE INDEX idx_audit_logs_timestamp ON audit.logs(timestamp);
CREATE INDEX idx_audit_logs_action ON audit.logs(action);

CREATE INDEX idx_audit_sessions_user ON audit.sessions(user_id);
CREATE INDEX idx_audit_sessions_active ON audit.sessions(is_active, last_activity);

CREATE INDEX idx_rate_limits_user_action ON audit.rate_limits(user_id, action_type);
CREATE INDEX idx_rate_limits_window ON audit.rate_limits(window_start);

CREATE INDEX idx_security_events_user ON audit.security_events(user_id);
CREATE INDEX idx_security_events_type ON audit.security_events(event_type);
CREATE INDEX idx_security_events_created ON audit.security_events(created_at);

-- Add RLS policies
ALTER TABLE audit.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit.security_events ENABLE ROW LEVEL SECURITY;

-- Create audit logging functions
CREATE OR REPLACE FUNCTION audit.log_action()
RETURNS TRIGGER AS $$
DECLARE
    audit_row audit.logs;
    excluded_cols text[] = ARRAY[]::text[];
BEGIN
    IF TG_WHEN <> 'AFTER' THEN
        RAISE EXCEPTION 'audit.log_action() may only run as an AFTER trigger';
    END IF;

    audit_row = ROW(
        uuid_generate_v4(),          -- id
        TG_TABLE_NAME::text,         -- entity_type
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,                         -- entity_id
        auth.uid(),                  -- actor_id
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'create'::audit_action
            WHEN TG_OP = 'UPDATE' THEN 'update'::audit_action
            WHEN TG_OP = 'DELETE' THEN 'delete'::audit_action
        END,                         -- action
        jsonb_build_object(
            'old', to_jsonb(OLD),
            'new', to_jsonb(NEW)
        ),                           -- changes
        inet_client_addr(),          -- ip_address
        current_setting('request.headers', true)::jsonb->>'user-agent', -- user_agent
        NOW()                        -- timestamp
    );

    INSERT INTO audit.logs VALUES (audit_row.*);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to track user sessions
CREATE OR REPLACE FUNCTION audit.track_session()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit.sessions (user_id, ip_address, user_agent)
        VALUES (
            NEW.id,
            inet_client_addr(),
            current_setting('request.headers', true)::jsonb->>'user-agent'
        );
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE audit.sessions
        SET ended_at = NOW(), is_active = false
        WHERE user_id = OLD.id AND ended_at IS NULL;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check rate limits
CREATE OR REPLACE FUNCTION audit.check_rate_limit(
    p_user_id UUID,
    p_action_type TEXT,
    p_max_requests INTEGER,
    p_window_minutes INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    v_count INTEGER;
    v_window_start TIMESTAMPTZ;
BEGIN
    v_window_start := date_trunc('minute', NOW()) - (p_window_minutes || ' minutes')::INTERVAL;
    
    SELECT count INTO v_count
    FROM audit.rate_limits
    WHERE user_id = p_user_id
    AND action_type = p_action_type
    AND window_start >= v_window_start;

    RETURN COALESCE(v_count, 0) < p_max_requests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 