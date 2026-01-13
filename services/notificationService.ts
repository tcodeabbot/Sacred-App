import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    // Make sure notification shows even when app is in foreground
    shouldShowInForeground: true,
  }),
});

export interface PrayerSchedule {
  id: string;
  time: string; // Format: "HH:mm" (e.g., "09:00")
  days: number[]; // 0-6 (Sunday-Saturday)
  enabled: boolean;
  label?: string;
}

export interface PrayerScheduleItem {
  id: string;
  name: string;
  time: string;
  duration: number;
  enabled: boolean;
  selectedPrayerId?: string;
}

// Request notification permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Notification permissions not granted');
    return false;
  }

  // Set up notification category with actions
  await Notifications.setNotificationCategoryAsync('PRAYER_ALARM', [
    {
      identifier: 'BEGIN_PRAYER',
      buttonTitle: 'Begin Prayer',
      options: {
        opensAppToForeground: true,
        isAuthenticationRequired: false,
        isDestructive: false,
      },
    },
    {
      identifier: 'DISMISS',
      buttonTitle: 'Not Now',
      options: {
        opensAppToForeground: false,
        isAuthenticationRequired: false,
        isDestructive: false,
      },
    },
  ]);

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('prayer-reminders', {
      name: 'Prayer Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1a9b8e',
      sound: 'default',
      enableVibrate: true,
      enableLights: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true, // Bypass Do Not Disturb
    });
  }

  return true;
}

// Schedule a prayer notification
export async function schedulePrayerNotification(
  schedule: PrayerSchedule
): Promise<string | null> {
  if (!schedule.enabled) return null;

  try {
    const [hours, minutes] = schedule.time.split(':').map(Number);

    // Calculate the next occurrence
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const trigger: Notifications.CalendarTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: hours,
      minute: minutes,
      repeats: true,
    };

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time for Prayer 🙏',
        body: schedule.label || 'Take a moment to pause and pray',
        data: {
          type: 'prayer-reminder',
          scheduleId: schedule.id,
          scheduleName: schedule.label || 'Prayer Time',
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger,
    });

    console.log(`Scheduled prayer notification ${notificationId} for ${schedule.time}`);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

// Cancel a scheduled notification
export async function cancelPrayerNotification(notificationId: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`Cancelled notification ${notificationId}`);
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
}

// Cancel all scheduled notifications
export async function cancelAllPrayerNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Cancelled all notifications');
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
  }
}

// Get all scheduled notifications
export async function getAllScheduledNotifications() {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log('Scheduled notifications:', notifications.length);
    return notifications;
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

// Schedule multiple prayer times
export async function scheduleAllPrayers(schedules: PrayerSchedule[]) {
  // Cancel existing notifications first
  await cancelAllPrayerNotifications();

  // Schedule each enabled prayer time
  const notificationIds: Record<string, string> = {};

  for (const schedule of schedules) {
    if (schedule.enabled) {
      const notificationId = await schedulePrayerNotification(schedule);
      if (notificationId) {
        notificationIds[schedule.id] = notificationId;
      }
    }
  }

  return notificationIds;
}

// Listen for notification responses (when user taps notification)
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

// Listen for incoming notifications (when app is in foreground)
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

// Sync prayer schedule items (from useAppStore) with notifications
export async function syncPrayerScheduleItems(scheduleItems: PrayerScheduleItem[]) {
  console.log('🔄 Syncing prayer schedule with notifications...', {
    totalItems: scheduleItems.length,
    enabledItems: scheduleItems.filter(i => i.enabled).length,
  });

  // Cancel existing notifications first
  await cancelAllPrayerNotifications();

  // Schedule each enabled prayer time
  const notificationIds: Record<string, string> = {};

  for (const item of scheduleItems) {
    if (item.enabled) {
      try {
        const [hours, minutes] = item.time.split(':').map(Number);

        const trigger: Notifications.CalendarTriggerInput = {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: hours,
          minute: minutes,
          repeats: true,
        };

        const content: any = {
          title: 'Time for Prayer 🙏',
          body: item.name || 'Take a moment to pause and pray',
          data: {
            type: 'prayer-reminder',
            scheduleId: item.id,
            scheduleName: item.name,
            duration: item.duration,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          categoryIdentifier: 'PRAYER_ALARM',
          sticky: Platform.OS === 'android',
          autoDismiss: false,
        };

        // Add platform-specific properties
        if (Platform.OS === 'android') {
          content.android = {
            channelId: 'prayer-reminders',
            priority: Notifications.AndroidNotificationPriority.MAX,
            sound: true,
            vibrate: [0, 250, 250, 250],
            color: '#1a9b8e',
          };
        } else if (Platform.OS === 'ios') {
          content.interruptionLevel = 'timeSensitive';
        }

        const notificationId = await Notifications.scheduleNotificationAsync({
          content,
          trigger,
        });

        notificationIds[item.id] = notificationId;
        console.log(`✅ Scheduled notification for ${item.name} at ${item.time}`, {
          notificationId,
          duration: item.duration,
        });
      } catch (error) {
        console.error(`❌ Error scheduling notification for ${item.name}:`, error);
      }
    }
  }

  console.log(`🎉 Sync complete! Scheduled ${Object.keys(notificationIds).length} notifications`);

  // Log all scheduled notifications for debugging
  const allScheduled = await getAllScheduledNotifications();
  console.log('📋 All scheduled notifications:', allScheduled.map(n => ({
    identifier: n.identifier,
    content: n.content.title,
    trigger: n.trigger,
  })));

  return notificationIds;
}
