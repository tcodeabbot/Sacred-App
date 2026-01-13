import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { PrayerScheduleItem } from '@/types';

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

const LINKING_ERROR =
  `The package 'PrayerOverlay' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You ran "expo prebuild"\n' +
  '- You are not using Expo Go\n';

// Get the native module
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
  if (Platform.OS !== 'android') {
    console.log('Native overlay not available on iOS, using notifications');
    return true;
  }

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
}
