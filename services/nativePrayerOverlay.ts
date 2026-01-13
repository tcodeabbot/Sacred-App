import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { PrayerScheduleItem } from '@/types';

// Android module interface
interface PrayerOverlayModule {
  checkOverlayPermission(): Promise<boolean>;
  requestOverlayPermission(): Promise<boolean>;
  showPrayerOverlay(data: {
    name: string;
    duration: number;
    scheduleId: string;
  }): Promise<boolean>;
  startPrayerMonitoring(prayerSchedule: PrayerScheduleItem[]): Promise<boolean>;
  stopPrayerMonitoring(): Promise<boolean>;
  updatePrayerSchedule(prayerSchedule: PrayerScheduleItem[]): Promise<boolean>;
}

// iOS Screen Time module interface
interface PrayerScreenTimeModule {
  checkAuthorization(): Promise<boolean>;
  requestAuthorization(): Promise<boolean>;
  presentAppSelectorUI(): Promise<boolean>;
  saveSelectedApps(appTokensJSON: string): Promise<boolean>;
  schedulePrayerBlock(config: {
    prayerName: string;
    startTime: string;
    duration: number;
  }): Promise<boolean>;
  cancelPrayerBlock(prayerName: string): Promise<boolean>;
  cancelAllPrayerBlocks(): Promise<boolean>;
  activateShieldNow(): Promise<boolean>;
  deactivateShield(): Promise<boolean>;
}

