package com.sacred.app.prayer;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

/**
 * React Native module for Prayer Overlay functionality
 * Provides methods to show full-screen prayer lock screen and manage prayer monitoring
 */
public class PrayerOverlayModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "PrayerOverlay";
    private static ReactApplicationContext reactContext;

    public PrayerOverlayModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return MODULE_NAME;
    }

    /**
     * Check if overlay permission is granted
     */
    @ReactMethod
    public void checkOverlayPermission(Promise promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                boolean hasPermission = Settings.canDrawOverlays(reactContext);
                promise.resolve(hasPermission);
            } else {
                // Permission automatically granted on older Android versions
                promise.resolve(true);
            }
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to check overlay permission", e);
        }
    }

    /**
     * Request overlay permission
     */
    @ReactMethod
    public void requestOverlayPermission(Promise promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (!Settings.canDrawOverlays(reactContext)) {
                    Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION);
                    intent.setData(Uri.parse("package:" + reactContext.getPackageName()));
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

                    Activity activity = getCurrentActivity();
                    if (activity != null) {
                        activity.startActivity(intent);
                        promise.resolve(true);
                    } else {
                        promise.reject("ERROR", "No current activity");
                    }
                } else {
                    promise.resolve(true);
                }
            } else {
                promise.resolve(true);
            }
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to request overlay permission", e);
        }
    }

    /**
     * Show prayer overlay immediately
     */
    @ReactMethod
    public void showPrayerOverlay(ReadableMap data, Promise promise) {
        try {
            String prayerName = data.hasKey("name") ? data.getString("name") : "Prayer Time";
            int duration = data.hasKey("duration") ? data.getInt("duration") : 5;
            String scheduleId = data.hasKey("scheduleId") ? data.getString("scheduleId") : "";

            Intent intent = new Intent(reactContext, PrayerOverlayActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK |
                          Intent.FLAG_ACTIVITY_CLEAR_TOP |
                          Intent.FLAG_ACTIVITY_SINGLE_TOP);
            intent.putExtra("prayerName", prayerName);
            intent.putExtra("duration", duration);
            intent.putExtra("scheduleId", scheduleId);

            reactContext.startActivity(intent);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to show prayer overlay", e);
        }
    }

    /**
     * Start prayer monitoring service
     */
    @ReactMethod
    public void startPrayerMonitoring(ReadableArray prayerSchedule, Promise promise) {
        try {
            Intent serviceIntent = new Intent(reactContext, PrayerOverlayService.class);
            serviceIntent.setAction("START_MONITORING");

            // Convert ReadableArray to JSON string
            serviceIntent.putExtra("prayerSchedule", prayerSchedule.toString());

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(serviceIntent);
            } else {
                reactContext.startService(serviceIntent);
            }

            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to start prayer monitoring", e);
        }
    }

    /**
     * Stop prayer monitoring service
     */
    @ReactMethod
    public void stopPrayerMonitoring(Promise promise) {
        try {
            Intent serviceIntent = new Intent(reactContext, PrayerOverlayService.class);
            reactContext.stopService(serviceIntent);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to stop prayer monitoring", e);
        }
    }

    /**
     * Update prayer schedule in the service
     */
    @ReactMethod
    public void updatePrayerSchedule(ReadableArray prayerSchedule, Promise promise) {
        try {
            Intent serviceIntent = new Intent(reactContext, PrayerOverlayService.class);
            serviceIntent.setAction("UPDATE_SCHEDULE");
            serviceIntent.putExtra("prayerSchedule", prayerSchedule.toString());

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(serviceIntent);
            } else {
                reactContext.startService(serviceIntent);
            }

            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to update prayer schedule", e);
        }
    }

    /**
     * Send event to JavaScript
     */
    public static void sendEvent(String eventName, @Nullable WritableMap params) {
        if (reactContext != null) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
        }
    }

    /**
     * Notify JS that prayer was completed
     */
    public static void notifyPrayerCompleted(String scheduleId) {
        WritableMap params = Arguments.createMap();
        params.putString("scheduleId", scheduleId);
        sendEvent("onPrayerCompleted", params);
    }

    /**
     * Notify JS that prayer was dismissed
     */
    public static void notifyPrayerDismissed(String scheduleId) {
        WritableMap params = Arguments.createMap();
        params.putString("scheduleId", scheduleId);
        sendEvent("onPrayerDismissed", params);
    }
}
