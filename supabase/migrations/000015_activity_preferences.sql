 -- Activity Timeline
CREATE TABLE activity_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id),
    actor_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    metadata JSONB DEFAULT '{}',
    visibility TEXT NOT NULL DEFAULT 'team'
        CHECK (visibility IN ('public', 'private', 'team', 'organization')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Preferences
CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    notification_settings JSONB DEFAULT '{
        "email": true,
        "in_app": true,
        "desktop": false,
        "digest": "daily",
        "mentions": true,
        "assignments": true,
        "updates": true,
        "reminders": true
    }',
    ui_preferences JSONB DEFAULT '{
        "theme": "light",
        "compact_view": false,
        "sidebar_collapsed": false,
        "default_dashboard": "overview"
    }',
    workspace_preferences JSONB DEFAULT '{}',
    keyboard_shortcuts JSONB DEFAULT '{}',
    last_viewed_items JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_activity_feed_workspace ON activity_feed(workspace_id);
CREATE INDEX idx_activity_feed_actor ON activity_feed(actor_id);
CREATE INDEX idx_activity_feed_entity ON activity_feed(entity_type, entity_id);
CREATE INDEX idx_activity_feed_created ON activity_feed(created_at DESC);

-- RLS Policies
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Activity Feed Policies
CREATE POLICY "Activity feed visibility"
    ON activity_feed FOR SELECT
    USING (
        CASE 
            WHEN visibility = 'team' THEN auth.has_team_access('workspace', workspace_id)
            WHEN visibility = 'organization' THEN 
                EXISTS (
                    SELECT 1 FROM workspaces w
                    WHERE w.id = activity_feed.workspace_id
                    AND auth.has_team_access('organization', w.organization_id)
                )
            WHEN visibility = 'private' THEN actor_id = auth.uid()
            ELSE true -- public
        END
    );

-- User Preferences Policies
CREATE POLICY "Users can manage their own preferences"
    ON user_preferences FOR ALL
    USING (user_id = auth.uid());