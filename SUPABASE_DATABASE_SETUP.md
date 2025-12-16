# Supabase Database Setup Guide

## Overview
This guide will help you set up the database schema for the Sacred app in your Supabase project.

## Database Schema

The schema includes the following tables:
- **profiles** - Extended user profile information
- **user_settings** - User preferences and configuration
- **user_stats** - Streak tracking and prayer statistics
- **prayer_sessions** - Records of all prayer sessions
- **blocked_apps** - User's list of apps to pause
- **scripture_reflections** - User's saved scripture reflections

## Setup Instructions

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://fnlaskwfkgdpyjxeipnp.supabase.co

2. Navigate to **SQL Editor** in the left sidebar

3. Click **New Query**

4. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`

5. Paste it into the SQL editor

6. Click **Run** to execute the migration

7. Verify the tables were created:
   - Go to **Table Editor** in the left sidebar
   - You should see all the new tables listed

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref fnlaskwfkgdpyjxeipnp

# Run the migration
supabase db push
```

## What Happens Automatically

### When a new user signs up:
1. A **profile** record is created with their email and name
2. **Default settings** are created (5min pause, 3 prayers/day goal, etc.)
3. **Initial stats** are created (0 streak, 0 total prayers, etc.)

### When a prayer session is completed:
- You can call the `update_stats_after_prayer()` function to automatically:
  - Update total prayers and minutes
  - Calculate and update streaks
  - Track weekly prayer distribution
  - Reset grace days counter

## Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only view/edit their own data
- Data is automatically filtered by `user_id`
- Authentication is required for all operations

## Testing the Setup

After running the migration, test by:

1. **Check if trigger works**: Sign up a new user and verify:
   ```sql
   SELECT * FROM profiles WHERE email = 'test@example.com';
   SELECT * FROM user_settings WHERE user_id = 'user-uuid';
   SELECT * FROM user_stats WHERE user_id = 'user-uuid';
   ```

2. **Test RLS policies**: Try to insert/query data while authenticated

## Next Steps

1. Run the migration using one of the options above
2. Update your app code to use the database helper functions
3. Test authentication flow end-to-end
4. Verify data is being saved correctly

## Troubleshooting

**Error: "relation already exists"**
- The table already exists. You can either:
  - Drop the existing tables first: `DROP TABLE table_name CASCADE;`
  - Or skip the migration if it's already applied

**Error: "permission denied"**
- Make sure you're using the service role key or database password
- Check that RLS policies are configured correctly

**Users not getting default settings/stats**
- Check the trigger is active: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
- Manually create for existing users if needed
