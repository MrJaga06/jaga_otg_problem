package com.otgguardian.app.data

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.otgguardian.app.MainActivity
import com.otgguardian.app.OtgGuardianApp
import com.otgguardian.app.R
import com.otgguardian.app.service.OtgAccessibilityService

object RecoveryManager {
    private const val TAG = "RecoveryManager"
    const val NOTIFICATION_ID_RECOVERY = 1002

    sealed class RecoveryResult {
        data object DirectSettingsSuccess : RecoveryResult()
        data object AccessibilityTriggered : RecoveryResult()
        data object InteractiveNotificationPosted : RecoveryResult()
        data class Failure(val reason: String) : RecoveryResult()
    }

    /**
     * Executes the optimal recovery path depending on permissions and capabilities.
     */
    fun performRecovery(context: Context, reason: String = "10-minute OxygenOS timeout detected"): RecoveryResult {
        Log.i(TAG, "Initiating recovery workflow: $reason")

        // 1. Check if ADB-granted WRITE_SECURE_SETTINGS is present
        if (OxygenOsHelper.hasWriteSecureSettings(context)) {
            val directSuccess = OxygenOsHelper.tryDirectToggle(context, true)
            if (directSuccess) {
                Log.i(TAG, "Recovery successful via WRITE_SECURE_SETTINGS direct toggle")
                notifyUser(context, "OTG Auto-Restored", "OTG was automatically re-enabled via direct system setting.")
                return RecoveryResult.DirectSettingsSuccess
            }
        }

        // 2. Check if Accessibility Service is active and authorized
        if (OtgAccessibilityService.isRunning) {
            Log.i(TAG, "Arming Accessibility Service for automatic UI toggle")
            OtgAccessibilityService.armAutoToggle()
            val launched = OxygenOsHelper.openOtgSettings(context)
            if (launched) {
                return RecoveryResult.AccessibilityTriggered
            }
        }

        // 3. Fallback: High-priority heads-up notification with 1-tap recovery intent
        postRecoveryNotification(context, reason)
        return RecoveryResult.InteractiveNotificationPosted
    }

    private fun postRecoveryNotification(context: Context, reason: String) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager ?: return

        // Pending intent to open OTG Settings
        val settingsIntent = Intent(context, MainActivity::class.java).apply {
            action = "com.otgguardian.app.ACTION_TRIGGER_SETTINGS"
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }
        val settingsPendingIntent = PendingIntent.getActivity(context, 101, settingsIntent, flags)

        val notification = NotificationCompat.Builder(context, OtgGuardianApp.CHANNEL_ALERTS)
            .setSmallIcon(R.drawable.ic_otg_tile)
            .setContentTitle("⚠️ OTG Disabled - Tap to Re-enable")
            .setContentText("OxygenOS deactivated OTG due to inactivity ($reason). Tap to restore immediately.")
            .setStyle(NotificationCompat.BigTextStyle().bigText("OxygenOS deactivated OTG ($reason).\n\nTap below to open OTG Connection settings and re-activate with one tap."))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setAutoCancel(true)
            .addAction(R.drawable.ic_otg_tile, "ENABLE OTG AGAIN", settingsPendingIntent)
            .setContentIntent(settingsPendingIntent)
            .build()

        notificationManager.notify(NOTIFICATION_ID_RECOVERY, notification)
    }

    private fun notifyUser(context: Context, title: String, text: String) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager ?: return
        val notification = NotificationCompat.Builder(context, OtgGuardianApp.CHANNEL_MONITORING)
            .setSmallIcon(R.drawable.ic_otg_tile)
            .setContentTitle(title)
            .setContentText(text)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .build()
        notificationManager.notify(1003, notification)
    }
}
