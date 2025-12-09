import auth from '@react-native-firebase/auth';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

// Note: With React Native Firebase, the configuration is handled
// automatically through google-services.json (Android) and
// GoogleService-Info.plist (iOS). No manual config needed!

// Export auth instance directly
export { auth };

// Export types for convenience
export type { FirebaseAuthTypes };
