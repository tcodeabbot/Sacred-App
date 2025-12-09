# Firebase Authentication Setup Guide

This guide will help you set up Firebase authentication for the Sacred app.

## Prerequisites

- A Firebase account (free)
- Your app installed and running

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter your project name (e.g., "Sacred App")
4. Follow the setup wizard

## Step 2: Register Your App

### For iOS:
1. In Firebase Console, click the iOS icon
2. Enter your iOS Bundle ID (found in `app.json` or `app.config.js`)
3. Download the `GoogleService-Info.plist` file
4. Place it in the root of your project

### For Android:
1. In Firebase Console, click the Android icon
2. Enter your Android package name (found in `app.json` or `app.config.js`)
3. Download the `google-services.json` file
4. Place it in the root of your project

### For Web (if needed):
1. Click the Web icon in Firebase Console
2. Register your app
3. Copy the Firebase configuration

## Step 3: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Copy the Firebase configuration values
4. Create a `.env` file in the root of your project (copy from `.env.example`)
5. Add your Firebase configuration:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

## Step 4: Enable Authentication Methods

### Email/Password Authentication:
1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click on "Email/Password"
3. Enable it and click "Save"

### Google Authentication:
1. In the same section, click on "Google"
2. Enable it
3. Select a support email
4. Copy the **Web Client ID** (you'll need this next)
5. Add it to your `.env` file:
```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id_here.apps.googleusercontent.com
```
6. Click "Save"

### Apple Authentication:
1. Click on "Apple"
2. Enable it
3. You'll need:
   - Apple Developer account
   - Service ID configured in Apple Developer Console
   - Follow [this guide](https://firebase.google.com/docs/auth/ios/apple) for detailed setup

### Facebook Authentication:
1. Click on "Facebook"
2. Enable it
3. You'll need:
   - Facebook Developer account
   - Facebook App ID and App Secret
   - Follow [this guide](https://firebase.google.com/docs/auth/web/facebook-login) for detailed setup

**Note:** Facebook authentication requires additional setup with `expo-facebook` package, which is not yet implemented in this codebase.

## Step 5: Configure OAuth Redirect (for Google/Apple)

1. In Firebase Console, go to **Authentication** > **Settings** > **Authorized domains**
2. Add any custom domains you'll use

## Step 6: Test Authentication

1. Make sure your `.env` file has all the required values
2. Restart your Expo development server:
   ```bash
   npx expo start --clear
   ```
3. Navigate to the sign-in page in your app
4. Try each authentication method:
   - **Email/Password**: Create a new account and sign in
   - **Google**: Test on a physical device or simulator
   - **Apple**: Test on an iOS device or simulator (iOS 13+)

## Troubleshooting

### Google Sign-In Issues:
- Make sure `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` is set correctly
- For Android, ensure SHA-1 fingerprint is added in Firebase Console
- For iOS, ensure the iOS Bundle ID matches

### Apple Sign-In Issues:
- Apple Sign-In only works on iOS 13+
- Test on a real device, not just simulator
- Ensure Apple Sign-In capability is enabled in Xcode

### General Issues:
- Check that all environment variables are prefixed with `EXPO_PUBLIC_`
- Restart the Expo server after changing `.env` file
- Check Firebase Console for any error messages
- Ensure your Firebase project is on the Blaze (pay-as-you-go) plan for production use

## Security Notes

1. **Never commit your `.env` file** - it contains sensitive keys
2. The `.env.example` file is safe to commit (it has placeholder values)
3. For production, consider using Firebase App Check for additional security
4. Enable email verification for new sign-ups (optional but recommended)

## Next Steps

After setting up authentication:
1. Add user profile management
2. Implement password reset functionality
3. Add email verification
4. Set up Firestore rules for user data
5. Add user data to Firestore on sign-up

## Useful Resources

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Expo Firebase Setup](https://docs.expo.dev/guides/using-firebase/)
- [Google Sign-In for React Native](https://github.com/react-native-google-signin/google-signin)
- [Expo Apple Authentication](https://docs.expo.dev/versions/latest/sdk/apple-authentication/)
