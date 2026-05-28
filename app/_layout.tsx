import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
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
import { addPrayerCompletedListener, addPrayerDismissedListener } from '@/services/nativePrayerOverlay';
import { createPrayerSession, updateUserStatsAfterPrayer } from '@/lib/database';

// Unified prayer interruption service (Android + iOS)
import {
  initializePrayerInterruption,
  updatePrayerSchedule as updateUnifiedPrayerSchedule,
  getPrayerInterruptionInfo,
} from '@/services/prayerInterruption';

export default function RootLayout() {
  const router = useRouter();
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const user = useAuthStore((state) => state.user);
  const { showLockScreen, isLockScreenVisible, hideLockScreen, currentScheduleName, currentDuration } = usePrayerStore();
  const { blockedApps, settings, loadPrayerSchedule } = useAppStore();

  useEffect(() => {
    initializeAuth();

    const info = getPrayerInterruptionInfo();
    console.log('🙏 Prayer Interruption:', info);

    const setupNotifications = async () => {
      const granted = await requestNotificationPermissions();
      if (granted) {
        await syncPrayerScheduleItems(settings.prayerSchedule);
        console.log('Prayer schedules synced with notifications');
        await initializePrayerInterruption(settings.prayerSchedule);
      }
    };

    setupNotifications();

    // Android: prayer completed in the native overlay — save session to Supabase
    const unsubscribePrayerCompleted = addPrayerCompletedListener(async (scheduleId) => {
      console.log('✅ Prayer completed (Android):', scheduleId);
      const currentUser = useAuthStore.getState().user;
      if (!currentUser) return;

      const now = new Date();
      const schedule = useAppStore.getState().settings.prayerSchedule.find(p => p.id === scheduleId);
      const duration = schedule?.duration ?? 5;
      const startedAt = new Date(now.getTime() - duration * 60 * 1000);

      try {
        await createPrayerSession(currentUser.id, {
          startedAt,
          completedAt: now,
          duration,
          triggeredBy: scheduleId,
          completed: true,
          mode: 'silent',
          tags: [],
        });
        await updateUserStatsAfterPrayer(currentUser.id, duration, now);
        console.log('✅ Android prayer session saved');
      } catch (error) {
        console.error('Error saving Android prayer session:', error);
      }
    });

    const unsubscribePrayerDismissed = addPrayerDismissedListener((scheduleId) => {
      console.log('❌ Prayer dismissed (Android):', scheduleId);
    });

    // Background notification tap — shows prayer lock screen
    const subscription1 = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      const actionId = response.actionIdentifier;

      if (data.type === 'prayer-reminder') {
        const scheduleId = data.scheduleId as string;
        const scheduledPrayer = settings.prayerSchedule.find(p => p.id === scheduleId);

        if (actionId === 'BEGIN_PRAYER' || actionId === Notifications.DEFAULT_ACTION_IDENTIFIER) {
          showLockScreen(
            data.scheduleName as string,
            scheduledPrayer?.selectedPrayerId,
            scheduleId,
            scheduledPrayer?.duration || 5
          );
        }
      }
    });

    // Foreground notification — show prayer lock screen automatically
    const subscription2 = addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data;
      if (data.type === 'prayer-reminder') {
        const scheduleId = data.scheduleId as string;
        const scheduledPrayer = settings.prayerSchedule.find(p => p.id === scheduleId);

        showLockScreen(
          data.scheduleName as string,
          scheduledPrayer?.selectedPrayerId,
          scheduleId,
          scheduledPrayer?.duration || 5
        );
      }
    });

    return () => {
      unsubscribePrayerCompleted();
      unsubscribePrayerDismissed();
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

  // Sync notifications and prayer interruption whenever prayer schedule changes
  useEffect(() => {
    const syncSchedules = async () => {
      await syncPrayerScheduleItems(settings.prayerSchedule);
      await updateUnifiedPrayerSchedule(settings.prayerSchedule);
    };

    syncSchedules();
  }, [settings.prayerSchedule]);

  // Handle deep links to open prayer lock screen
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      const { hostname, queryParams } = Linking.parse(url);

      if (hostname === 'prayer-lock') {
        const scheduleName = (queryParams?.name as string) || 'Prayer Time';
        const scheduleId = queryParams?.id as string;
        const scheduledPrayer = settings.prayerSchedule.find(p => p.id === scheduleId);

        showLockScreen(
          scheduleName,
          scheduledPrayer?.selectedPrayerId,
          scheduleId,
          scheduledPrayer?.duration || 5
        );
      }
    };

    const handleInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) handleDeepLink(initialUrl);
    };

    handleInitialUrl();

    const subscription = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));
    return () => subscription.remove();
  }, [settings.prayerSchedule]);

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
        onStartPrayer={() => router.push('/prayer-session')}
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
