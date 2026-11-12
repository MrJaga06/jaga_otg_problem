package com.otgguardian.app;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.provider.Settings;
import android.util.Log;

public class OxygenOsHelper {
    private static final String TAG = "OxygenOsHelper";
    public static final String SETTING_OTG_ENABLED = "otg_enabled";
    public static final String SETTING_OPLUS_OTG_STATE = "oplus_otg_state";

    public static boolean openOtgSettings(Context context) {
        Intent[] candidates = new Intent[] {
            new Intent("oplus.intent.action.OTG_SETTINGS"),
            new Intent().setComponent(new ComponentName("com.android.settings", "com.android.settings.Settings$OtgSettingsActivity")),
            new Intent().setComponent(new ComponentName("com.oplus.wirelesssettings", "com.oplus.wirelesssettings.WirelessSettings")),
            new Intent(Settings.ACTION_SETTINGS)
        };

        for (Intent intent : candidates) {
            try {
                Intent candidate = new Intent(intent);
                candidate.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                if (candidate.resolveActivity(context.getPackageManager()) != null) {
                    context.startActivity(candidate);
                    Log.i(TAG, "Launched intent: " + (intent.getComponent() != null ? intent.getComponent() : intent.getAction()));
                    return true;
                }
            } catch (Exception e) {
                Log.w(TAG, "Failed candidate: " + e.getMessage());
            }
        }

        try {
            Intent fallback = new Intent(Settings.ACTION_SETTINGS);
            fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(fallback);
            return true;
        } catch (Exception e) {
            Log.e(TAG, "Failed fallback settings", e);
            return false;
        }
    }

    public static boolean hasWriteSecureSettings(Context context) {
        try {
            return context.checkCallingOrSelfPermission("android.permission.WRITE_SECURE_SETTINGS") ==
                PackageManager.PERMISSION_GRANTED;
        } catch (Exception e) {
            return false;
        }
    }

    public static boolean tryDirectToggle(Context context, boolean enable) {
        if (!hasWriteSecureSettings(context)) return false;
        int value = enable ? 1 : 0;
        try {
            Settings.Global.putInt(context.getContentResolver(), SETTING_OTG_ENABLED, value);
            try {
                Settings.Global.putInt(context.getContentResolver(), SETTING_OPLUS_OTG_STATE, value);
            } catch (Exception ignored) {}
            Log.i(TAG, "Directly wrote otg_enabled=" + value);
            return true;
        } catch (Exception e) {
            Log.e(TAG, "Error writing secure settings", e);
            return false;
        }
    }

    public static final String[] ACCESSIBILITY_KEYWORDS = new String[] {
        "OTG", "OTG connection", "OTG Connection", "OTG-Verbindung", "Connexion OTG"
    };
}
