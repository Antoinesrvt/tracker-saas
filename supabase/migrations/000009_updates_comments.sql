 -- Updates table
CREATE TABLE updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_id UUID NOT NULL,
    type update_type NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    creator_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    mentions TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT jsonb_build_object(
        'reactions', '[]'::jsonb,
        'comments_count', 0
    ),
    CONSTRAINT valid_mentions CHECK (array_length(mentions, 1) IS NULL OR array_length(mentions, 1) <= 50),
    visibility TEXT NOT NULL DEFAULT 'team'
        CHECK (visibility IN ('public', 'team', 'private')),
    pinned BOOLEAN DEFAULT false,
    scheduled_for TIMESTAMPTZ,
    edited_by UUID REFERENCES auth.users(id),
    edit_history JSONB DEFAULT '[]'
);

-- Comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES auth.users(id),
    update_id UUID REFERENCES updates(id) ON DELETE CASCADE,
    object_type TEXT,
    object_id UUID,
    parent_id UUID REFERENCES comments(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    edited_at TIMESTAMPTZ,
    mentions JSONB DEFAULT '[]',
    reactions JSONB DEFAULT '[]',
    CONSTRAINT valid_object_type CHECK (object_type IN ('goal', 'task', 'milestone', 'resource', 'update')),
    CONSTRAINT valid_parent CHECK (
        (parent_id IS NULL AND update_id IS NULL AND object_id IS NOT NULL) OR
        (parent_id IS NOT NULL AND update_id IS NULL AND object_id IS NULL) OR
        (update_id IS NOT NULL AND parent_id IS NULL AND object_id IS NULL)
    ),
    visibility TEXT NOT NULL DEFAULT 'team'
        CHECK (visibility IN ('public', 'team', 'private')),
    edited_by UUID REFERENCES auth.users(id),
    edit_history JSONB DEFAULT '[]'
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    resource_type TEXT NOT NULL,
    resource_id UUID NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_updates_target ON updates(target_id);
CREATE INDEX idx_updates_type ON updates(type);
CREATE INDEX idx_updates_creator ON updates(creator_id);
CREATE INDEX idx_updates_created ON updates(created_at);
CREATE INDEX idx_updates_mentions ON updates USING gin (mentions);
CREATE INDEX idx_updates_payload ON updates USING gin (payload);
CREATE INDEX idx_updates_metadata_gin_idx ON updates USING gin (metadata);
CREATE INDEX idx_recent_updates ON updates(target_id, created_at) 
    WHERE created_at > (NOW() - INTERVAL '30 days');

CREATE INDEX idx_comments_update ON comments(update_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_object ON comments(object_type, object_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_comments_mentions ON comments USING gin (mentions);

-- RLS Policies
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Update Policies
CREATE POLICY "Update visibility based on context"
    ON updates FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM team_assignments ta
            WHERE ta.user_id = auth.uid()
            AND ta.assignable_id = updates.target_id
        )
    );

CREATE POLICY "Update creation based on context"
    ON updates FOR INSERT
    WITH CHECK (
        creator_id = auth.uid()
        AND
        EXISTS (
            SELECT 1 FROM team_assignments ta
            WHERE ta.user_id = auth.uid()
            AND ta.assignable_id = NEW.target_id
        )
    );

-- Comment Policies
CREATE POLICY "Comment visibility"
    ON comments FOR SELECT
    USING (
        CASE
            WHEN update_id IS NOT NULL THEN
                EXISTS (
                    SELECT 1 FROM updates u
                    WHERE u.id = comments.update_id
                    AND EXISTS (
                        SELECT 1 FROM team_assignments ta
                        WHERE ta.user_id = auth.uid()
                        AND ta.assignable_id = u.target_id
                    )
                )
            WHEN object_id IS NOT NULL THEN
                auth.has_team_access(object_type, object_id)
            ELSE false
        END
    );

CREATE POLICY "Comment management"
    ON comments FOR ALL
    USING (author_id = auth.uid());