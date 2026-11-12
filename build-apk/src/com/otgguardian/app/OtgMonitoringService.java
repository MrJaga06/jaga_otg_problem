package com.otgguardian.app;

import android.app.Notification;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.util.Log;
import java.util.List;

public class OtgMonitoringService extends Service {
    private static final String TAG = "OtgMonitoringService";
    public static final int NOTIFICATION_ID = 1001;
    public static volatile boolean isRunning = false;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private boolean isDeviceConnected = false;
    private final Runnable timeoutRunnable = new Runnable() {
        @Override
        public void run() {
            if (!isDeviceConnected) {
                Log.w(TAG, "OxygenOS 10m timeout threshold elapsed!");
                RecoveryManager.performRecovery(getApplicationContext(), "10-minute timeout reached");
            }
        }
    };

    @Override
    public void onCreate() {
        super.onCreate();
        isRunning = true;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String action = intent != null ? intent.getAction() : "ACTION_START";

        if ("ACTION_STOP".equals(action)) {
            stopForeground(true);
            stopSelf();
            return START_NOT_STICKY;
        }

        Notification notification = buildNotification("OTG Guardian Active", "Monitoring OxygenOS 10-minute timeout");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_CONNECTED_DEVICE);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }

        if ("ACTION_DEVICE_ATTACHED".equals(action)) {
            isDeviceConnected = true;
            handler.removeCallbacks(timeoutRunnable);
            updateNotification("USB Device Connected", "Inactivity timer paused");
        } else if ("ACTION_DEVICE_DETACHED".equals(action)) {
            isDeviceConnected = false;
            startWatchdog();
        } else {
            List<String> devices = OtgStateDetector.getConnectedDeviceNames(this);
            isDeviceConnected = !devices.isEmpty();
            if (isDeviceConnected) {
                handler.removeCallbacks(timeoutRunnable);
                updateNotification("OTG Active: Peripheral Connected", devices.size() + " active peripheral(s)");
            } else {
                startWatchdog();
            }
        }

        return START_STICKY;
    }

    private void startWatchdog() {
        handler.removeCallbacks(timeoutRunnable);
        // OxygenOS hardware limit = 10 minutes (600,000ms)
        handler.postDelayed(timeoutRunnable, 600000L);
        updateNotification("OTG Standby", "No USB peripheral. Watchdog monitoring 10-minute limit.");
    }

    private Notification buildNotification(String title, String content) {
        Intent appIntent = new Intent(this, MainActivity.class);
        int pFlags = (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M)
            ? PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            : PendingIntent.FLAG_UPDATE_CURRENT;

        PendingIntent pi = PendingIntent.getActivity(this, 0, appIntent, pFlags);

        Intent recoverIntent = new Intent(this, UsbReceiver.class);
        recoverIntent.setAction(UsbReceiver.ACTION_RECOVER_OTG);
        PendingIntent recoverPi = PendingIntent.getBroadcast(this, 1, recoverIntent, pFlags);

        Notification.Builder builder;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            builder = new Notification.Builder(this, OtgGuardianApp.CHANNEL_MONITORING);
        } else {
            builder = new Notification.Builder(this);
        }

        builder.setSmallIcon(android.R.drawable.stat_sys_data_bluetooth)
            .setContentTitle(title)
            .setContentText(content)
            .setContentIntent(pi)
            .addAction(android.R.drawable.ic_menu_rotate, "Restore OTG", recoverPi)
            .setOngoing(true);

        return builder.build();
    }

    private void updateNotification(String title, String content) {
        android.app.NotificationManager nm = (android.app.NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) {
            nm.notify(NOTIFICATION_ID, buildNotification(title, content));
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        isRunning = false;
        handler.removeCallbacks(timeoutRunnable);
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    public static void startService(Context context) {
        Intent intent = new Intent(context, OtgMonitoringService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(intent);
        } else {
            context.startService(intent);
        }
    }

    public static void stopService(Context context) {
        Intent intent = new Intent(context, OtgMonitoringService.class);
        intent.setAction("ACTION_STOP");
        context.startService(intent);
    }

    public static void onDeviceAttached(Context context) {
        Intent intent = new Intent(context, OtgMonitoringService.class);
        intent.setAction("ACTION_DEVICE_ATTACHED");
        context.startService(intent);
    }

    public static void onDeviceDetached(Context context) {
        Intent intent = new Intent(context, OtgMonitoringService.class);
        intent.setAction("ACTION_DEVICE_DETACHED");
        context.startService(intent);
    }
}
