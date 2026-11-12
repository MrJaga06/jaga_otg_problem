package com.otgguardian.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;

public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction()) ||
            Intent.ACTION_MY_PACKAGE_REPLACED.equals(intent.getAction())) {
            SharedPreferences prefs = context.getSharedPreferences("otg_guardian", Context.MODE_PRIVATE);
            boolean keepEnabled = prefs.getBoolean("keep_otg_enabled", true);
            if (keepEnabled) {
                Log.i("BootReceiver", "Starting OtgMonitoringService on boot");
                OtgMonitoringService.startService(context);
            }
        }
    }
}
