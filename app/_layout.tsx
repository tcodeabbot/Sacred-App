import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/useAuthStore';
import { usePrayerStore } from '@/store/usePrayerStore';
import { PrayerLockScreen } from '@/components/PrayerLockScreen';
import { useAppStore } from '@/store/useAppStore';
import {
  addNotificationResponseListener,
  addNotificationReceivedListener,
} from '@/services/notificationService';

export default function RootLayout() {
  const router = useRouter();
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const { initialize, showLockScreen, isLockScreenVisible, hideLockScreen, currentScheduleName } = usePrayerStore();
  const { blockedApps } = useAppStore();

  useEffect(() => {
    // Initialize auth
    initializeAuth();

    // Initialize prayer schedules and notifications
    initialize();

    // Listen for notification taps (when app is in background)
    const subscription1 = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      if (data.type === 'prayer-reminder') {
        showLockScreen(data.scheduleName as string);
      }
    });

    // Listen for notifications when app is in foreground
    const subscription2 = addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data;
      if (data.type === 'prayer-reminder') {
        showLockScreen(data.scheduleName as string);
      }
    });

    return () => {
      subscription1.remove();
      subscription2.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen
          name="(modals)"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>

      {/* Prayer Lock Screen - Shows when it's prayer time */}
      <PrayerLockScreen
        visible={isLockScreenVisible}
        onDismiss={hideLockScreen}
        onStartPrayer={() => {
          router.push('/prayer-session');
        }}
        scheduleName={currentScheduleName || undefined}
        blockedApps={blockedApps.filter(app => app.isBlocked).map(app => app.name)}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
