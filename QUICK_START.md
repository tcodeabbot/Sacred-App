# 🚀 Quick Start - Native Prayer Interruption

## Commands to Run (In Order)

```bash
# 1. Generate native folders
npx expo prebuild --clean

# 2. Copy native prayer files
node scripts/copy-native-prayer-files.js

# 3. Build and run
npx expo run:android
# OR
npx expo run:ios

# 4. For production build
eas build --profile development --platform android
```

## What You'll Get

### ✅ Android
- **Full-screen prayer overlay** appears over ANY app
- Works exactly like PrayScreen
- No user tap required
- Blocks current app until prayer completed

### ✅ iOS
- Time-sensitive notifications
- One-tap to prayer
- Best possible (Apple doesn't allow forced interruption)

## Quick Test

1. Open app
2. Tap "Test Lock" → Should see lock screen immediately ✅
3. Go to Prayer Schedule
4. Set prayer for 2 minutes from now
5. **Close app and open Instagram**
6. Wait...
7. **BOOM! Prayer overlay appears over Instagram** ✅

## Files Created

**Native Android:**
- `android-native/prayer/*.java` - Native modules

**Bridge:**
- `services/nativePrayerOverlay.ts` - TypeScript bridge

**Docs:**
- [NATIVE_PRAYER_SETUP.md](NATIVE_PRAYER_SETUP.md) - Full setup guide
- [PRAYSCREEN_APPROACH.md](PRAYSCREEN_APPROACH.md) - Technical details

## Troubleshooting

**"Module not found"**
→ Run step 1 & 2 again, then rebuild

**"Permission denied"**
→ Settings → Apps → Sacred → Display over other apps → Enable

**"Service not starting"**
→ Check logs: `adb logcat | grep Sacred`

## That's It!

Full PrayScreen-like behavior implemented. Read [NATIVE_PRAYER_SETUP.md](NATIVE_PRAYER_SETUP.md) for details.
