# Development Build Guide for Social Authentication

Google Sign-In and Apple Sign-In require native modules that don't work in Expo Go. You need to create a development build.

## Quick Start (Recommended)

### For Android:

```bash
# Install expo-dev-client
npx expo install expo-dev-client

# Create Android development build
npx expo run:android
```

This will:
- Build the app with all native modules
- Install it on your connected Android device or emulator
- Start the Metro bundler

### For iOS (Requires Mac):

```bash
# Install expo-dev-client
npx expo install expo-dev-client

# Install CocoaPods dependencies
npx pod-install

# Create iOS development build
npx expo run:ios
```

## Alternative: Using EAS Build (Cloud Build)

If you don't want to set up Android Studio or Xcode:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Create development build for Android
eas build --profile development --platform android

# Create development build for iOS
eas build --profile development --platform ios
```

After the build completes, you'll get a download link to install on your device.

## What's the Difference?

| Feature | Expo Go | Development Build |
|---------|---------|-------------------|
| Email/Password Auth | ✅ Works | ✅ Works |
| Google Sign-In | ❌ Not Available | ✅ Works |
| Apple Sign-In | ❌ Not Available | ✅ Works (iOS only) |
| Facebook Sign-In | ❌ Not Available | ✅ Works (with setup) |
| Build Time | Instant | 5-10 minutes |
| Updates | Hot reload | Hot reload |

## Prerequisites

### For Android (`npx expo run:android`):
- Android Studio installed
- Android SDK configured
- Android device/emulator running

### For iOS (`npx expo run:ios`):
- macOS required
- Xcode installed
- iOS Simulator or physical device

### For EAS Build (Cloud):
- Expo account (free)
- No local setup required!

## Troubleshooting

### Android Build Issues:
```bash
# Clear cache and rebuild
cd android
./gradlew clean
cd ..
npx expo run:android
```

### iOS Build Issues:
```bash
# Clear pods and reinstall
cd ios
pod deintegrate
pod install
cd ..
npx expo run:ios
```

### Google Sign-In Still Not Working?

1. **Check Firebase Console:**
   - Go to Authentication > Sign-in method
   - Ensure Google is enabled

2. **Android SHA-1 Fingerprint:**
   ```bash
   # Get debug SHA-1
   cd android
   ./gradlew signingReport
   ```
   Add the SHA-1 to Firebase Console > Project Settings > Your apps

3. **iOS Bundle ID:**
   - Ensure Bundle ID in Xcode matches Firebase Console

## Next Steps After Building

1. The app will install on your device
2. It will look exactly like Expo Go but with native modules
3. You can now use Google Sign-In and Apple Sign-In
4. Hot reloading still works!

## Cost

- **Local builds** (`npx expo run:android/ios`): Free, but requires setup
- **EAS Build**: Free tier includes limited builds per month
- **Expo Go**: Free, but limited features

## Recommendation

For development: Use Expo Go with email/password auth
For production: Create a development build to test all features

Once you're ready to publish:
```bash
eas build --profile production --platform all
```
