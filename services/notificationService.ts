import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface PrayerSchedule {
  id: string;
  time: string; // Format: "HH:mm" (e.g., "09:00")
  days: number[]; // 0-6 (Sunday-Saturday)
  enabled: boolean;
  label?: string;
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

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('prayer-reminders', {
      name: 'Prayer Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1a9b8e',
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

    const trigger: Notifications.NotificationTriggerInput = {
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
