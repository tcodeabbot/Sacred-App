# Android Build - Alternative Approach

## Issue with EAS Cloud Builds

EAS cloud builds are failing because:
1. The config plugin's `dangerouslyModifyAndroidMainApplicationJava` doesn't actually execute file copy code
2. Build hooks like `.eas/build/post-install.js` may not run at the right time
3. Native files need to be copied AFTER `expo prebuild` but BEFORE the Gradle build

## ✅ Recommended Solution: Local Build

Instead of EAS cloud build, build locally on your Mac. This gives more control and is faster for development testing.

### Steps to Build Locally

```bash
# 1. Make sure you ran prebuild (already done)
npx expo prebuild --platform android --clean

# 2. Copy native files (already done)
node scripts/copy-native-prayer-files.js

# 3. Build locally
cd android
./gradlew assembleDebug
cd ..

# 4. Install on device or emulator
npx expo run:android
```

### Advantages of Local Build

✅ **Faster**: No waiting in EAS queue  
✅ **Free**: No EAS build credits used  
✅ **Debuggable**: See all errors immediately  
✅ **Full Control**: Run scripts at exact right time  
✅ **Iterative**: Make changes and rebuild quickly  

### Requirements

- ✅ You already have Android SDK (from expo prebuild)
- ✅ Java/JDK installed (required for Expo)
- ✅ Android device or emulator

### Alternative: Use Development Server

If you don't want to build at all:

```bash
# 1. Start the dev server
npx expo start --dev-client

# 2. Scan QR code with:
- Expo Go (won't work - no native modules)
- A pre-built development client you made earlier
```

## Why EAS Builds Keep Failing

The issue is that our native Java files in `android-native/prayer/` need to be:
1. ✅ Copied to `android/app/src/main/java/com/sacred/app/prayer/`
2. ✅ Registered in `MainApplication.kt`

This works fine locally (we did it manually), but in EAS:
- Config plugin runs during prebuild
- Our files are copied AFTER plugin runs
- Gradle build doesn't see the files
- Build fails

### Possible EAS Fix (Advanced)

Would require creating a proper Expo module with:
- expo-module.config.json
- Automatic file generation
- Proper Kotlin/Swift bindings

This is a LOT of work for a development build. Local builds are much simpler!

## Recommendation

**For NOW**: Build locally  
**For PRODUCTION**: We can fix EAS builds or submit a pre-built binary

Local building is standard for development with custom native code.
