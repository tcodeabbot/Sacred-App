import { NativeModules, Platform } from 'react-native';
import { PrayerScheduleItem } from '@/types';

interface PrayerScreenTimeManager {
    requestScreenTimeAuthorization(): Promise<boolean>;
    checkScreenTimeAuthorization(): Promise<'notDetermined' | 'denied' | 'approved' | 'unknown'>;
    selectAppsToBlock(): Promise<boolean>;
    applyShield(appTokens: string[]): Promise<boolean>;
    removeShield(): Promise<boolean>;
    schedulePrayerShields(prayerSchedule: PrayerScheduleItem[]): Promise<boolean>;
    stopAllPrayerMonitoring(): Promise<boolean>;
}

const LINKING_ERROR =
    `The package 'PrayerScreenTimeManager' doesn't seem to be linked. Make sure: \n\n` +
    Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
    '- You rebuilt the app after installing the package\n' +
    '- You ran "expo prebuild"\n' +
    '- You are not using Expo Go\n';

// Get the native module
const ScreenTimeManager: PrayerScreenTimeManager = NativeModules.PrayerScreenTimeManager
    ? NativeModules.PrayerScreenTimeManager
    : new Proxy(
        {},
        {
            get() {
                throw new Error(LINKING_ERROR);
            },
        }
    );

/**
 * Check if Screen Time authorization is granted (iOS only)
 */
export async function checkScreenTimeAuthorization(): Promise<string> {
    if (Platform.OS !== 'ios') {
        return 'notApplicable';
    }

    try {
        return await ScreenTimeManager.checkScreenTimeAuthorization();
    } catch (error) {
        console.error('Error checking Screen Time authorization:', error);
        return 'unknown';
    }
}

/**
 * Request Screen Time authorization (iOS only)
 */
export async function requestScreenTimeAuthorization(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
        console.log('Screen Time only available on iOS');
        return false;
    }

    try {
        const granted = await ScreenTimeManager.requestScreenTimeAuthorization();
        console.log(granted ? '✅ Screen Time authorized' : '❌ Screen Time denied');
        return granted;
    } catch (error) {
        console.error('Error requesting Screen Time authorization:', error);
        return false;
    }
}

/**
 * Open app selection picker (iOS only)
 */
export async function selectAppsToBlock(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
        return false;
    }

    try {
        return await ScreenTimeManager.selectAppsToBlock();
    } catch (error) {
        console.error('Error selecting apps to block:', error);
        return false;
    }
}

/**
 * Apply shield to selected apps immediately (iOS only)
 */
export async function applyShield(appTokens: string[] = []): Promise<boolean> {
    if (Platform.OS !== 'ios') {
        return false;
    }

    try {
        return await ScreenTimeManager.applyShield(appTokens);
    } catch (error) {
        console.error('Error applying shield:', error);
        return false;
    }
}

/**
 * Remove shield from all apps (iOS only)
 */
export async function removeShield(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
        return false;
    }

    try {
        return await ScreenTimeManager.removeShield();
    } catch (error) {
        console.error('Error removing shield:', error);
        return false;
    }
}

/**
 * Schedule automatic shields for prayer times (iOS only)
 * This uses DeviceActivity to automatically shield apps at prayer times
 */
export async function schedulePrayerShields(
    prayerSchedule: PrayerScheduleItem[]
): Promise<boolean> {
    if (Platform.OS !== 'ios') {
        console.log('Prayer shields scheduling only available on iOS');
        return false;
    }

    try {
        const enabledPrayers = prayerSchedule.filter(p => p.enabled);
        console.log('📅 Scheduling prayer shields for iOS:', enabledPrayers);

        const success = await ScreenTimeManager.schedulePrayerShields(enabledPrayers);

        if (success) {
            console.log('✅ iOS prayer shields scheduled successfully');
        } else {
            console.error('❌ Failed to schedule iOS prayer shields');
        }

        return success;
    } catch (error) {
        console.error('Error scheduling prayer shields:', error);
        return false;
    }
}

/**
 * Stop all prayer monitoring (iOS only)
 */
export async function stopPrayerMonitoring(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
        return false;
    }

    try {
        return await ScreenTimeManager.stopAllPrayerMonitoring();
    } catch (error) {
        console.error('Error stopping prayer monitoring:', error);
        return false;
    }
}

/**
 * Initialize iOS Screen Time integration
 * Call this on app startup
 */
export async function initializeIOSScreenTime(
    prayerSchedule: PrayerScheduleItem[]
): Promise<boolean> {
    if (Platform.OS !== 'ios') {
        console.log('Screen Time not available on this platform');
        return true;
    }

    try {
        // Check authorization status
        const authStatus = await checkScreenTimeAuthorization();

        if (authStatus === 'notDetermined') {
            console.log('⚠️ Screen Time not authorized. Requesting...');
            const granted = await requestScreenTimeAuthorization();
            if (!granted) {
                console.warn('❌ Screen Time authorization denied');
                return false;
            }
        } else if (authStatus === 'denied') {
            console.warn('❌ Screen Time authorization previously denied');
            return false;
        }

        // Schedule prayer shields
        const success = await schedulePrayerShields(prayerSchedule);

        if (success) {
            console.log('✅ iOS Screen Time initialized successfully');
        } else {
            console.error('❌ Failed to initialize iOS Screen Time');
        }

        return success;
    } catch (error) {
        console.error('Error initializing iOS Screen Time:', error);
        return false;
    }
}
