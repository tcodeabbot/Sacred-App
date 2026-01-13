package com.sacred.app.prayer;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.TextView;

/**
 * Full-screen Activity that appears at prayer time
 * Blocks other apps until prayer is completed or dismissed
 */
public class PrayerOverlayActivity extends Activity {
    private TextView titleText;
    private TextView timerText;
    private TextView messageText;
    private Button beginButton;
    private Button dismissButton;

    private String prayerName;
    private int duration; // in minutes
    private String scheduleId;
    private CountDownTimer countDownTimer;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Make full-screen and show over lock screen
        getWindow().addFlags(
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
            WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
        );

        // Get intent data
        Intent intent = getIntent();
        prayerName = intent.getStringExtra("prayerName");
        duration = intent.getIntExtra("duration", 5);
        scheduleId = intent.getStringExtra("scheduleId");

        // For now, use a simple layout
        // In production, you'd want a proper XML layout matching your design
        createSimpleLayout();
    }

    /**
     * Create a simple programmatic layout
     * TODO: Replace with proper XML layout in production
     */
    private void createSimpleLayout() {
        // Create main container
        android.widget.LinearLayout layout = new android.widget.LinearLayout(this);
        layout.setOrientation(android.widget.LinearLayout.VERTICAL);
        layout.setBackgroundColor(0xFF1a9b8e); // Teal color
        layout.setPadding(60, 100, 60, 100);
        layout.setGravity(android.view.Gravity.CENTER);

        // Title
        titleText = new TextView(this);
        titleText.setText("Time to Pause");
        titleText.setTextSize(36);
        titleText.setTextColor(0xFFFFFFFF);
        titleText.setGravity(android.view.Gravity.CENTER);
        android.widget.LinearLayout.LayoutParams titleParams =
            new android.widget.LinearLayout.LayoutParams(
                android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
            );
        titleParams.setMargins(0, 0, 0, 20);
        layout.addView(titleText, titleParams);

        // Prayer name
        TextView prayerNameText = new TextView(this);
        prayerNameText.setText(prayerName != null ? prayerName : "Prayer Time");
        prayerNameText.setTextSize(24);
        prayerNameText.setTextColor(0xFFFFFFFF);
        prayerNameText.setGravity(android.view.Gravity.CENTER);
        android.widget.LinearLayout.LayoutParams nameParams =
            new android.widget.LinearLayout.LayoutParams(
                android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
            );
        nameParams.setMargins(0, 0, 0, 40);
        layout.addView(prayerNameText, nameParams);

        // Message
        messageText = new TextView(this);
        messageText.setText("Take a moment to step away from distractions and connect with God through prayer.");
        messageText.setTextSize(16);
        messageText.setTextColor(0xE6FFFFFF);
        messageText.setGravity(android.view.Gravity.CENTER);
        messageText.setPadding(20, 20, 20, 20);
        android.widget.LinearLayout.LayoutParams messageParams =
            new android.widget.LinearLayout.LayoutParams(
                android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
            );
        messageParams.setMargins(0, 0, 0, 40);
        layout.addView(messageText, messageParams);

        // Timer
        timerText = new TextView(this);
        timerText.setText(String.format("%d:00", duration));
        timerText.setTextSize(48);
        timerText.setTextColor(0xFFFFFFFF);
        timerText.setGravity(android.view.Gravity.CENTER);
        android.widget.LinearLayout.LayoutParams timerParams =
            new android.widget.LinearLayout.LayoutParams(
                android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
            );
        timerParams.setMargins(0, 0, 0, 60);
        layout.addView(timerText, timerParams);

        // Begin Prayer button
        beginButton = new Button(this);
        beginButton.setText("Begin Prayer");
        beginButton.setTextSize(18);
        beginButton.setTextColor(0xFF1a9b8e);
        beginButton.setBackgroundColor(0xFFFFFFFF);
        beginButton.setPadding(40, 30, 40, 30);
        beginButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                handleBeginPrayer();
            }
        });
        android.widget.LinearLayout.LayoutParams beginParams =
            new android.widget.LinearLayout.LayoutParams(
                android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
            );
        beginParams.setMargins(0, 0, 0, 20);
        layout.addView(beginButton, beginParams);

        // Dismiss button
        dismissButton = new Button(this);
        dismissButton.setText("Not Now");
        dismissButton.setTextSize(16);
        dismissButton.setTextColor(0xE6FFFFFF);
        dismissButton.setBackgroundColor(0x00000000); // Transparent
        dismissButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                handleDismiss();
            }
        });
        layout.addView(dismissButton);

        setContentView(layout);

        // Start countdown
        startCountdown();
    }

    /**
     * Start countdown timer
     */
    private void startCountdown() {
        long totalMillis = duration * 60 * 1000L;

        countDownTimer = new CountDownTimer(totalMillis, 1000) {
            @Override
            public void onTick(long millisUntilFinished) {
                int minutes = (int) (millisUntilFinished / 1000) / 60;
                int seconds = (int) (millisUntilFinished / 1000) % 60;
                timerText.setText(String.format("%d:%02d", minutes, seconds));
            }

            @Override
            public void onFinish() {
                timerText.setText("0:00");
            }
        };

        countDownTimer.start();
    }

    /**
     * Handle begin prayer button
     */
    private void handleBeginPrayer() {
        // Notify React Native that prayer was started
        PrayerOverlayModule.notifyPrayerCompleted(scheduleId);

        // Open main app to prayer session
        openMainApp();
        finish();
    }

    /**
     * Handle dismiss button
     */
    private void handleDismiss() {
        // Notify React Native that prayer was dismissed
        PrayerOverlayModule.notifyPrayerDismissed(scheduleId);
        finish();
    }

    /**
     * Open main app
     */
    private void openMainApp() {
        try {
            Intent launchIntent = getPackageManager()
                .getLaunchIntentForPackage(getPackageName());
            if (launchIntent != null) {
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                launchIntent.setData(android.net.Uri.parse("sacred://prayer-session"));
                startActivity(launchIntent);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (countDownTimer != null) {
            countDownTimer.cancel();
        }
    }

    @Override
    public void onBackPressed() {
        // Prevent back button from dismissing
        // User must use the buttons
    }
}
