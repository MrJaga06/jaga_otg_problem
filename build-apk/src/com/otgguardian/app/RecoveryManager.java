package com.otgguardian.app;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

public class RecoveryManager {
    private static final String TAG = "RecoveryManager";
    public static final int NOTIFICATION_ID_RECOVERY = 1002;

    public static void performRecovery(Context context, String reason) {
        Log.i(TAG, "Initiating recovery workflow: " + reason);

        // Path 1: Direct ADB-granted WRITE_SECURE_SETTINGS
        if (OxygenOsHelper.hasWriteSecureSettings(context)) {
            boolean success = OxygenOsHelper.tryDirectToggle(context, true);
            if (success) {
                Log.i(TAG, "Recovery successful via WRITE_SECURE_SETTINGS direct toggle");
                return;
            }
        }

        // Path 2: Accessibility Service Auto-Toggle
        if (OtgAccessibilityService.isRunning) {
            Log.i(TAG, "Arming Accessibility Service for automated toggle");
            OtgAccessibilityService.armAutoToggle();
            OxygenOsHelper.openOtgSettings(context);
            return;
        }

        // Path 3: Heads-up notification with 1-tap restore action
        postAlertNotification(context, reason);
    }

    private static void postAlertNotification(Context context, String reason) {
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;

        Intent settingsIntent = new Intent(context, MainActivity.class);
        settingsIntent.setAction("com.otgguardian.app.ACTION_TRIGGER_SETTINGS");
        settingsIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);

        int flags = (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M)
            ? PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            : PendingIntent.FLAG_UPDATE_CURRENT;

        PendingIntent pi = PendingIntent.getActivity(context, 101, settingsIntent, flags);

        Notification.Builder builder;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            builder = new Notification.Builder(context, OtgGuardianApp.CHANNEL_ALERTS);
        } else {
            builder = new Notification.Builder(context);
        }

        builder.setSmallIcon(android.R.drawable.stat_sys_warning)
            .setContentTitle("⚠️ OTG Disabled - Tap to Re-enable")
            .setContentText("OxygenOS deactivated OTG (" + reason + "). Tap to restore.")
            .setContentIntent(pi)
            .setAutoCancel(true)
            .setPriority(Notification.PRIORITY_HIGH);

        nm.notify(NOTIFICATION_ID_RECOVERY, builder.build());
    }
}
