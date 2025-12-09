import { create } from 'zustand';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

interface AuthState {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,

  signInWithEmail: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      set({
        user: userCredential.user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  signUpWithEmail: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      set({
        user: userCredential.user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  signInWithGoogle: async () => {
    set({ loading: true, error: null });

    try {
      // Check if Google Play services are available
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Sign in with Google
      const response = await GoogleSignin.signIn();

      if (!response.data?.idToken) {
        throw new Error('No ID token received from Google');
      }

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(response.data.idToken);

      // Sign in with the credential
      const userCredential = await auth().signInWithCredential(googleCredential);

      console.log('Google sign-in successful:', userCredential.user.email);

      set({
        user: userCredential.user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);

      // Handle user cancellation gracefully
      if (error.code === 'SIGN_IN_CANCELLED' || error.code === 'SIGN_IN_REQUIRED') {
        console.log('Google sign-in cancelled by user');
        set({ loading: false });
        return;
      }

      const errorMessage = error.message || 'Failed to sign in with Google';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  signInWithFacebook: async () => {
    set({ loading: true, error: null });

    try {
      // TODO: Implement Facebook login using @react-native-firebase/auth
      // You'll need to add react-native-fbsdk-next package
      throw new Error('Facebook sign-in not yet implemented. Please install react-native-fbsdk-next');
    } catch (error: any) {
      console.error('Facebook Sign-In Error:', error);
      const errorMessage = error.message || 'Failed to sign in with Facebook';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  signInWithApple: async () => {
    try {
      set({ loading: true, error: null });

      // Check if Apple Sign-In is available (iOS only)
      if (Platform.OS !== 'ios') {
        throw new Error('Apple Sign-In is only available on iOS devices');
      }

      console.log('Initializing Apple Sign-In...');

      // Check if Apple Sign-In is available
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Apple Sign-In is not available on this device');
      }

      console.log('Requesting Apple authentication...');

      // Request Apple authentication
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log('Apple authentication successful, signing in to Firebase...');

      // Create an Apple credential
      const appleCredential = auth.AppleAuthProvider.credential(
        credential.identityToken!,
        credential.authorizationCode!
      );

      // Sign in with the credential
      const userCredential = await auth().signInWithCredential(appleCredential);

      console.log('Apple sign-in successful:', userCredential.user.email);

      set({
        user: userCredential.user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Apple Sign-In Error:', error);
      if (error.code === 'ERR_REQUEST_CANCELED') {
        console.log('Apple sign-in cancelled by user');
        // User canceled, don't show error
        set({ loading: false });
        return;
      }
      const errorMessage = getAuthErrorMessage(error.code) || error.message || 'Failed to sign in with Apple';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null });

      // Sign out from Google if previously signed in
      try {
        await GoogleSignin.signOut();
      } catch (error) {
        // Ignore if not signed in
        console.log('Google sign out skipped (not signed in)');
      }

      // Sign out from Firebase
      await auth().signOut();

      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Sign Out Error:', error);
      set({ error: 'Failed to sign out', loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  initializeAuth: () => {
    // Listen to auth state changes
    const unsubscribe = auth().onAuthStateChanged((user) => {
      set({
        user,
        isAuthenticated: !!user,
        loading: false,
      });
    });

    // Return unsubscribe function if needed
    return unsubscribe;
  },
}));

// Helper function to convert Firebase error codes to user-friendly messages
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled';
    case 'auth/invalid-credential':
      return 'Invalid credentials. Please try again';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email address but different sign-in credentials';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful login attempts. Please try again later';
    default:
      return 'An error occurred. Please try again';
  }
}
