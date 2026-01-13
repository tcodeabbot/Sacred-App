import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Service to handle interrupting the user and bringing the app to foreground
 * at scheduled prayer times.
 */

// Deep link scheme for opening the app to prayer lock screen
const PRAYER_LOCK_DEEP_LINK = 'sacred://prayer-lock';

/**
 * Opens the app and triggers the prayer lock screen
 * This uses deep linking to force the app to foreground
 */
export async function openAppToPrayerLock(scheduleName: string, scheduleId: string) {
  try {
    const url = `${PRAYER_LOCK_DEEP_LINK}?name=${encodeURIComponent(scheduleName)}&id=${scheduleId}`;

    // Check if we can open the URL
    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
      await Linking.openURL(url);
      console.log('Opened app to prayer lock screen via deep link');
    } else {
      console.warn('Cannot open deep link:', url);
    }
  } catch (error) {
    console.error('Error opening app to prayer lock:', error);
  }
}

/**
 * Schedules a high-priority notification that automatically brings
 * the app to foreground on Android (full-screen intent behavior)
 */
export async function scheduleInterruptingNotification(
  scheduleId: string,
  scheduleName: string,
  time: string, // HH:mm format
  duration: number
) {
  try {
    const [hours, minutes] = time.split(':').map(Number);

    const trigger: Notifications.CalendarTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: hours,
      minute: minutes,
      repeats: true,
    };

    // Create notification content with deep link
    const deepLinkUrl = `${PRAYER_LOCK_DEEP_LINK}?name=${encodeURIComponent(scheduleName)}&id=${scheduleId}`;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🙏 Time for Prayer',
        subtitle: scheduleName,
        body: `${duration} minute${duration > 1 ? 's' : ''} - Tap to begin`,
        data: {
          type: 'prayer-reminder',
          scheduleId,
          scheduleName,
          duration,
          deepLink: deepLinkUrl,
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        categoryIdentifier: 'PRAYER_ALARM',
        sticky: true,
        autoDismiss: false,
        // iOS: Make it time-sensitive and critical
        interruptionLevel: 'timeSensitive' as any,
        // Android: Full screen intent behavior
        ...(Platform.OS === 'android' && {
          android: {
            channelId: 'prayer-reminders',
            priority: Notifications.AndroidNotificationPriority.MAX,
            sound: true,
            vibrate: [0, 250, 250, 250],
            lightColor: '#1a9b8e',
            // This makes it show as heads-up notification
            importance: Notifications.AndroidImportance.MAX,
          } as any,
        }),
      },
      trigger,
    });

    console.log(`Scheduled interrupting notification for ${scheduleName} at ${time}`);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling interrupting notification:', error);
    return null;
  }
}

/**
 * For iOS: Request critical alert permission
 * (Requires special entitlement from Apple)
 */
export async function requestCriticalAlertPermission(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return true; // Not needed on Android
  }

  try {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowCriticalAlerts: true, // Requires entitlement
      },
    });

    return status === 'granted';
  } catch (error) {
    console.warn('Critical alerts not available (requires Apple entitlement):', error);
    return false;
  }
}

/**
 * Checks if the app is currently in foreground
 */
export function isAppInForeground(): boolean {
  // This would need to be tracked via AppState
  // For now, return false as a placeholder
  return false;
}

/**
 * Background task to check prayer times
 * Note: This requires expo-task-manager and background permissions
 */
export async function registerPrayerTimeChecker() {
  // TODO: Implement background task using expo-task-manager
  // This would check prayer times every minute and trigger lock screen
  // when a prayer time is reached, even if app is in background
  console.warn('Background prayer time checker not yet implemented');
}
