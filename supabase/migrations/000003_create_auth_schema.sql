  /** 
* USERS
* Note: This table contains user data. Users should only be able to view and update their own data.
*/
-- Public user information (for general access)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    last_active TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_display_name CHECK (char_length(display_name) >= 2)
);

-- Private user information (for secure data)
CREATE TABLE auth.user_private (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    billing_address JSONB,
    payment_method JSONB,
    role TEXT NOT NULL DEFAULT 'user',
    preferences JSONB DEFAULT '{}',
    CONSTRAINT valid_role CHECK (role IN ('user', 'admin', 'super_admin'))
);

/**
* This trigger automatically creates a user entry when a new user signs up via Supabase Auth.
*/ 
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    -- Insert public profile
    INSERT INTO public.user_profiles (
        id,
        display_name,
        avatar_url
    ) VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    
    -- Insert private data
    INSERT INTO auth.user_private (
        id,
        full_name,
        email,
        role
    ) VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.email,
        'user'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/**
* CUSTOMERS
* Note: this is a private table that contains a mapping of user IDs to Stripe customer IDs.
*/
create table customers (
  -- UUID from auth.users
  id uuid references auth.users not null primary key,
  -- The user's customer ID in Stripe. User must not be able to update this.
  stripe_customer_id text
);
alter table customers enable row level security;
-- No policies as this is a private table that the user must not have access to.


-- Public profile policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public profiles"
    ON public.user_profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own public profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Private data policies
ALTER TABLE auth.user_private ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own private data"
    ON auth.user_private FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own private data"
    ON auth.user_private FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);