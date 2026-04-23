# Testing the Prayer Interruption Feature

## Current Status

✅ **Android native code**: Generated and copied successfully  
⚠️ **Need Android device/emulator**: Required to test

## Quick Options to Test

### Option 1: Use Physical Android Device (Recommended)

1. **Enable Developer Mode** on your Android phone:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Developer Options will appear

2. **Enable USB Debugging**:
   - Settings → Developer Options → USB Debugging → Enable

3. **Connect Phone to Computer**:
   - Use USB cable
   - Allow USB debugging when prompted

4. **Run the app**:
   ```bash
   npx expo run:android
   ```

### Option 2: Use Android Emulator

1. **Install Android Studio**: https://developer.android.com/studio

2. **Create Virtual Device**:
   - Open Android Studio
   - Tools → Device Manager
   - Create Device → Pick any phone (Pixel 6 recommended)
   - Download system image (API 33 or 34)
   - Finish

3. **Start Emulator**:
   - Click ▶️ on the virtual device

4. **Run the app**:
   ```bash
   npx expo run:android
   ```

### Option 3: Test iOS Instead (If You Have Mac)

Since you're on Mac, you could test iOS in the simulator (though Screen Time features won't work without real device):

```bash
# Generate iOS project
npx expo prebuild --platform ios --clean

# Copy iOS files
node scripts/copy-ios-native-files.js

# Install pods
cd ios && pod install && cd ..

# Run in simulator
npx expo run:ios
```

**Note**: iOS Screen Time API requires:
- Physical device (not simulator)
- Family Controls entitlement from Apple (takes 1-2 weeks)

## What to Test Once Running

### 1. Test Lock Screen Immediately
- Open app
- Tap "Test Lock" button on home screen
- ✅ Should see prayer lock screen

### 2. Test Scheduled Interruption (THE BIG ONE!)
- Go to Prayer Schedule
- Add a prayer for **2 minutes from now**
- Make sure it's enabled (toggle ON)
- **Close Sacred app**
- **Open Instagram or any other app**
- Wait for prayer time...
- ✅ **Prayer overlay should appear over Instagram!**

### 3. Test Permission Flow
- Android will ask for "Display over other apps" permission
- Grant the permission
- Prayer interruption will then work

## Troubleshooting

### "No device found"
→ Connect Android device with USB debugging OR start Android emulator

### "Permission denied" 
→ Settings → Apps → Sacred → Display over other apps → Enable

### "Build failed"
→ Share the error message and I can help fix it

## iOS Testing (Later)

For iOS Screen Time testing, you'll need:
1. ✅ Physical iPhone/iPad (not simulator)
2. ⏳ Family Controls entitlement (request from Apple)
3. ⏳ 1-2 week approval time
4. ✅ iOS 15.0+

While waiting for iOS entitlement, focus on Android testing!

## Current Files Ready

✅ Android native code: Copied to `android/app/src/main/java/com/sacred/app/prayer/`
✅ Services: `services/prayerInterruption.ts` (unified for both platforms)
✅ Integration: `app/_layout.tsx` initialized

All code is ready - just need a device to run on!
