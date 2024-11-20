-- Create auth-related tables
CREATE TABLE auth.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    preferences JSONB DEFAULT '{}',
    last_active TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_display_name CHECK (char_length(display_name) >= 2),
    CONSTRAINT valid_role CHECK (role IN ('user', 'admin', 'super_admin'))
);

-- Add moddatetime trigger for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON auth.user_profiles
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at); 