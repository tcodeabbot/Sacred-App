import { Platform } from 'react-native';
import { PrayerScheduleItem } from '@/types';

// Android native overlay
import {
    checkOverlayPermission,
    requestOverlayPermission,
    showPrayerOverlay as showAndroidOverlay,
    startPrayerMonitoring as startAndroidMonitoring,
    stopPrayerMonitoring as stopAndroidMonitoring,
    updatePrayerSchedule as updateAndroidSchedule,
    initializeNativePrayerOverlay as initAndroidOverlay,
    addPrayerCompletedListener,
    addPrayerDismissedListener,
} from './nativePrayerOverlay';

// iOS Screen Time API
import {
    checkScreenTimeAuthorization,
    requestScreenTimeAuthorization,
    selectAppsToBlock,
    applyShield,
    removeShield,
    setShieldActive,
    setPrayerSessionActive,
    schedulePrayerShields as scheduleIOSPrayerShields,
    stopPrayerMonitoring as stopIOSMonitoring,
    initializeIOSScreenTime,
} from './iosScreenTime';

/**
 * Unified Prayer Interruption Service
 * Works on both Android (native overlay) and iOS (Screen Time API)
 */

/**
 * Check if prayer interruption permission is granted
 */
export async function checkPrayerPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
        return await checkOverlayPermission();
    } else if (Platform.OS === 'ios') {
        const status = await checkScreenTimeAuthorization();
        return status === 'approved';
    }
    return false;
}

/**
 * Request prayer interruption permission
 */
export async function requestPrayerPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
        return await requestOverlayPermission();
    } else if (Platform.OS === 'ios') {
        return await requestScreenTimeAuthorization();
    }
    return false;
}

/**
 * Show prayer screen immediately (for testing)
 */
export async function showPrayerScreen(
    name: string,
    duration: number,
    scheduleId: string
): Promise<boolean> {
    if (Platform.OS === 'android') {
        return await showAndroidOverlay(name, duration, scheduleId);
    } else if (Platform.OS === 'ios') {
        // iOS: Apply shield immediately
        // Note: In production, you'd trigger the lock screen modal instead
        console.log('iOS: Showing prayer screen via modal (shield applied)');
        await applyShield();
        return true;
    }
    return false;
}

/**
 * Start monitoring prayer times
 * Android: Starts foreground service
 * iOS: Schedules DeviceActivity monitors
 */
export async function startPrayerMonitoring(
    prayerSchedule: PrayerScheduleItem[]
): Promise<boolean> {
    console.log('🚀 Starting prayer monitoring...', {
        platform: Platform.OS,
        prayers: prayerSchedule.filter(p => p.enabled).length,
    });

    if (Platform.OS === 'android') {
        return await startAndroidMonitoring(prayerSchedule);
    } else if (Platform.OS === 'ios') {
        return await scheduleIOSPrayerShields(prayerSchedule);
    }
    return false;
}

/**
 * Stop all prayer monitoring
 */
export async function stopPrayerMonitoring(): Promise<boolean> {
    console.log('⏹️ Stopping prayer monitoring...', { platform: Platform.OS });

    if (Platform.OS === 'android') {
        return await stopAndroidMonitoring();
    } else if (Platform.OS === 'ios') {
        return await stopIOSMonitoring();
    }
    return false;
}

/**
 * Update prayer schedule
 */
export async function updatePrayerSchedule(
    prayerSchedule: PrayerScheduleItem[]
): Promise<boolean> {
    console.log('📝 Updating prayer schedule...', {
        platform: Platform.OS,
        prayers: prayerSchedule.filter(p => p.enabled).length,
    });

    if (Platform.OS === 'android') {
        return await updateAndroidSchedule(prayerSchedule);
    } else if (Platform.OS === 'ios') {
        // iOS: Re-schedule DeviceActivity monitors
        return await scheduleIOSPrayerShields(prayerSchedule);
    }
    return false;
}

/**
 * Initialize prayer interruption system
 * Call this on app startup
 */
export async function initializePrayerInterruption(
    prayerSchedule: PrayerScheduleItem[]
): Promise<boolean> {
    console.log('🎯 Initializing prayer interruption...', {
        platform: Platform.OS,
        prayers: prayerSchedule.length,
    });

    // Check permission first
    const hasPermission = await checkPrayerPermission();

    if (!hasPermission) {
        console.warn('⚠️ Prayer permission not granted. Requesting...');
        const granted = await requestPrayerPermission();

        if (!granted) {
            console.error('❌ Prayer permission denied');
            return false;
        }
    }

    // Initialize platform-specific monitoring
    if (Platform.OS === 'android') {
        return await initAndroidOverlay(prayerSchedule);
    } else if (Platform.OS === 'ios') {
        return await initializeIOSScreenTime(prayerSchedule);
    }

    return false;
}

/**
 * iOS only: Select apps to block
 */
export async function selectBlockedApps(): Promise<boolean> {
    if (Platform.OS === 'ios') {
        return await selectAppsToBlock();
    }
    console.warn('selectBlockedApps is iOS-only');
    return false;
}

/**
 * iOS only: Manually apply shield
 */
export async function applyAppShield(): Promise<boolean> {
    if (Platform.OS === 'ios') {
        return await applyShield();
    }
    console.warn('applyAppShield is iOS-only');
    return false;
}

/**
 * iOS only: Mark a schedule's shield as active (call when prayer session starts)
 */
export async function markShieldActive(scheduleId: string): Promise<boolean> {
    if (Platform.OS === 'ios') {
        return await setShieldActive(scheduleId);
    }
    return false;
}

/**
 * iOS only: Remove shield for the completed schedule.
 * Fully unblocks apps only when all concurrent schedules are done.
 */
export async function removeAppShield(scheduleId: string): Promise<boolean> {
    if (Platform.OS === 'ios') {
        return await removeShield(scheduleId);
    }
    console.warn('removeAppShield is iOS-only');
    return false;
}

/**
 * iOS only: Write prayer_session_active flag so ShieldConfigurationExtension
 * shows "Prayer in progress" vs "Time to Pray" UI state.
 */
export async function setAppPrayerSessionActive(active: boolean): Promise<boolean> {
    if (Platform.OS === 'ios') {
        return await setPrayerSessionActive(active);
    }
    return false;
}


/**
 * Get platform-specific info
 */
export function getPrayerInterruptionInfo() {
    return {
        platform: Platform.OS,
        supportsAutoInterruption: true,
        method: Platform.OS === 'android'
            ? 'Native Overlay Service'
            : Platform.OS === 'ios'
                ? 'Screen Time API'
                : 'Not Supported',
        requiresPermission: true,
    };
}
