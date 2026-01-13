# 🚀 Quick Start - Native Prayer Interruption

## TL;DR

Sacred now has **PrayScreen-exact behavior on BOTH iOS and Android**!

- **Android**: Native overlay service
- **iOS**: Screen Time API with automatic app shielding

## Commands to Run (In Order)

### For Both Platforms

```bash
# 1. Generate native folders
npx expo prebuild --clean

# 2. Copy native files
# Android
node scripts/copy-native-prayer-files.js

# iOS
node scripts/copy-ios-native-files.js

# 3. Build and run
npx expo run:android
# OR
npx expo run:ios

# 4. For production build
eas build --profile development --platform all
```

## What You'll Get

### ✅ Android
- **Full-screen prayer overlay** appears over ANY app
- Works exactly like PrayScreen
- No user tap required
- Blocks current app until prayer completed

### ✅ iOS  
- **Screen Time shields** block selected apps
- System-wide blocking (not just notification)
- Automatic at prayer times
- **EXACTLY like PrayScreen!**

## Quick Test

### Android
1. Open app
2. Tap "Test Lock" → Should see lock screen immediately ✅
3. Go to Prayer Schedule
4. Set prayer for 2 minutes from now
5. **Close app and open Instagram**
6. Wait...
7. **BOOM! Prayer overlay appears over Instagram** ✅

### iOS
1. Open app
2. Grant Family Controls permission when prompted
3. Select apps to block (Instagram, TikTok, etc.)
4. Set prayer for 2 minutes from now
5. **Close app and open Instagram**
6. Wait...
7. **BOOM! iOS shield blocks Instagram** ✅

## iOS Special Requirements

⚠️ **iOS requires Apple entitlement:**
1. Join Apple Developer Program ($99/year)
2. Request Family Controls entitlement: https://developer.apple.com/contact/request/family-controls-distribution
3. Wait 1-2 weeks for approval
4. Add entitlement to provisioning profile

See [IOS_SCREEN_TIME_GUIDE.md](IOS_SCREEN_TIME_GUIDE.md) for full iOS setup.

## Files Created

**iOS Native:**
- `ios-native/prayer/PrayerScreenTimeManager.swift` - Screen Time manager
- `ios-native/prayer/PrayerScreenTimeManager.m` - Objective-C bridge
- `ios-native/prayer/PrayerActivityMonitor.swift` - Auto shield trigger

**Android Native:**
- `android-native/prayer/*.java` - Native modules (4 files)

**Unified Bridge:**
- `services/iosScreenTime.ts` - iOS Screen Time bridge
- `services/prayerInterruption.ts` - Unified service (both platforms)

**Docs:**
- [IOS_SCREEN_TIME_GUIDE.md](IOS_SCREEN_TIME_GUIDE.md) - Complete iOS guide
- [NATIVE_PRAYER_SETUP.md](NATIVE_PRAYER_SETUP.md) - Android setup guide
- [PRAYSCREEN_APPROACH.md](PRAYSCREEN_APPROACH.md) - Technical details

## Comparison: iOS vs Android

| Feature | iOS | Android |
|---------|-----|---------|
| **Auto Block** | ✅ Screen Time shields | ✅ Full-screen overlay |
| **System-wide** | ✅ Yes | ✅ Yes |
| **No Tap Required** | ✅ Yes | ✅ Yes |
| **Works When Closed** | ✅ Yes | ✅ Yes |
| **Setup** | Requires Apple approval | Standard permissions |

## Troubleshooting

**"Module not found" (Android)**
→ Run steps 1 & 2 again, then rebuild

**"Permission denied" (Android)**
→ Settings → Apps → Sacred → Display over other apps → Enable

**"Family Controls not authorized" (iOS)**
→ Run app, grant permission when prompted

**"Entitlement not found" (iOS)**
→ Request entitlement from Apple first

See full troubleshooting in platform-specific guides.

## That's It!

**BOTH iOS and Android** now have true PrayScreen-like app blocking! 🎉

- Read [IOS_SCREEN_TIME_GUIDE.md](IOS_SCREEN_TIME_GUIDE.md) for iOS details
- Read [NATIVE_PRAYER_SETUP.md](NATIVE_PRAYER_SETUP.md) for Android details

