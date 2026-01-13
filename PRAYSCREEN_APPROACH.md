# Implementing PrayScreen-Like App Interruption

## 🎯 How PrayScreen Works

PrayScreen achieves true app interruption through:

### Android (Their Core Approach)
1. **Foreground Service** - Runs continuously in background monitoring time
2. **System Overlay Window** - Uses `SYSTEM_ALERT_WINDOW` permission to draw over all apps
3. **Full-Screen Intent** - Launches full-screen activity at prayer time
4. **Device Admin API** - Optional: Locks device completely
5. **Accessibility Service** - Monitors which app user is in

### iOS
- **Cannot truly interrupt** - iOS restrictions prevent this
- Uses prominent notifications + critical alerts
- Requires user to tap notification

## 🚧 Current Limitations with Expo

**Expo Managed Workflow Cannot:**
- ❌ Create native foreground services
- ❌ Use device admin APIs
- ❌ Create system overlay windows
- ❌ Force app to foreground without user action
- ❌ Monitor other apps usage (accessibility services)

**What Expo CAN Do:**
- ✅ Send high-priority notifications
- ✅ Show full-screen modal when app opens
- ✅ Request `SYSTEM_ALERT_WINDOW` permission (but can't use it without native code)
- ✅ Use background tasks (limited)

## 🎯 Three Approaches

### Approach 1: Maximum Expo (Current Implementation)
**What we have now:**
- High-priority notifications with action buttons
- Automatic lock screen if app is open
- Deep linking to lock screen
- One-tap from notification

**Limitations:**
- Requires user to tap notification if app is closed
- Can't force-open over other apps
- No true "blocking"

### Approach 2: Expo Development Build + Config Plugin
**Add custom native code via config plugin:**
```javascript
// app.json
{
  "expo": {
    "plugins": [
      "./plugins/withPrayerOverlay.js" // Custom plugin
    ]
  }
}
```

This allows:
- ✅ Native Android code for overlay
- ✅ Foreground service for time monitoring
- ✅ True full-screen interruption
- ⚠️ Requires `expo prebuild` + development build
- ⚠️ More complex to maintain

### Approach 3: Bare React Native (Full Control)
**Eject from Expo entirely:**
```bash
npx expo prebuild --clean
```

Then add native modules:
- ✅ Full access to Android APIs
- ✅ Can implement exactly like PrayScreen
- ✅ Complete control over behavior
- ❌ Lose Expo's convenience
- ❌ More complex builds

## 🚀 Recommended Solution: Config Plugin Approach

I'll create a custom Expo config plugin that adds native Android code for true interruption while staying in Expo ecosystem.

### What This Enables:

#### Android Features
1. **Foreground Service**
   - Monitors time continuously
   - Minimal battery impact
   - Shows in notification tray (required)

2. **Full-Screen Overlay**
   - Appears over any app at prayer time
   - Uses `SYSTEM_ALERT_WINDOW`
   - Shows your lock screen UI

3. **Wake Screen**
   - Wakes device if screen is off
   - Uses `WAKE_LOCK` permission

4. **True Blocking**
   - Prevents interaction with other apps
   - Must complete prayer or dismiss

#### iOS (Still Limited)
- Critical alerts (requires Apple entitlement)
- Time-sensitive notifications
- Still requires user tap (no workaround)

## 📋 Implementation Plan

### Phase 1: Create Config Plugin (Native Code)
```
plugins/
  withPrayerOverlay.js         # Expo config plugin
  android/
    PrayerOverlayModule.java   # Native Android module
    PrayerForegroundService.java # Background service
    PrayerOverlayActivity.java  # Full-screen activity
```

### Phase 2: Bridge to React Native
```typescript
// services/nativePrayerService.ts
import { NativeModules } from 'react-native';

const { PrayerOverlay } = NativeModules;

export async function showPrayerOverlay(data) {
  return await PrayerOverlay.show(data);
}

export async function startPrayerMonitoring() {
  return await PrayerOverlay.startService();
}
```

### Phase 3: Integrate with Existing Code
Update prayer schedule sync to use native service:
```typescript
// When schedule changes
await startPrayerMonitoring(settings.prayerSchedule);
```

## 🛠️ Do You Want Me To Implement This?

I can create the config plugin + native code for true PrayScreen-like behavior. This will require:

### Prerequisites
1. Switch to development build (no longer Expo Go)
2. Run `expo prebuild` to generate native folders
3. Build app with EAS or locally

### What You'll Get
- ✅ True full-screen interruption at prayer time
- ✅ Works even when app is closed
- ✅ Blocks other apps until prayer completed
- ✅ Minimal battery impact
- ✅ Still uses Expo for most features

### Trade-offs
- ⚠️ Can't test in Expo Go anymore (need dev build)
- ⚠️ Slightly more complex builds
- ⚠️ Need to run `expo prebuild` when plugin changes

## 🎬 Quick Start (If You Agree)

If you want me to implement the config plugin approach:

1. **I'll create:**
   - Config plugin file
   - Native Android code for overlay
   - Foreground service for monitoring
   - Bridge to React Native
   - Updated notification service

2. **You'll need to:**
   ```bash
   # Generate native code
   npx expo prebuild --clean

   # Build development build
   eas build --profile development --platform android

   # Or build locally
   npx expo run:android
   ```

3. **Result:**
   - App behaves exactly like PrayScreen
   - True interruption at prayer times
   - Blocks whatever app user is using

## 🤔 Alternative: Use Existing Library

There's also `react-native-lock-screen` but it requires bare React Native. Would need ejecting from Expo entirely.

## ❓ Your Choice

Which approach do you prefer?

**Option A: Keep Current Implementation**
- Pros: Works now, no changes needed
- Cons: Requires user to tap notification

**Option B: Config Plugin (Recommended)**
- Pros: True interruption, stay in Expo ecosystem
- Cons: Need development build, can't use Expo Go

**Option C: Full Eject to Bare RN**
- Pros: Complete control
- Cons: Lose Expo convenience

**Option D: Just Improve Current**
- Make notification even more prominent
- Add vibration patterns
- Increase notification priority
- Better UX around tapping

Let me know which you'd like and I'll implement it!
