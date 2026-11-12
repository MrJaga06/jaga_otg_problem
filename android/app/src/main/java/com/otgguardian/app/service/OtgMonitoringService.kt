package com.otgguardian.app.service

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.hardware.usb.UsbDevice
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import com.otgguardian.app.MainActivity
import com.otgguardian.app.OtgGuardianApp
import com.otgguardian.app.R
import com.otgguardian.app.data.DataStoreManager
import com.otgguardian.app.data.OtgState
import com.otgguardian.app.data.OtgStateDetector
import com.otgguardian.app.data.RecoveryManager
import com.otgguardian.app.receiver.UsbEventReceiver
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.first

class OtgMonitoringService : Service() {

    private val serviceJob = SupervisorJob()
    private val serviceScope = CoroutineScope(Dispatchers.Default + serviceJob)
    private lateinit var dataStore: DataStoreManager

    private var countdownJob: Job? = null
    private var isDeviceConnected: Boolean = false
    private var lastAttachedDeviceName: String? = null

    override fun onCreate() {
        super.onCreate()
        dataStore = DataStoreManager(applicationContext)
        isRunning = true
        Log.i(TAG, "OtgMonitoringService created")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action ?: ACTION_START_MONITORING

        when (action) {
            ACTION_STOP_MONITORING -> {
                stopForeground(true)
                stopSelf()
                return START_NOT_STICKY
            }
            ACTION_START_MONITORING -> {
                startForegroundWithNotification()
                inspectCurrentHardwareState()
            }
            ACTION_DEVICE_ATTACHED -> {
                isDeviceConnected = true
                cancelWatchdogTimer()
                updateNotification("USB Device Connected", "Active connection prevents 10-min timeout")
            }
            ACTION_DEVICE_DETACHED -> {
                isDeviceConnected = false
                startInactivityWatchdog()
            }
        }

        return START_STICKY
    }

    private fun startForegroundWithNotification() {
        val notification = buildNotification(
            title = "OTG Guardian Active",
            content = "Monitoring OxygenOS 10-minute inactivity timeout"
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(
                NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_CONNECTED_DEVICE
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
    }

    private fun inspectCurrentHardwareState() {
        val connectedDevices = OtgStateDetector.getConnectedUsbDevices(this)
        if (connectedDevices.isNotEmpty()) {
            isDeviceConnected = true
            lastAttachedDeviceName = connectedDevices.first().productName ?: connectedDevices.first().deviceName
            updateNotification("OTG Active: Device Connected", "${connectedDevices.size} USB device(s) enumerated")
        } else {
            isDeviceConnected = false
            startInactivityWatchdog()
        }
    }

    /**
     * Efficient coroutine watchdog timer that tracks OxygenOS's 10-minute inactivity limit.
     * Avoids busy looping; uses single delay step or interval check.
     */
    private fun startInactivityWatchdog() {
        countdownJob?.cancel()
        countdownJob = serviceScope.launch {
            Log.d(TAG, "Inactivity watchdog started (10 minute OxygenOS limit).")
            updateNotification("OTG Standby", "No USB peripheral. Watchdog monitoring 10-minute limit.")

            // 10 minutes = 600 seconds
            delay(10 * 60 * 1000L)

            // When 10 minutes elapse without any USB peripheral connected:
            if (!isDeviceConnected) {
                Log.w(TAG, "10-minute inactivity threshold reached. OxygenOS turns OTG off!")
                val autoRecover = dataStore.autoRecoverFlow.first()

                withContext(Dispatchers.Main) {
                    if (autoRecover) {
                        RecoveryManager.performRecovery(applicationContext, "10-minute inactivity timeout reached")
                    } else {
                        // User chose notifications only
                        updateNotification("OTG Auto-Disabled", "OxygenOS 10-minute timeout reached. Tap to re-enable.")
                    }
                }
            }
        }
    }

    private fun cancelWatchdogTimer() {
        countdownJob?.cancel()
        countdownJob = null
    }

    private fun buildNotification(title: String, content: String): Notification {
        val appIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pIntentFlags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }
        val appPendingIntent = PendingIntent.getActivity(this, 0, appIntent, pIntentFlags)

        // Recovery Action
        val recoverIntent = Intent(this, UsbEventReceiver::class.java).apply {
            action = UsbEventReceiver.ACTION_RECOVER_OTG
        }
        val recoverPendingIntent = PendingIntent.getBroadcast(this, 1, recoverIntent, pIntentFlags)

        return NotificationCompat.Builder(this, OtgGuardianApp.CHANNEL_MONITORING)
            .setSmallIcon(R.drawable.ic_otg_tile)
            .setContentTitle(title)
            .setContentText(content)
            .setOngoing(true)
            .setContentIntent(appPendingIntent)
            .addAction(R.drawable.ic_otg_tile, "Restore OTG", recoverPendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }

    private fun updateNotification(title: String, content: String) {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as? android.app.NotificationManager
        notificationManager?.notify(NOTIFICATION_ID, buildNotification(title, content))
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        countdownJob?.cancel()
        serviceJob.cancel()
        Log.i(TAG, "OtgMonitoringService destroyed")
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        private const val TAG = "OtgMonitoringService"
        const val NOTIFICATION_ID = 1001
        const val ACTION_START_MONITORING = "com.otgguardian.app.START_MONITORING"
        const val ACTION_STOP_MONITORING = "com.otgguardian.app.STOP_MONITORING"
        const val ACTION_DEVICE_ATTACHED = "com.otgguardian.app.DEVICE_ATTACHED"
        const val ACTION_DEVICE_DETACHED = "com.otgguardian.app.DEVICE_DETACHED"

        var isRunning: Boolean = false
            private set

        fun startService(context: Context) {
            val intent = Intent(context, OtgMonitoringService::class.java).apply {
                action = ACTION_START_MONITORING
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun stopService(context: Context) {
            val intent = Intent(context, OtgMonitoringService::class.java).apply {
                action = ACTION_STOP_MONITORING
            }
            context.startService(intent)
        }

        fun onDeviceAttached(context: Context, device: UsbDevice?) {
            val intent = Intent(context, OtgMonitoringService::class.java).apply {
                action = ACTION_DEVICE_ATTACHED
            }
            context.startService(intent)
        }

        fun onDeviceDetached(context: Context) {
            val intent = Intent(context, OtgMonitoringService::class.java).apply {
                action = ACTION_DEVICE_DETACHED
            }
            context.startService(intent)
        }
    }
}
