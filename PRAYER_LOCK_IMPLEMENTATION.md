## Prayer Lock Screen Implementation Guide

This guide explains how the prayer scheduling and screen lock system works in the Sacred app.

## Overview

The system has 3 main components:

1. **Notification Service** - Schedules prayer times
2. **Prayer Lock Screen** - Full-screen modal that appears at prayer time
3. **Prayer Session** - Guided prayer experience

## How It Works

### 1. User Sets Prayer Schedules

Users can configure when they want to be reminded to pray:
- Morning Prayer (7:00 AM)
- Midday Prayer (12:00 PM)
- Evening Prayer (9:00 PM)

### 2. Notifications Trigger

At the scheduled time:
- Local notification appears
- When user taps notification → Prayer Lock Screen shows
- Lock screen prevents dismissal easily
- User must either start prayer or explicitly dismiss

### 3. Prayer Session

User goes through guided prayer:
- Choose mode (Silent, Scripture, or Journal)
- Timer tracks duration
- Complete prayer → Stats updated

## Integration Steps

### Step 1: Initialize in App Root

Add to your root layout (`app/_layout.tsx`):

```typescript
import { useEffect } from 'react';
import { usePrayerStore } from '@/store/usePrayerStore';
import {
  addNotificationResponseListener,
  addNotificationReceivedListener,
} from '@/services/notificationService';

export default function RootLayout() {
  const { showLockScreen, initialize } = usePrayerStore();

  useEffect(() => {
    // Initialize prayer schedules
    initialize();

    // Listen for notification taps
    const subscription1 = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      if (data.type === 'prayer-reminder') {
        showLockScreen(data.scheduleName);
      }
    });

    // Listen for notifications when app is in foreground
    const subscription2 = addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data;
      if (data.type === 'prayer-reminder') {
        showLockScreen(data.scheduleName);
      }
    });

    return () => {
      subscription1.remove();
      subscription2.remove();
    };
  }, []);

  return (
    // ... your layout
  );
}
```

### Step 2: Add Lock Screen Component

Add to your main layout or app root:

```typescript
import { PrayerLockScreen } from '@/components/PrayerLockScreen';
import { usePrayerStore } from '@/store/usePrayerStore';
import { useAppStore } from '@/store/useAppStore';

export default function App() {
  const {
    isLockScreenVisible,
    hideLockScreen,
    currentScheduleName,
  } = usePrayerStore();

  const { blockedApps } = useAppStore();

  return (
    <>
      {/* Your app content */}

      <PrayerLockScreen
        visible={isLockScreenVisible}
        onDismiss={hideLockScreen}
        onStartPrayer={() => {
          // Navigation handled in PrayerLockScreen component
        }}
        scheduleName={currentScheduleName || undefined}
        blockedApps={blockedApps.filter(app => app.isBlocked).map(app => app.name)}
      />
    </>
  );
}
```

### Step 3: Create Schedule Management UI

Create a screen where users can manage their prayer schedules:

```typescript
import { usePrayerStore } from '@/store/usePrayerStore';

export default function PrayerSchedulesScreen() {
  const { schedules, toggleSchedule, addSchedule } = usePrayerStore();

  return (
    <View>
      {schedules.map((schedule) => (
        <View key={schedule.id}>
          <Text>{schedule.label}</Text>
          <Text>{schedule.time}</Text>
          <Switch
            value={schedule.enabled}
            onValueChange={() => toggleSchedule(schedule.id)}
          />
        </View>
      ))}

      <Button
        title="Add Schedule"
        onPress={() => {
          addSchedule({
            time: '14:00',
            days: [0, 1, 2, 3, 4, 5, 6],
            enabled: true,
            label: 'Afternoon Prayer',
          });
        }}
      />
    </View>
  );
}
```

## Testing the Lock Screen

### Test Immediately (Without Waiting)

Add a test button in your app:

```typescript
import { usePrayerStore } from '@/store/usePrayerStore';

function TestButton() {
  const { showLockScreen } = usePrayerStore();

  return (
    <Button
      title="Test Prayer Lock Screen"
      onPress={() => showLockScreen('Test Prayer')}
    />
  );
}
```

### Test Notifications

Schedule a notification for 1 minute from now:

```typescript
import * as Notifications from 'expo-notifications';

async function testNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time for Prayer 🙏',
      body: 'Test notification',
      data: { type: 'prayer-reminder', scheduleName: 'Test Prayer' },
    },
    trigger: {
      seconds: 60,
    },
  });
}
```

## Flow Diagram

```
User Sets Schedule (7:00 AM)
         ↓
System Schedules Notification
         ↓
7:00 AM → Notification Appears
         ↓
User Taps Notification
         ↓
Prayer Lock Screen Shows (Full Screen)
         ↓
User Taps "Begin Prayer"
         ↓
Prayer Session Screen (with timer)
         ↓
User Completes Prayer
         ↓
Stats Updated + Session Saved
         ↓
Back to App
```

## Customization

### Change Lock Screen Colors

Edit `components/PrayerLockScreen.tsx`:

```typescript
<LinearGradient
  colors={['#yourColor1', '#yourColor2', '#yourColor3']}
  // ...
/>
```

### Add More Prayer Modes

Edit `app/prayer-session.tsx` and add new modes to the `mode` state.

### Customize Notification Sound

1. Add your sound file to `assets/sounds/`
2. Update `app.json`:
```json
{
  "expo": {
    "plugins": [
      ["expo-notifications", {
        "sounds": ["./assets/sounds/your-sound.mp3"]
      }]
    ]
  }
}
```

## Troubleshooting

**Notifications not appearing:**
- Check permissions: Settings → Sacred → Notifications
- Verify schedules are enabled in `usePrayerStore`
- Check notification log: `getAllScheduledNotifications()`

**Lock screen not showing:**
- Verify `isLockScreenVisible` state
- Check notification listener setup
- Test manually with test button

**Stats not updating:**
- Ensure database migration was run
- Check user is authenticated
- Verify `updateUserStatsAfterPrayer` is called

## Next Steps

1. Add database migration (see SUPABASE_DATABASE_SETUP.md)
2. Test on physical device for notifications
3. Customize prayer modes and content
4. Add grace days logic
5. Implement blocked apps integration
