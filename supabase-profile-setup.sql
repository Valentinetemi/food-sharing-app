-- Enhanced User Profiles Table Setup for FoodShare App
-- Run this in your Supabase SQL Editor

-- 1. Create user_profiles table with enhanced fields
CREATE TABLE
IF NOT EXISTS user_profiles
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid
(),
    firebase_uid TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP
WITH TIME ZONE DEFAULT NOW
(),
    updated_at TIMESTAMP
WITH TIME ZONE DEFAULT NOW
()
);

-- 2. Create storage bucket for avatars
INSERT INTO storage.buckets
    (id, name, public)
VALUES
    ('avatars', 'avatars', true)
ON CONFLICT
(id) DO NOTHING;

-- 3. Create storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
FOR
SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR
INSERT WITH CHECK
    (
    bucket_id 
 'avatars' AND
    auth.uid()

::text =
(storage.foldername
(name))[1]
);

CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR
UPDATE USING (
    bucket_id = 'avatars'
AND 
    auth.uid
()::text =
(storage.foldername
(name))[1]
);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR
DELETE USING (
    bucket_id
= 'avatars' AND 
    auth.uid
()::text =
(storage.foldername
(name))[1]
);

-- 4. Create RLS policies for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view all profiles
CREATE POLICY "Profiles are viewable by everyone" ON user_profiles
FOR
SELECT USING (true);

-- Users can only insert their own profile
CREATE POLICY "Users can insert their own profile" ON user_profiles
FOR
INSERT WITH CHECK (auth.uid()::
text
=
firebase_uid
);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile" ON user_profiles
FOR
UPDATE USING (auth.uid()
::text = firebase_uid);

-- Users can only delete their own profile
CREATE POLICY "Users can delete their own profile" ON user_profiles
FOR
DELETE USING (auth.uid
()::text = firebase_uid);

-- 5. Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column
()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW
();
RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE
UPDATE ON user_profiles 
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

-- 7. Create index for faster lookups
CREATE INDEX
IF NOT EXISTS idx_user_profiles_firebase_uid ON user_profiles
(firebase_uid);
CREATE INDEX
IF NOT EXISTS idx_user_profiles_username ON user_profiles
(username);

-- 8. Update existing posts table to include user profile information
-- First, let's check if we need to add columns to posts table
DO $$ 
BEGIN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'user_id') THEN
    ALTER TABLE posts ADD COLUMN user_id TEXT;
END
IF;
    
    -- Add author_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1
FROM information_schema.columns
WHERE table_name = 'posts' AND column_name = 'author_name') THEN
ALTER TABLE posts ADD COLUMN author_name TEXT;
END
IF;
    
    -- Add author_username column if it doesn't exist
    IF NOT EXISTS (SELECT 1
FROM information_schema.columns
WHERE table_name = 'posts' AND column_name = 'author_username') THEN
ALTER TABLE posts ADD COLUMN author_username TEXT;
END
IF;
    
    -- Add author_avatar column if it doesn't exist
    IF NOT EXISTS (SELECT 1
FROM information_schema.columns
WHERE table_name = 'posts' AND column_name = 'author_avatar') THEN
ALTER TABLE posts ADD COLUMN author_avatar TEXT;
END
IF;
END $$;

-- 9. Create function to sync user profile data to posts
CREATE OR REPLACE FUNCTION sync_user_profile_to_posts
()
RETURNS TRIGGER AS $$
BEGIN
    -- Update all posts by this user when profile is updated
    UPDATE posts 
    SET 
        author_name = NEW.name,
        author_username = NEW.username,
        author_avatar = NEW.avatar_url
    WHERE user_id = NEW.firebase_uid;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Create trigger to sync profile changes to posts
CREATE TRIGGER sync_profile_to_posts_trigger
    AFTER
UPDATE ON user_profiles
    FOR EACH ROW
EXECUTE FUNCTION sync_user_profile_to_posts
();

-- 11. Create function to get user profile by Firebase UID
CREATE OR REPLACE FUNCTION get_user_profile
(firebase_uid_param TEXT)
RETURNS TABLE
(
    id UUID,
    firebase_uid TEXT,
    email TEXT,
    name TEXT,
    username TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP
WITH TIME ZONE,
    updated_at TIMESTAMP
WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        up.id,
        up.firebase_uid,
        up.email,
        up.name,
        up.username,
        up.avatar_url,
        up.bio,
        up.created_at,
        up.updated_at
    FROM user_profiles up
    WHERE up.firebase_uid = firebase_uid_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Create function to create or update user profile
CREATE OR REPLACE FUNCTION upsert_user_profile
(
    firebase_uid_param TEXT,
    email_param TEXT,
    name_param TEXT DEFAULT NULL,
    username_param TEXT DEFAULT NULL,
    avatar_url_param TEXT DEFAULT NULL,
    bio_param TEXT DEFAULT NULL
)
RETURNS TABLE
(
    id UUID,
    firebase_uid TEXT,
    email TEXT,
    name TEXT,
    username TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP
WITH TIME ZONE,
    updated_at TIMESTAMP
WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    INSERT INTO user_profiles
        (
        firebase_uid,
        email,
        name,
        username,
        avatar_url,
        bio
        )
    VALUES
        (
            firebase_uid_param,
            email_param,
            name_param,
            username_param,
            avatar_url_param,
            bio_param
    )
    ON CONFLICT
    (firebase_uid) 
    DO
    UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, user_profiles.name),
        username = COALESCE(EXCLUDED.username, user_profiles.username),
        avatar_url = COALESCE(EXCLUDED.avatar_url, user_profiles.avatar_url),
        bio = COALESCE(EXCLUDED.bio, user_profiles.bio),
        updated_at = NOW()
    RETURNING 
        user_profiles.id,
        user_profiles.firebase_uid,
        user_profiles.email,
        user_profiles.name,
        user_profiles.username,
        user_profiles.avatar_url,
        user_profiles.bio,
        user_profiles.created_at,
        user_profiles.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON user_profiles TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile
(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION upsert_user_profile
(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- 14. Create view for posts with user profile information
CREATE OR REPLACE VIEW posts_with_profiles AS
SELECT
    p.*,
    up.name as author_name,
    up.username as author_username,
    up.avatar_url as author_avatar
FROM posts p
    LEFT JOIN user_profiles up ON p.user_id = up.firebase_uid;

-- Grant access to the view
GRANT SELECT ON posts_with_profiles TO anon, authenticated;

-- Success message
SELECT 'User profiles setup completed successfully!' as message;