const LINKING_ERROR =
  `The package 'PrayerOverlay' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You ran "expo prebuild"\n' +
  '- You are not using Expo Go\n';

// Get the native modules
const PrayerOverlay: PrayerOverlayModule = NativeModules.PrayerOverlay
  ? NativeModules.PrayerOverlay
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

const PrayerScreenTime: PrayerScreenTimeModule = NativeModules.PrayerScreenTimeModule
  ? NativeModules.PrayerScreenTimeModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

// Create event emitter
const prayerEventEmitter = Platform.OS === 'android'
  ? new NativeEventEmitter(NativeModules.PrayerOverlay)
  : null;

/**
 * Check if overlay permission is granted
 */
export async function checkOverlayPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true; // iOS doesn't need this permission
  }

  try {
    return await PrayerOverlay.checkOverlayPermission();
  } catch (error) {
    console.error('Error checking overlay permission:', error);
    return false;
  }
}

/**
 * Request overlay permission
 */
export async function requestOverlayPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    return await PrayerOverlay.requestOverlayPermission();
  } catch (error) {
    console.error('Error requesting overlay permission:', error);
    return false;
  }
}

/**
 * Show prayer overlay immediately
 */
export async function showPrayerOverlay(
  name: string,
  duration: number,
  scheduleId: string
): Promise<boolean> {
  if (Platform.OS !== 'android') {
    console.warn('Prayer overlay only supported on Android');
    return false;
  }

  try {
    return await PrayerOverlay.showPrayerOverlay({
      name,
      duration,
      scheduleId,
    });
  } catch (error) {
    console.error('Error showing prayer overlay:', error);
    return false;
  }
}

/**
 * Start prayer monitoring service
 * This will show prayer overlay automatically at scheduled times
 */
export async function startPrayerMonitoring(
  prayerSchedule: PrayerScheduleItem[]
): Promise<boolean> {
  if (Platform.OS !== 'android') {
    console.log('Prayer monitoring only supported on Android, using notifications on iOS');
    return true;
  }

  try {
    // Filter to only enabled prayers
    const enabledPrayers = prayerSchedule.filter(p => p.enabled);

    console.log('🚀 Starting prayer monitoring service with schedule:', enabledPrayers);
    return await PrayerOverlay.startPrayerMonitoring(enabledPrayers);
  } catch (error) {
    console.error('Error starting prayer monitoring:', error);
    return false;
  }
}

/**
 * Stop prayer monitoring service
 */
export async function stopPrayerMonitoring(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    return await PrayerOverlay.stopPrayerMonitoring();
  } catch (error) {
    console.error('Error stopping prayer monitoring:', error);
    return false;
  }
}

/**
 * Update prayer schedule in the service
 */
export async function updatePrayerSchedule(
  prayerSchedule: PrayerScheduleItem[]
): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const enabledPrayers = prayerSchedule.filter(p => p.enabled);
    console.log('📝 Updating prayer schedule in service:', enabledPrayers);
    return await PrayerOverlay.updatePrayerSchedule(enabledPrayers);
  } catch (error) {
    console.error('Error updating prayer schedule:', error);
    return false;
  }
}

/**
 * Listen for prayer completed events
 */
export function addPrayerCompletedListener(
  callback: (scheduleId: string) => void
): () => void {
  if (!prayerEventEmitter) {
    return () => {};
  }

  const subscription = prayerEventEmitter.addListener(
    'onPrayerCompleted',
    (event) => {
      console.log('✅ Prayer completed:', event.scheduleId);
      callback(event.scheduleId);
    }
  );

  return () => subscription.remove();
}

/**
 * Listen for prayer dismissed events
 */
export function addPrayerDismissedListener(
  callback: (scheduleId: string) => void
): () => void {
  if (!prayerEventEmitter) {
    return () => {};
  }

  const subscription = prayerEventEmitter.addListener(
    'onPrayerDismissed',
    (event) => {
      console.log('❌ Prayer dismissed:', event.scheduleId);
      callback(event.scheduleId);
    }
  );

  return () => subscription.remove();
}

/**
 * Initialize native prayer overlay
 * Call this on app startup
 */
export async function initializeNativePrayerOverlay(
  prayerSchedule: PrayerScheduleItem[]
): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      // Check permission
      const hasPermission = await checkOverlayPermission();

      if (!hasPermission) {
        console.warn('⚠️ Overlay permission not granted. Requesting...');
        await requestOverlayPermission();
        return false;
      }

      // Start monitoring
      const success = await startPrayerMonitoring(prayerSchedule);

      if (success) {
        console.log('✅ Native prayer overlay initialized successfully');
      } else {
        console.error('❌ Failed to initialize native prayer overlay');
      }

      return success;
    } catch (error) {
      console.error('Error initializing native prayer overlay:', error);
      return false;
    }
  } else if (Platform.OS === 'ios') {
    try {
      // Check Screen Time authorization
      const hasAuth = await checkScreenTimeAuthorization();

      if (!hasAuth) {
        console.warn('⚠️ Screen Time authorization not granted. Requesting...');
        await requestScreenTimeAuthorization();
        return false;
      }

      // Schedule all enabled prayers
      const success = await scheduleAllPrayers(prayerSchedule);

      if (success) {
        console.log('✅ iOS Screen Time prayer blocking initialized successfully');
      } else {
        console.error('❌ Failed to initialize iOS Screen Time prayer blocking');
      }

      return success;
    } catch (error) {
      console.error('Error initializing iOS Screen Time:', error);
      return false;
    }
  }

  return false;
}

// ===========================
// iOS Screen Time API Methods
// ===========================

/**
 * Check if Screen Time authorization is granted (iOS only)
 */
export async function checkScreenTimeAuthorization(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return false;
  }

  try {
    return await PrayerScreenTime.checkAuthorization();
  } catch (error) {
    console.error('Error checking Screen Time authorization:', error);
    return false;
  }
}

/**
 * Request Screen Time authorization (iOS only)
 * User will see Apple's permission dialog
 */
export async function requestScreenTimeAuthorization(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return false;
  }

  try {
    return await PrayerScreenTime.requestAuthorization();
  } catch (error) {
    console.error('Error requesting Screen Time authorization:', error);
    return false;
  }
}

/**
 * Present app selector UI (iOS only)
 * Shows Apple's native app picker
 */
export async function presentAppSelector(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    console.warn('App selector only available on iOS');
    return false;
  }

  try {
    return await PrayerScreenTime.presentAppSelectorUI();
  } catch (error) {
    console.error('Error presenting app selector:', error);
    return false;
  }
}

/**
 * Schedule prayer blocking for iOS Screen Time
 */
export async function schedulePrayerBlock(
  prayerName: string,
  startTime: string,
  duration: number
): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return false;
  }

  try {
    return await PrayerScreenTime.schedulePrayerBlock({
      prayerName,
      startTime,
      duration,
    });
  } catch (error) {
    console.error('Error scheduling prayer block:', error);
    return false;
  }
}

/**
 * Cancel specific prayer block (iOS only)
 */
export async function cancelPrayerBlock(prayerName: string): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return false;
  }

  try {
    return await PrayerScreenTime.cancelPrayerBlock(prayerName);
  } catch (error) {
    console.error('Error cancelling prayer block:', error);
    return false;
  }
}

/**
 * Cancel all prayer blocks (iOS only)
 */
export async function cancelAllPrayerBlocks(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return false;
  }

  try {
    return await PrayerScreenTime.cancelAllPrayerBlocks();
  } catch (error) {
    console.error('Error cancelling all prayer blocks:', error);
    return false;
  }
}

/**
 * Schedule all enabled prayers for iOS
 */
async function scheduleAllPrayers(
  prayerSchedule: PrayerScheduleItem[]
): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return false;
  }

  try {
    // Cancel all existing schedules first
    await cancelAllPrayerBlocks();

    // Schedule each enabled prayer
    const enabledPrayers = prayerSchedule.filter(p => p.enabled);

    for (const prayer of enabledPrayers) {
      await schedulePrayerBlock(
        prayer.name || 'Prayer',
        prayer.time,
        prayer.duration || 5
      );
    }

    console.log(`✅ Scheduled ${enabledPrayers.length} prayers for iOS Screen Time blocking`);
    return true;
  } catch (error) {
    console.error('Error scheduling all prayers:', error);
    return false;
  }
}
