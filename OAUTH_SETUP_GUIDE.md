# OAuth Setup Guide for Sacred App

This guide will help you set up Google, Facebook, and Apple sign-in for your Sacred app.

## Prerequisites

- Firebase project configured
- Expo development environment set up
- Your app's bundle identifier: `com.sacred.app`
- Your app's scheme: `sacred`

## 1. Google Sign-In Setup

### Step 1: Enable Google Sign-In in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `sacred-mobile-app-d732f`
3. Navigate to **Authentication** > **Sign-in method**
4. Click on **Google** and enable it
5. Set the project support email
6. Click **Save**

### Step 2: Configure OAuth Redirect URIiOS Bundled 466ms node_modules/expo-router/entry.js (1 module)
 (NOBRIDGE) LOG  Bridgeless mode is enabled
 INFO  
 💡 JavaScript logs will be removed from Metro in React Native 0.77! Please use React Native DevTools as your default tool. Tip: Type j in the terminal to open (requires Google Chrome or Microsoft Edge).
 (NOBRIDGE) WARN  [2025-12-06T01:29:41.958Z]  @firebase/auth: Auth (12.6.0): 
You are initializing Firebase Auth for React Native without providing
AsyncStorage. Auth state will default to memory persistence and will not
persist between sessions. In order to persist auth state, install the package
"@react-native-async-storage/async-storage" and provide it to
initializeAuth:

import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
 [Component Stack]
 (NOBRIDGE) LOG  Google OAuth Redirect URI: exp://10.1.43.17:8082

For Expo Go (Development):
```
exp://10.1.43.17:8082
```
(This URI is dynamic and changes based on your local IP)

For Production (Standalone builds):
```
com.sacred.app://
sacred://
```

### Step 3: Add Redirect URI to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to **APIs & Services** > **Credentials**
4. Find your OAuth 2.0 Client ID (Web client created by Firebase)
5. Under **Authorized redirect URIs**, add:
   - `https://sacred-mobile-app-d732f.firebaseapp.com/__/auth/handler` (already added)
   - For development with Expo Go, you may need to add the dynamic exp:// URI

### Step 4: Verify Environment Variables

Your `.env` file should have:
```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=1028433592068-2hi3tqojgul3kvol4afgft2t13jmsi90.apps.googleusercontent.com
```

✅ **Google Sign-In is configured!**

---

## 2. Facebook Sign-In Setup

### Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/apps)
2. Click **Create App**
3. Select **Consumer** as the app type
4. Fill in app details:
   - App Name: `Sacred`
   - App Contact Email: Your email
5. Click **Create App**

### Step 2: Add Facebook Login Product

1. In your Facebook App Dashboard, click **Add Product**
2. Find **Facebook Login** and click **Set Up**
3. Select **iOS** and **Android** as platforms

### Step 3: Configure iOS Settings

1. In Facebook App Dashboard, go to **Settings** > **Basic**
2. Add iOS platform:
   - Bundle ID: `com.sacred.app`
3. Go to **Facebook Login** > **Settings**
4. Add OAuth Redirect URI:
   - `sacred://redirect`
   - `fb{your-app-id}://authorize`

### Step 4: Configure Android Settings

1. Add Android platform:
   - Package Name: `com.sacred.app`
2. Add OAuth Redirect URI:
   - `sacred://redirect`

### Step 5: Enable Facebook Sign-In in Firebase

1. Go to Firebase Console > **Authentication** > **Sign-in method**
2. Click on **Facebook** and enable it
3. Enter your Facebook App ID and App Secret (from Facebook App Dashboard > Settings > Basic)
4. Copy the OAuth redirect URI provided by Firebase
5. Add this URI to Facebook App > Facebook Login > Settings > Valid OAuth Redirect URIs
6. Click **Save**

### Step 6: Update Environment Variables

Add to your `.env` file:
```
EXPO_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id_here
```

✅ **Facebook Sign-In will be configured after adding your App ID!**

---

## 3. Apple Sign-In Setup (iOS Only)

### Step 1: Enable Sign in with Apple in Apple Developer Portal

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Select your App ID (`com.sacred.app`)
4. Under **Capabilities**, enable **Sign in with Apple**
5. Click **Save**

### Step 2: Enable Apple Sign-In in Firebase

1. Go to Firebase Console > **Authentication** > **Sign-in method**
2. Click on **Apple** and enable it
3. Follow the instructions to configure the Service ID, Team ID, and Key ID

### Step 3: Configure in Xcode (for standalone builds)

1. Open your project in Xcode
2. Select your app target
3. Go to **Signing & Capabilities**
4. Click **+ Capability**
5. Add **Sign in with Apple**

### Step 4: Test on Physical iOS Device

⚠️ **Note**: Apple Sign-In only works on:
- Physical iOS devices (iOS 13+)
- Simulator with iOS 13+ (limited functionality)
- NOT on Expo Go (requires development build)

✅ **Apple Sign-In is already configured in the code!**

---

## 4. Testing OAuth Flows

### Testing with Expo Go (Development)

1. Start your development server:
   ```bash
   npm start
   ```

2. The redirect URI will be logged in the console when you attempt to sign in

3. **Limitations in Expo Go**:
   - ✅ Google Sign-In: Works
   - ⚠️ Facebook Sign-In: Works with proper configuration
   - ❌ Apple Sign-In: Requires development build

### Testing with Development Build (EAS Build)

For full OAuth functionality including Apple Sign-In:

1. Create a development build:
   ```bash
   eas build --profile development --platform ios
   ```

2. Install the development build on your device

3. All OAuth providers will work properly

---

## 5. Troubleshooting

### Google Sign-In Issues

**Problem**: "Google Client ID is not configured" error
- **Solution**: Verify `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in `.env` file

**Problem**: OAuth redirect URI mismatch
- **Solution**: Add the logged redirect URI to Google Cloud Console

### Facebook Sign-In Issues

**Problem**: "Facebook App ID is not configured" error
- **Solution**: Add `EXPO_PUBLIC_FACEBOOK_APP_ID` to `.env` file

**Problem**: Invalid OAuth redirect URI
- **Solution**: Add `sacred://redirect` to Facebook App > Settings > Valid OAuth Redirect URIs

### Apple Sign-In Issues

**Problem**: "Apple Sign-In is not available on this device"
- **Solution**: Test on physical iOS device with iOS 13+ or create a development build

**Problem**: "Sign in with Apple" button doesn't appear
- **Solution**: Verify capability is enabled in Apple Developer Portal

### Firebase Auth Persistence Warning

The warning about AsyncStorage has been fixed. Auth state will now persist between app restarts.

---

## 6. Current Status

✅ **Configured**:
- Firebase configuration
- Google Sign-In
- Apple Sign-In (code ready, requires iOS device)
- AsyncStorage persistence

⚠️ **Needs Setup**:
- Facebook App ID in `.env` file

---

## 7. Next Steps

1. **For Facebook Sign-In**: Create a Facebook App and add the App ID to `.env`
2. **For Production**: Create production builds and update OAuth redirect URIs
3. **For Testing**: Test all sign-in flows on physical devices

---

## Support

If you encounter issues:
1. Check console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure OAuth redirect URIs match across all platforms
4. Review Firebase Console for proper sign-in method enablement
