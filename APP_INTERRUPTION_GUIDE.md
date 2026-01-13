# App Interruption & Prayer Lock Screen - Technical Guide

## 🎯 Goal
Interrupt the user's current activity (e.g., browsing Instagram) when it's prayer time and automatically show the prayer lock screen.

## ⚠️ Platform Limitations

### iOS Restrictions
**Apple does not allow apps to force themselves to the foreground** for security and privacy reasons. This is a fundamental iOS design principle.

What iOS allows:
- ✅ Send notifications with sound/vibration
- ✅ Time-sensitive notifications (appear more prominently)
- ✅ Critical alerts (requires special Apple entitlement - hard to get)
- ✅ Action buttons on notifications
- ❌ Cannot force app to open automatically
- ❌ Cannot interrupt other apps without user interaction

### Android Capabilities
Android is more permissive but still has restrictions:

What Android allows:
- ✅ Full-screen intent notifications (show full-screen over lock screen)
- ✅ Heads-up notifications (appear at top of screen, even in other apps)
- ✅ High-priority notifications that demand attention
- ✅ Bypass Do Not Disturb mode
- ✅ Draw over other apps (requires permission)
- ⚠️ Still requires user to tap notification in most cases
- ❌ Cannot force-open app without user action (Android 10+)

## 🚀 What We Implemented

### 1. **Maximum Priority Notifications**

#### Android
[services/notificationService.ts](services/notificationService.ts:36-48)
```typescript
await Notifications.setNotificationChannelAsync('prayer-reminders', {
  importance: Notifications.AndroidImportance.MAX,
  bypassDnd: true, // Bypass Do Not Disturb
  lockscreenVisibility: PUBLIC,
  enableVibrate: true,
  enableLights: true,
});
```

- Uses highest importance level
- Bypasses Do Not Disturb
- Shows on lock screen
- Vibration + LED notification light

#### iOS
```typescript
interruptionLevel: 'timeSensitive', // iOS 15+
```

- Time-sensitive notifications appear more prominently
- Break through Focus modes
- Show as banners even when device is in use

### 2. **Action Buttons**
[services/notificationService.ts](services/notificationService.ts:53-72)

Added action buttons to notifications:
- **"Begin Prayer"** - Opens app and shows lock screen immediately
- **"Not Now"** - Dismisses notification

Benefits:
- ✅ One-tap access to prayer
- ✅ `opensAppToForeground: true` brings app front
- ✅ Works on both iOS and Android

### 3. **Automatic Lock Screen (When App is Foreground)**

If the user has your app open when prayer time arrives:
- ✅ Lock screen appears **automatically** (no tap needed)
- ✅ Full-screen modal blocks interaction
- ✅ Shows prayer name, duration, countdown

[app/_layout.tsx](app/_layout.tsx:58-69)
```typescript
addNotificationReceivedListener((notification) => {
  // App is in foreground - show lock screen automatically
  showLockScreen(scheduleName, prayerId, duration);
});
```

### 4. **Deep Linking**

[app/_layout.tsx](app/_layout.tsx:97-130)
Created `sacred://prayer-lock` deep link scheme:
- Notification opens app directly to lock screen
- No intermediate screens
- Preserves prayer context (name, duration, etc.)

### 5. **Persistent Notifications**

```typescript
sticky: true,
autoDismiss: false,
```

- Notification stays visible until dismissed
- User can't accidentally swipe away
- Remains accessible from notification center

### 6. **Android Permissions**

[app.json](app.json:39-42)
```json
"permissions": [
  "USE_FULL_SCREEN_INTENT",
  "SYSTEM_ALERT_WINDOW",
  "WAKE_LOCK"
]
```

- `USE_FULL_SCREEN_INTENT` - Show full-screen notifications
- `SYSTEM_ALERT_WINDOW` - Draw over other apps
- `WAKE_LOCK` - Wake device when notification fires

## 📱 How It Works - User Experience

### Scenario 1: User is browsing Instagram when prayer time arrives

**Android:**
1. High-priority notification appears as heads-up banner over Instagram
2. Phone vibrates, LED blinks, sound plays
3. User sees: "🙏 Time for Prayer - Morning Prayer"
4. Notification has "Begin Prayer" button prominently displayed
5. User taps "Begin Prayer" → Sacred app opens to lock screen
6. Lock screen blocks further action until prayer completed/dismissed

**iOS:**
1. Time-sensitive banner appears at top of screen
2. Phone makes notification sound
3. User sees: "🙏 Time for Prayer - Morning Prayer"
4. User swipes down or taps notification
5. Chooses "Begin Prayer" action
6. Sacred app opens to lock screen

### Scenario 2: User already has Sacred app open

**Both platforms:**
1. Notification fires at scheduled time
2. Lock screen appears **automatically and immediately**
3. No user action required
4. Full-screen modal blocks app interaction
5. Timer counts down specified duration

### Scenario 3: Phone is locked when prayer time arrives

**Android:**
1. Notification appears on lock screen (full-screen possible)
2. Phone wakes up with vibration/sound
3. User unlocks phone and sees notification
4. Taps "Begin Prayer" → Lock screen appears

**iOS:**
1. Notification appears on lock screen
2. Phone makes sound/vibration
3. User unlocks phone
4. Swipes on notification → Opens to lock screen

## 🔧 Advanced: True App Interruption (Technical)

For apps like alarm clocks that need to truly interrupt, there are advanced solutions:

### Option A: Background Task (Android)
Use `expo-task-manager` with background fetch:
```typescript
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

// Check prayer times every minute in background
// When time matches, forcefully open app
```

