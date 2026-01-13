package com.sacred.app.prayer;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import androidx.core.app.NotificationCompat;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;

/**
 * Foreground Service that monitors prayer times
 * Runs continuously and shows prayer overlay at scheduled times
 */
public class PrayerOverlayService extends Service {
    private static final String CHANNEL_ID = "PrayerMonitoringChannel";
    private static final int NOTIFICATION_ID = 1000;
    private static final int CHECK_INTERVAL = 30000; // Check every 30 seconds

    private Handler handler;
    private Runnable checkRunnable;
    private List<PrayerScheduleItem> prayerSchedule = new ArrayList<>();
    private List<String> triggeredToday = new ArrayList<>();

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        handler = new Handler(Looper.getMainLooper());
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();

            if ("START_MONITORING".equals(action)) {
                String scheduleJson = intent.getStringExtra("prayerSchedule");
                parsePrayerSchedule(scheduleJson);
                startForeground(NOTIFICATION_ID, createNotification());
                startMonitoring();
            } else if ("UPDATE_SCHEDULE".equals(action)) {
                String scheduleJson = intent.getStringExtra("prayerSchedule");
                parsePrayerSchedule(scheduleJson);
            }
        }

        return START_STICKY; // Restart if killed
    }

    /**
     * Parse prayer schedule from JSON
     */
    private void parsePrayerSchedule(String scheduleJson) {
        try {
            prayerSchedule.clear();
            JSONArray jsonArray = new JSONArray(scheduleJson);

            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject item = jsonArray.getJSONObject(i);
                if (item.getBoolean("enabled")) {
                    PrayerScheduleItem scheduleItem = new PrayerScheduleItem();
                    scheduleItem.id = item.getString("id");
                    scheduleItem.name = item.getString("name");
                    scheduleItem.time = item.getString("time");
                    scheduleItem.duration = item.getInt("duration");
                    scheduleItem.enabled = true;

                    prayerSchedule.add(scheduleItem);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * Start monitoring prayer times
     */
    private void startMonitoring() {
        checkRunnable = new Runnable() {
            @Override
            public void run() {
                checkPrayerTimes();
                handler.postDelayed(this, CHECK_INTERVAL);
            }
        };
        handler.post(checkRunnable);
    }

    /**
     * Check if it's time for any prayer
     */
    private void checkPrayerTimes() {
        Calendar now = Calendar.getInstance();
        int currentHour = now.get(Calendar.HOUR_OF_DAY);
        int currentMinute = now.get(Calendar.MINUTE);
        String currentTime = String.format("%02d:%02d", currentHour, currentMinute);

        // Reset triggered list at midnight
        int currentDay = now.get(Calendar.DAY_OF_YEAR);
        if (triggeredToday.size() > 0 && !triggeredToday.get(0).startsWith(String.valueOf(currentDay))) {
            triggeredToday.clear();
        }

        for (PrayerScheduleItem item : prayerSchedule) {
            if (item.enabled && item.time.equals(currentTime)) {
                String todayKey = currentDay + "_" + item.id;

                // Only trigger once per day
                if (!triggeredToday.contains(todayKey)) {
                    triggeredToday.add(todayKey);
                    showPrayerOverlay(item);
                }
            }
        }
    }

    /**
     * Show prayer overlay activity
     */
    private void showPrayerOverlay(PrayerScheduleItem item) {
        Intent intent = new Intent(this, PrayerOverlayActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK |
                       Intent.FLAG_ACTIVITY_CLEAR_TOP |
                       Intent.FLAG_ACTIVITY_SINGLE_TOP);
        intent.putExtra("prayerName", item.name);
        intent.putExtra("duration", item.duration);
        intent.putExtra("scheduleId", item.id);

        startActivity(intent);
    }

    /**
     * Create notification channel (Android O+)
     */
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Prayer Monitoring",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Monitors your prayer schedule");
            channel.setShowBadge(false);

            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    /**
     * Create foreground service notification
     */
    private Notification createNotification() {
        Intent notificationIntent = new Intent(this, getMainActivityClass());
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this,
            0,
            notificationIntent,
            PendingIntent.FLAG_IMMUTABLE
        );

        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Sacred")
            .setContentText("Monitoring prayer times")
            .setSmallIcon(android.R.drawable.ic_menu_today)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build();
    }

    /**
     * Get main activity class
     */
    private Class<?> getMainActivityClass() {
        try {
            return Class.forName(getPackageName() + ".MainActivity");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (handler != null && checkRunnable != null) {
            handler.removeCallbacks(checkRunnable);
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    /**
     * Data class for prayer schedule items
     */
    static class PrayerScheduleItem {
        String id;
        String name;
        String time;
        int duration;
        boolean enabled;
    }
}
