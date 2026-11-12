package com.otgguardian.app;

import android.app.Application;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;

public class OtgGuardianApp extends Application {
    public static final String CHANNEL_MONITORING = "otg_guardian_monitoring";
    public static final String CHANNEL_ALERTS = "otg_guardian_alerts";

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannels();
    }

    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm != null) {
                NotificationChannel monitorChannel = new NotificationChannel(
                    CHANNEL_MONITORING,
                    "OTG Guardian Monitor",
                    NotificationManager.IMPORTANCE_LOW
                );
                monitorChannel.setDescription("Background monitoring for OxygenOS 10m OTG timeout");
                monitorChannel.setShowBadge(false);

                NotificationChannel alertChannel = new NotificationChannel(
                    CHANNEL_ALERTS,
                    "OTG Timeout Alerts",
                    NotificationManager.IMPORTANCE_HIGH
                );
                alertChannel.setDescription("High priority recovery notifications when OTG turns off");
                alertChannel.enableVibration(true);
                alertChannel.setShowBadge(true);

                nm.createNotificationChannel(monitorChannel);
                nm.createNotificationChannel(alertChannel);
            }
        }
    }
}
