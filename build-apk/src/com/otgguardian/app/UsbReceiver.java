package com.otgguardian.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.hardware.usb.UsbManager;
import android.util.Log;

public class UsbReceiver extends BroadcastReceiver {
    private static final String TAG = "UsbReceiver";
    public static final String ACTION_RECOVER_OTG = "com.otgguardian.app.ACTION_RECOVER_OTG";

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        if (action == null) return;

        if (UsbManager.ACTION_USB_DEVICE_ATTACHED.equals(action)) {
            Log.i(TAG, "USB attached");
            OtgMonitoringService.onDeviceAttached(context);
        } else if (UsbManager.ACTION_USB_DEVICE_DETACHED.equals(action)) {
            Log.i(TAG, "USB detached - 10m countdown starts");
            OtgMonitoringService.onDeviceDetached(context);
        } else if (ACTION_RECOVER_OTG.equals(action)) {
            Log.i(TAG, "Manual recovery requested");
            RecoveryManager.performRecovery(context, "Notification Action");
        }
    }
}