**Limitations:**
- Battery intensive
- May be killed by OS
- Unreliable on iOS (max 30 seconds background time)

### Option B: Native Module (Android)
Create custom native module that:
- Runs as foreground service
- Checks prayer times continuously
- Launches full-screen activity when time arrives

**Downsides:**
- Requires native Android code (Java/Kotlin)
- Drains battery
- May be killed by aggressive battery optimizers

### Option C: VoIP Notifications (iOS)
Use PushKit VoIP notifications:
- Designed for call apps (WhatsApp, Skype)
- Can wake app from background
- **Requires Apple approval** (rejected if not actually VoIP)

## ✅ Recommended Approach (Current Implementation)

The current implementation is the **best balance** of:
- ✅ Reliability (works consistently)
- ✅ Battery efficiency (minimal power use)
- ✅ Platform compliance (won't be rejected by app stores)
- ✅ User experience (prominent but not abusive)
- ✅ Respects user agency (user chooses to respond)

## 🎨 Design Philosophy

### Why One-Tap is Better Than Zero-Tap

**Religious apps should encourage mindful participation, not force it.**

Benefits of requiring one tap:
1. **User Consent**: User actively chooses to pray
2. **Context Awareness**: User can finish urgent task first
3. **Not Intrusive**: Doesn't violate social norms
4. **App Store Compliant**: Won't be rejected for abuse
5. **Better UX**: Respects user's current context

Apps that force-interrupt (0-tap):
- Alarm clocks (safety critical)
- Incoming phone calls (time-sensitive communication)
- Emergency alerts (literal emergencies)

Prayer is important but not an emergency. A prominent notification with one-tap access strikes the right balance.

## 📊 Comparison with Competitors

### AlarmManager (Android Alarms)
- Uses `SET_ALARM_CLOCK` permission
- Shows UI even when screen off
- Designed for critical wake-up alarms
- Overkill for prayer reminders

### Apple's Reminders App
- Uses standard notifications
- Requires user to tap
- Time-sensitive badges
- Similar to our approach ✅

### Muslim Pro App
- High-priority notifications
- Action buttons for quick Adhan
- One-tap to open
- Similar to our approach ✅

## 🐛 Troubleshooting

### "Notification doesn't appear"
1. Check notification permissions in Settings
2. Verify prayer schedule is enabled
3. Check Do Not Disturb settings
4. Android: Check battery optimization (whitelist Sacred app)

### "App doesn't open when tapping notification"
1. Check deep linking is configured
2. Verify URL scheme in [app.json](app.json:9)
3. Test with `npx uri-scheme open sacred://prayer-lock --ios`

### "Lock screen doesn't show"
1. Check if app is in foreground when notification fires
2. Verify notification listener is registered (check logs)
3. Test with "Test Lock" button first

### "Works in development but not production"
1. Rebuild app after changing permissions
2. Verify `app.json` permissions are in build
3. Check AndroidManifest.xml in built APK

## 📝 Testing Guide

### Test 1: Foreground Interruption
1. Open Sacred app
2. Navigate to Home screen
3. Schedule prayer for 1 minute from now
4. Wait...
5. ✅ Lock screen should appear automatically

### Test 2: Background Notification (Android)
1. Schedule prayer for 1 minute from now
2. Switch to Instagram (or any app)
3. Wait for notification
4. ✅ Heads-up notification should appear over Instagram
5. Tap "Begin Prayer"
6. ✅ Sacred app opens with lock screen

### Test 3: Lock Screen Notification
1. Schedule prayer for 1 minute from now
2. Lock your phone
3. Wait for notification
4. ✅ Phone should wake with sound/vibration
5. ✅ Notification visible on lock screen
6. Unlock phone, tap notification
7. ✅ App opens to lock screen

### Test 4: Do Not Disturb (Android)
1. Enable Do Not Disturb mode
2. Schedule prayer for 1 minute from now
3. Wait...
4. ✅ Notification should still appear (bypasses DND)

## 🚀 Future Enhancements

### Possible Improvements
1. **Wear OS/Apple Watch** - Haptic notification on wrist
2. **Smart Home Integration** - Trigger lights/sounds
3. **Location-Based** - Adjust volume based on location
4. **ML-Based Timing** - Learn best times from user behavior
5. **Family Mode** - Sync prayer times with family members

### What We Won't Do
- ❌ Force-open app without user consent
- ❌ Aggressive battery-draining background tasks
- ❌ Violate platform guidelines
- ❌ Trick users into granting permissions

## 📄 Related Files

- [services/notificationService.ts](services/notificationService.ts) - Notification scheduling
- [services/prayerInterruptService.ts](services/prayerInterruptService.ts) - Deep linking & interruption logic
- [app/_layout.tsx](app/_layout.tsx) - Notification listeners & deep link handling
- [components/PrayerLockScreen.tsx](components/PrayerLockScreen.tsx) - Lock screen UI
- [app.json](app.json) - Android permissions configuration

## 🎯 Summary

**What users see:**
- ⏰ Loud, prominent notification at prayer time
- 📱 Notification appears over whatever app they're using (Android)
- 👆 One tap on "Begin Prayer" → Full-screen lock screen
- 🔒 App automatically blocks if already open

**What we can't do (platform limitations):**
- ❌ Force app to open without any user interaction
- ❌ Completely interrupt and block other apps (iOS restriction)

**Result:**
Best possible UX within platform constraints. Respectful, effective, and app-store compliant.

---

Last Updated: 2026-01-13
