# Supabase Setup Guide for FoodShare App

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Wait for the project to be set up (this may take a few minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon public** key
3. Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 3: Create the Users Table

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `supabase-setup.sql` into the editor
3. Click **Run** to execute the SQL

## Step 4: Verify Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see a `users` table with the following columns:
   - `id` (UUID, Primary Key)
   - `email` (Text, Unique)
   - `name` (Text)
   - `created_at` (Timestamp)
   - `updated_at` (Timestamp)

## Step 5: Test the Integration

1. Restart your Next.js development server
2. Try signing up a new user
3. Check your Supabase dashboard → **Table Editor** → **users** to see if the user was created

## Troubleshooting

### If users aren't being created:
1. Check your browser console for errors
2. Verify your environment variables are correct
3. Make sure the SQL script ran successfully
4. Check that Row Level Security (RLS) policies are set up correctly

### If you get authentication errors:
1. Make sure you're using the **anon public** key, not the service role key
2. Verify your Supabase URL is correct
3. Check that your project is active and not paused

## Security Notes

- The setup includes Row Level Security (RLS) policies
- Users can only access their own data
- The `id` field uses the Firebase UID for consistency
- Email addresses are unique to prevent duplicates
