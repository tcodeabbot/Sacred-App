import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, AppState, Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/useAuthStore';
import { usePrayerStore } from '@/store/usePrayerStore';
import { PrayerLockScreen } from '@/components/PrayerLockScreen';
import { useAppStore } from '@/store/useAppStore';
import {
  addNotificationResponseListener,
  addNotificationReceivedListener,
  requestNotificationPermissions,
  syncPrayerScheduleItems,
} from '@/services/notificationService';
import {
  initializeNativePrayerOverlay,
  updatePrayerSchedule as updateNativePrayerSchedule,
  addPrayerCompletedListener,
  addPrayerDismissedListener,
} from '@/services/nativePrayerOverlay';

export default function RootLayout() {
  const router = useRouter();
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const user = useAuthStore((state) => state.user);
  const { initialize, showLockScreen, isLockScreenVisible, hideLockScreen, currentScheduleName, currentDuration } = usePrayerStore();
  const { blockedApps, settings, loadPrayerSchedule } = useAppStore();

  useEffect(() => {
    // Initialize auth
    initializeAuth();

    // Initialize notification listeners
    const setupNotifications = async () => {
      // Request permissions
      const granted = await requestNotificationPermissions();

      if (granted) {
        // Sync prayer schedules with notifications
        await syncPrayerScheduleItems(settings.prayerSchedule);
        console.log('Prayer schedules synced with notifications');

        // Initialize native prayer overlay (Android only)
        if (Platform.OS === 'android') {
          await initializeNativePrayerOverlay(settings.prayerSchedule);
        }
      }
    };

    setupNotifications();

    // Listen for native prayer events (Android only)
    if (Platform.OS === 'android') {
      const unsubscribeCompleted = addPrayerCompletedListener((scheduleId) => {
        console.log('✅ Prayer completed from native:', scheduleId);
        // Prayer was started from native overlay, user is now in app
      });

      const unsubscribeDismissed = addPrayerDismissedListener((scheduleId) => {
        console.log('❌ Prayer dismissed from native:', scheduleId);
      });

      return () => {
        unsubscribeCompleted();
        unsubscribeDismissed();
      };
    }

    // Listen for notification taps (when app is in background)
    const subscription1 = addNotificationResponseListener((response) => {
      console.log('📱 Notification tapped!', {
        actionId: response.actionIdentifier,
        data: response.notification.request.content.data,
      });

      const data = response.notification.request.content.data;
      const actionId = response.actionIdentifier;

      if (data.type === 'prayer-reminder') {
        const scheduleId = data.scheduleId as string;
        const scheduledPrayer = settings.prayerSchedule.find(p => p.id === scheduleId);

        console.log('🔍 Found scheduled prayer:', scheduledPrayer);

        // Handle different actions
        if (actionId === 'BEGIN_PRAYER' || actionId === Notifications.DEFAULT_ACTION_IDENTIFIER) {
          // User tapped notification or "Begin Prayer" button
          console.log('✅ Showing lock screen from notification tap');
          showLockScreen(
            data.scheduleName as string,
            scheduledPrayer?.selectedPrayerId,
            scheduledPrayer?.duration || 5
          );
        } else if (actionId === 'DISMISS') {
          // User dismissed the notification
          console.log('❌ Prayer notification dismissed by user');
        }
      } else {
        console.warn('⚠️ Unknown notification type:', data.type);
      }
    });

    // Listen for notifications when app is in foreground
    const subscription2 = addNotificationReceivedListener((notification) => {
      console.log('🔔 Notification received (app in foreground)!', {
        title: notification.request.content.title,
        data: notification.request.content.data,
      });

      const data = notification.request.content.data;
      if (data.type === 'prayer-reminder') {
        const scheduleId = data.scheduleId as string;
        const scheduledPrayer = settings.prayerSchedule.find(p => p.id === scheduleId);

        console.log('🔍 Found scheduled prayer:', scheduledPrayer);
        console.log('✅ Showing lock screen automatically (app in foreground)');

        // Automatically show lock screen when notification arrives in foreground
        showLockScreen(
          data.scheduleName as string,
          scheduledPrayer?.selectedPrayerId,
          scheduledPrayer?.duration || 5
        );
      } else {
        console.warn('⚠️ Unknown notification type in foreground:', data.type);
      }
    });

    return () => {
      subscription1.remove();
      subscription2.remove();
    };
  }, []);

  // Load prayer schedule from database when user is authenticated
  useEffect(() => {
    const loadSchedule = async () => {
      if (user?.id) {
        await loadPrayerSchedule(user.id);
      }
    };

    loadSchedule();
  }, [user?.id]);

  // Sync notifications whenever prayer schedule changes
  useEffect(() => {
    const syncSchedules = async () => {
      await syncPrayerScheduleItems(settings.prayerSchedule);

      // Also update native service (Android only)
      if (Platform.OS === 'android') {
        await updateNativePrayerSchedule(settings.prayerSchedule);
      }

      console.log('Prayer schedules updated');
    };

    syncSchedules();
  }, [settings.prayerSchedule]);

  // Handle deep links to open prayer lock screen
  useEffect(() => {
    // Handle initial URL when app opens from notification
    const handleInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink(initialUrl);
      }
    };

    handleInitialUrl();

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, [settings.prayerSchedule]);

  // Handle deep link URLs
  const handleDeepLink = (url: string) => {
    console.log('Received deep link:', url);

    // Parse the URL
    const { hostname, queryParams } = Linking.parse(url);

    // Handle prayer-lock deep link
    if (hostname === 'prayer-lock') {
      const scheduleName = queryParams?.name as string || 'Prayer Time';
      const scheduleId = queryParams?.id as string;

      // Find the prayer schedule item
      const scheduledPrayer = settings.prayerSchedule.find(p => p.id === scheduleId);

      // Show lock screen
      showLockScreen(
        scheduleName,
        scheduledPrayer?.selectedPrayerId,
        scheduledPrayer?.duration || 5
      );

      console.log('Showing prayer lock screen from deep link');
    }
  };

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
        duration={currentDuration}
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
