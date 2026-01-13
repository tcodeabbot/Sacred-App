# Prayer Schedule - Supabase Integration Guide

This document explains the complete integration of the Prayer Schedule feature with Supabase backend and automatic notification system.

## 🎯 What Was Implemented

### 1. **Automatic Prayer Lock Screen**
- At scheduled prayer times, the app automatically shows a full-screen prayer lock screen
- Blocks all user-configured apps during prayer time
- Displays customizable prayer duration for each scheduled prayer
- Works both when app is in foreground and background

### 2. **Database Integration**
- Full CRUD operations for prayer schedules in Supabase
- Real-time sync between local state and database
- Automatic loading of prayer schedule on app start
- Optimistic UI updates with database sync

### 3. **Notification System**
- Native iOS/Android notifications trigger at scheduled times
- Automatic sync of notifications when schedule changes
- Notifications include prayer name, time, and duration
- Proper handling of foreground and background notifications

## 📁 Files Modified/Created

### Core Integration Files

#### 1. **[supabase/migrations/002_add_prayer_schedule.sql](supabase/migrations/002_add_prayer_schedule.sql)**
- ✅ Creates `prayer_schedule` table with all required fields
- ✅ Adds Row Level Security policies
- ✅ Creates default prayer schedule on user signup
- ✅ Includes `duration` (minutes) and `selected_prayer_id` fields

