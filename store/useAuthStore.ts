import { create } from 'zustand';
import { supabase } from '@/config/supabase';
import { Session, User } from '@supabase/supabase-js';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: false,
  error: null,
  isAuthenticated: false,

  signInWithEmail: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      set({
        user: data.user,
        session: data.session,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.message || error.code);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  signUpWithEmail: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      set({
        user: data.user,
        session: data.session,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.message || error.code);
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  signInWithGoogle: async () => {
    set({ loading: true, error: null });

    try {
      // Check if Google Play services are available (Android only)
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      // Sign in with Google
      const response = await GoogleSignin.signIn();

      if (!response.data?.idToken) {
        throw new Error('No ID token received from Google');
      }

      // Sign in with Supabase using the Google ID token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.data.idToken,
      });

      if (error) throw error;

      console.log('Google sign-in successful:', data.user?.email);

      set({
        user: data.user,
        session: data.session,
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

      console.log('Apple authentication successful, signing in to Supabase...');

      // Sign in with Supabase using Apple credentials
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken!,
      });

      if (error) throw error;

      console.log('Apple sign-in successful:', data.user?.email);

      set({
        user: data.user,
        session: data.session,
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
      const errorMessage = error.message || 'Failed to sign in with Apple';
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

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      set({
        user: null,
        session: null,
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({
        user: session?.user ?? null,
        session: session,
        isAuthenticated: !!session,
        loading: false,
      });
    });

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        user: session?.user ?? null,
        session: session,
        isAuthenticated: !!session,
        loading: false,
      });
    });

    // Return unsubscribe function
    return () => subscription.unsubscribe();
  },
}));

// Helper function to convert Supabase error messages to user-friendly messages
function getAuthErrorMessage(errorMessage: string): string {
  // Supabase uses error messages instead of error codes
  const lowerError = errorMessage.toLowerCase();

  if (lowerError.includes('invalid login credentials')) {
    return 'Invalid email or password';
  }
  if (lowerError.includes('email not confirmed')) {
    return 'Please verify your email address';
  }
  if (lowerError.includes('user already registered')) {
    return 'An account already exists with this email';
  }
  if (lowerError.includes('password should be at least')) {
    return 'Password should be at least 6 characters';
  }
  if (lowerError.includes('invalid email')) {
    return 'Invalid email address';
  }
  if (lowerError.includes('user not found')) {
    return 'No account found with this email';
  }
  if (lowerError.includes('email rate limit exceeded')) {
    return 'Too many attempts. Please try again later';
  }
  if (lowerError.includes('network')) {
    return 'Network error. Please check your connection';
  }

  return errorMessage || 'An error occurred. Please try again';
}
