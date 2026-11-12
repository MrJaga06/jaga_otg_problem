package com.otgguardian.app

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build

class OtgGuardianApp : Application() {

    override fun onCreate() {
        super.onCreate()
        instance = this
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = getSystemService(NotificationManager::class.java)

            // Low/Default priority ongoing monitoring channel
            val monitorChannel = NotificationChannel(
                CHANNEL_MONITORING,
                getString(R.string.notification_channel_name),
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = getString(R.string.notification_channel_desc)
                setShowBadge(false)
            }

            // High priority channel for OTG Timeout & Disconnect Recovery Alerts
            val alertChannel = NotificationChannel(
                CHANNEL_ALERTS,
                getString(R.string.notification_alert_channel_name),
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = getString(R.string.notification_alert_channel_desc)
                enableVibration(true)
                setShowBadge(true)
            }

            notificationManager.createNotificationChannel(monitorChannel)
            notificationManager.createNotificationChannel(alertChannel)
        }
    }

    companion object {
        lateinit var instance: OtgGuardianApp
            private set

        const val CHANNEL_MONITORING = "otg_guardian_monitoring"
        const val CHANNEL_ALERTS = "otg_guardian_alerts"
    }
}
