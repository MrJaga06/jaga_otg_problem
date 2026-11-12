package com.otgguardian.app.data

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.util.Log

object OxygenOsHelper {
    private const val TAG = "OxygenOsHelper"

    // Target Device Specifications
    const val TARGET_MANUFACTURER = "OnePlus"
    const val TARGET_MODEL = "CPH2381"
    const val TARGET_FIRMWARE = "CPH2381_14.0.0.0.3000(EX01C10P02)"
    const val TIMEOUT_MILLIS = 10 * 60 * 1000L // 10 minutes exact hardware shutdown

    // OxygenOS / ColorOS Known Settings Keys
    const val SETTING_OTG_ENABLED = "otg_enabled"
    const val SETTING_OPLUS_OTG_STATE = "oplus_otg_state"
    const val SETTING_PERSIST_OTG = "persist.sys.oplus.otg_support"

    // OxygenOS 14 Specific Package & Activity names
    private val SETTINGS_TARGETS = listOf(
        // Intent 1: Direct OEM Action for OxygenOS 13/14
        Intent("oplus.intent.action.OTG_SETTINGS"),
        
        // Intent 2: Android / OnePlus Settings Otg Activity
        Intent().setComponent(
            ComponentName(
                "com.android.settings",
                "com.android.settings.Settings\$OtgSettingsActivity"
            )
        ),

        // Intent 3: Oplus Wireless Settings subsystem
        Intent().setComponent(
            ComponentName(
                "com.oplus.wirelesssettings",
                "com.oplus.wirelesssettings.WirelessSettings"
            )
        ),

        // Intent 4: System / Additional Settings category
        Intent().setComponent(
            ComponentName(
                "com.android.settings",
                "com.android.settings.SubSettings"
            )
        ).putExtra(":settings:show_fragment", "com.oplus.settings.feature.othersettings.OtgFragment"),

        // Fallback: General System Settings
        Intent(Settings.ACTION_SETTINGS)
    )

    /**
     * Attempts to open the exact OxygenOS OTG Settings toggle screen.
     * Tries OEM-specific intent first, cascading down to safe fallbacks.
     */
    fun openOtgSettings(context: Context): Boolean {
        for (intent in SETTINGS_TARGETS) {
            try {
                val candidateIntent = Intent(intent).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
                    addFlags(Intent.FLAG_ACTIVITY_NO_ANIMATION)
                }
                if (candidateIntent.resolveActivity(context.packageManager) != null) {
                    context.startActivity(candidateIntent)
                    Log.d(TAG, "Launched OTG settings using: ${intent.component ?: intent.action}")
                    return true
                }
            } catch (e: Exception) {
                Log.w(TAG, "Failed launching intent: ${intent.action}", e)
            }
        }

        // Ultimate fallback: Standard Android Settings
        return try {
            val fallback = Intent(Settings.ACTION_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(fallback)
            true
        } catch (e: Exception) {
            Log.e(TAG, "Cannot launch any settings screen", e)
            false
        }
    }

    /**
     * Checks whether WRITE_SECURE_SETTINGS has been granted via ADB.
     */
    fun hasWriteSecureSettings(context: Context): Boolean {
        return try {
            context.checkCallingOrSelfPermission(android.Manifest.permission.WRITE_SECURE_SETTINGS) ==
                    android.content.pm.PackageManager.PERMISSION_GRANTED
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Tries direct hardware/system setting toggle if privileged permission is granted via ADB.
     */
    

    fun tryDirectToggle(context: Context, enable: Boolean): Boolean {
        if (!hasWriteSecureSettings(context)) {
            Log.w(TAG, "WRITE_SECURE_SETTINGS not granted.")
            return false
        }

        val targetValue = if (enable) 1 else 0

        return try {
            val writeAccepted = Settings.Global.putInt(
                context.contentResolver,
                SETTING_OTG_ENABLED,
                targetValue
            )

            if (!writeAccepted) {
                Log.w(TAG, "Android rejected the OTG setting write.")
                return false
            }

            val actualValue = Settings.Global.getInt(
                context.contentResolver,
                SETTING_OTG_ENABLED,
                -1
            )

            if (actualValue != targetValue) {
                Log.w(TAG, "OTG setting read-back did not match.")
                return false
            }

            Log.i(TAG, "OTG setting value successfully written and verified.")
            true

        } catch (e: SecurityException) {
            Log.e(TAG, "Missing permission for direct OTG setting.", e)
            false
        } catch (e: Exception) {
            Log.e(TAG, "Direct OTG setting failed.", e)
            false
        }
    }

    /**
     * Generates one-click copyable ADB commands for OxygenOS 14.
     */
    fun getAdbGrantCommand(packageName: String): String {
        return "adb shell pm grant $packageName android.permission.WRITE_SECURE_SETTINGS"
    }

    fun getAdbDirectOtgCommand(): String {
        return "adb shell settings put global otg_enabled 1"
    }

    fun getAdbWhitelistCommand(packageName: String): String {
        return "adb shell dumpsys deviceidle whitelist +$packageName"
    }

    /**
     * Accessibility Service Node Matching Keywords for OxygenOS 14
     */
    val ACCESSIBILITY_KEYWORDS = listOf(
        "OTG",
        "OTG connection",
        "OTG Connection",
        "OTG-Verbindung",
        "Connexion OTG",
        "Conexión OTG",
        "Connessione OTG",
        "Conexão OTG"
    )
}