**Schema:**
```sql
CREATE TABLE prayer_schedule (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  time TEXT NOT NULL, -- "HH:mm" format
  duration INTEGER DEFAULT 5, -- minutes
  enabled BOOLEAN DEFAULT TRUE,
  selected_prayer_id UUID REFERENCES prayers(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. **[lib/database.ts](lib/database.ts:407-543)**
- ✅ `getPrayerSchedule(userId)` - Fetch user's prayer schedule
- ✅ `createPrayerScheduleItem(userId, item)` - Add new prayer
- ✅ `updatePrayerScheduleItem(itemId, updates)` - Update prayer details
- ✅ `deletePrayerScheduleItem(itemId)` - Delete prayer
- ✅ `updatePrayerSchedule(userId, schedule)` - Bulk update schedule
- All functions properly map between snake_case (database) and camelCase (app)

#### 3. **[services/notificationService.ts](services/notificationService.ts)**
- ✅ `syncPrayerScheduleItems(scheduleItems)` - Syncs schedule with notifications
- ✅ Includes prayer duration in notification data
- ✅ Uses CalendarTriggerInput for daily repeating notifications
- ✅ Cancels old notifications before creating new ones

#### 4. **[store/useAppStore.ts](store/useAppStore.ts)**
- ✅ Added `loadPrayerSchedule(userId)` function
- ✅ Loads prayer schedule from database on app start
- ✅ Syncs with notification system after loading
- ✅ Handles errors gracefully (falls back to local state)

#### 5. **[app/_layout.tsx](app/_layout.tsx)**
- ✅ Loads prayer schedule from database when user authenticates
- ✅ Syncs notifications when schedule changes
- ✅ Listens for notification events (foreground & background)
- ✅ Triggers prayer lock screen with correct duration
- ✅ Passes `currentDuration` to PrayerLockScreen component

#### 6. **[components/PrayerLockScreen.tsx](components/PrayerLockScreen.tsx)**
- ✅ Accepts `duration` prop (in minutes)
- ✅ Displays countdown timer for specified duration
- ✅ Shows prayer name and blocked apps count
- ✅ Full-screen modal that blocks app interaction

#### 7. **[store/usePrayerStore.ts](store/usePrayerStore.ts)**
- ✅ Added `currentDuration` state
- ✅ Updated `showLockScreen()` to accept duration parameter
- ✅ Stores duration when lock screen is triggered

#### 8. **[app/(modals)/prayer-schedule.tsx](app/(modals)/prayer-schedule.tsx:1-150)**
- ✅ Already integrated with database (loads on mount)
- ✅ CRUD operations sync to database
- ✅ Duration picker for each prayer (2-60 minutes)
- ✅ Optimistic UI updates with database sync

## 🔄 How It Works - Data Flow

### On App Start
```
1. User opens app
2. _layout.tsx calls initializeAuth()
3. Once authenticated, loadPrayerSchedule(userId) is called
4. Prayer schedule is fetched from Supabase
5. Local store is updated with database data
6. syncPrayerScheduleItems() schedules system notifications
7. Notifications are now active for all enabled prayers
```

### When User Changes Schedule
```
1. User edits prayer in prayer-schedule.tsx
2. UI updates immediately (optimistic update)
3. updatePrayerScheduleItem() saves to database
4. useAppStore.updateSettings() updates local state
5. useEffect in _layout.tsx detects settings change
6. syncPrayerScheduleItems() re-schedules notifications
7. Old notifications are cancelled, new ones created
```

### When Scheduled Time Arrives
```
1. iOS/Android notification fires at scheduled time
2. addNotificationReceivedListener() catches notification
3. Looks up prayer details from settings.prayerSchedule
4. Calls showLockScreen(name, prayerId, duration)
5. PrayerLockScreen component renders full-screen
6. User sees prayer name, duration, blocked apps
7. Timer counts down for specified duration
```

## 🚀 Next Steps - Complete the Integration

### Step 1: Apply Database Migration

**Option A: Using Supabase Dashboard (Easiest)**

1. Go to https://supabase.com/dashboard
2. Select your project: `fnlaskwfkgdpyjxeipnp`
3. Navigate to **SQL Editor** in the sidebar
4. Click **New Query**
5. Open [supabase/migrations/002_add_prayer_schedule.sql](supabase/migrations/002_add_prayer_schedule.sql)
6. Copy the entire file contents
7. Paste into the SQL Editor
8. Click **Run** or press `Cmd/Ctrl + Enter`
9. You should see "Success. No rows returned"

**Option B: Using Supabase CLI**

```bash
# From project root
supabase db push
```

### Step 2: Verify Migration

Run this query in SQL Editor to verify the table was created:

```sql
-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'prayer_schedule'
ORDER BY ordinal_position;
```

Expected output:
- `id` (uuid, not null)
- `user_id` (uuid, not null)
- `name` (text, not null)
- `time` (text, not null)
- `duration` (integer, nullable)
- `enabled` (boolean, nullable)
- `selected_prayer_id` (uuid, nullable)
- `sort_order` (integer, nullable)
- `created_at` (timestamp with time zone, nullable)
- `updated_at` (timestamp with time zone, nullable)

### Step 3: Test the Integration

#### Test 1: Database Sync
1. Run the app and sign in
2. Go to Prayer Schedule (tap clock icon on home)
3. Add a new prayer time
4. Check Supabase dashboard → Table Editor → `prayer_schedule`
5. Your new prayer should appear in the database

#### Test 2: Automatic Lock Screen
1. Set a prayer for 2 minutes from now
2. Make sure it's enabled (toggle on)
3. Wait for the scheduled time
4. The prayer lock screen should automatically appear!

#### Test 3: Duration Display
1. In Prayer Schedule, tap the duration for a prayer
2. Select a different duration (e.g., 10 minutes)
3. Trigger "Test Lock" button on home screen
4. Lock screen should show countdown for 10 minutes

#### Test 4: Cross-Device Sync
1. Make changes on one device
2. Reload the app on another device
3. Changes should sync from database

## 🎨 Features Implemented

### Prayer Schedule Management
- ✅ Name prayers (editable inline)
- ✅ Set prayer times (native time picker)
- ✅ Configure duration per prayer (2-60 minutes)
- ✅ Toggle prayers on/off
- ✅ Add/delete prayers
- ✅ Link scheduled prayers to custom prayer content
- ✅ Minimum 1 prayer required
- ✅ Reorder prayers (via sort_order)

### Lock Screen
- ✅ Full-screen blocking modal
- ✅ Displays prayer name
- ✅ Shows countdown timer with selected duration
- ✅ Lists number of blocked apps
- ✅ "Begin Prayer" button → starts prayer session
- ✅ "Not Now" button → dismisses lock screen
- ✅ Can't be dismissed by tapping outside (modal)

### Notification System
- ✅ Requests permissions on first launch
- ✅ Daily repeating notifications
- ✅ Custom notification title and body
- ✅ Notification includes prayer name and duration
- ✅ Works in foreground (shows lock screen immediately)
- ✅ Works in background (tap notification → shows lock screen)
- ✅ Auto-sync when schedule changes

### Database
- ✅ Row Level Security (users can only access their own data)
- ✅ Automatic default schedule on signup (4 prayers)
- ✅ Updated_at timestamp auto-updates
- ✅ Foreign key to user's custom prayers
- ✅ Cascade delete when user is deleted

## 🐛 Troubleshooting

### Migration Errors

**Error: "relation already exists"**
```sql
-- Drop the table and run migration again
DROP TABLE IF EXISTS prayer_schedule CASCADE;
```

**Error: "function update_updated_at_column does not exist"**
- Run `001_initial_schema.sql` first (creates the function)

### Notification Issues

**Notifications not appearing**
1. Check notification permissions in device settings
2. Verify notifications are enabled in the app
3. Check console logs for "Prayer schedules synced"

**Lock screen not showing**
1. Check if notification listener is registered (see console logs)
2. Verify prayer schedule has enabled prayers
3. Try "Test Lock" button to debug lock screen separately

### Database Sync Issues

**Changes not saving**
1. Check if user is authenticated (user?.id exists)
2. Check console for database errors
3. Verify RLS policies allow access

**Schedule not loading on app start**
1. Check console for "Prayer schedule loaded" message
2. Verify user is authenticated before loading
3. Check database has data for the user

## 📊 Database Queries (Useful for Debugging)

### View all schedules
```sql
SELECT * FROM prayer_schedule
ORDER BY sort_order;
```

### View schedules for specific user
```sql
SELECT * FROM prayer_schedule
WHERE user_id = 'YOUR_USER_ID'
ORDER BY sort_order;
```

### Count schedules by user
```sql
SELECT user_id, COUNT(*) as prayer_count
FROM prayer_schedule
GROUP BY user_id;
```

### Check enabled vs disabled prayers
```sql
SELECT enabled, COUNT(*) as count
FROM prayer_schedule
GROUP BY enabled;
```

## 🎯 Success Criteria

You'll know the integration is working when:

- ✅ Prayer schedules persist across app restarts
- ✅ Changes sync to database immediately
- ✅ Notifications fire at scheduled times
- ✅ Lock screen appears automatically with correct duration
- ✅ Multiple devices sync the same schedule
- ✅ Default prayers created on new user signup

## 📝 Notes

- The prayer schedule uses 24-hour time format ("HH:mm") in the database
- Durations are stored as integers (minutes)
- Notifications repeat daily at the specified time
- Lock screen countdown is calculated in seconds (duration × 60)
- The system gracefully handles offline/online transitions
- If database sync fails, the app continues using local state

## 🔗 Related Files

See also:
- [types/index.ts](types/index.ts:31-38) - PrayerScheduleItem interface
- [app/(tabs)/index.tsx](app/(tabs)/index.tsx:136-152) - Test Lock button
- [components/home/NextPrayer.tsx](components/home/NextPrayer.tsx) - Shows next scheduled prayer
- [supabase/migrations/README.md](supabase/migrations/README.md) - Migration instructions

---

**Integration Status:** ✅ Complete (pending migration application)

Last Updated: 2026-01-13
