# Database Migrations

This directory contains SQL migration files for the Sacred app Supabase database.

## Running Migrations

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to your project (`fnlaskwfkgdpyjxeipnp`)
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of the migration file you want to run
6. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# From the project root directory
supabase db push
```

## Migration Files

### `001_initial_schema.sql`
- Creates the initial database schema for the app
- Includes tables for profiles, settings, stats, prayer sessions, etc.
- **Status**: Should already be applied

### `002_add_prayer_schedule.sql`
- Adds `prayer_schedule` table for user's custom prayer times
- Includes fields for name, time, duration, enabled status
- Adds support for linking scheduled prayers to user's custom prayers
- Creates default prayer schedule on user signup
- **Status**: Needs to be applied

## Current Migration Status

To check which migrations have been applied, run this query in the SQL Editor:

```sql
SELECT * FROM _prisma_migrations ORDER BY finished_at DESC;
```

## Applying Migration 002

To apply the prayer schedule migration:

1. Open Supabase Dashboard → SQL Editor
2. Copy the entire contents of `002_add_prayer_schedule.sql`
3. Paste into a new query
4. Run the query
5. Verify the table was created:

```sql
SELECT * FROM prayer_schedule LIMIT 10;
```

## Verifying the Migration

After running the migration, verify it worked:

```sql
-- Check if the table exists and has the correct columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'prayer_schedule'
ORDER BY ordinal_position;
```

Expected columns:
- `id` (uuid)
- `user_id` (uuid)
- `name` (text)
- `time` (text)
- `duration` (integer)
- `enabled` (boolean)
- `selected_prayer_id` (uuid, nullable)
- `sort_order` (integer)
- `created_at` (timestamp with time zone)
- `updated_at` (timestamp with time zone)

## Troubleshooting

### Error: "relation already exists"
The migration has already been run. You can skip it or drop the table first:
```sql
DROP TABLE IF EXISTS prayer_schedule CASCADE;
```
Then run the migration again.

### Error: "permission denied"
Make sure you're logged in to the correct Supabase project and have admin permissions.

### Error: "function does not exist"
Make sure `001_initial_schema.sql` has been run first, as it creates necessary functions.
