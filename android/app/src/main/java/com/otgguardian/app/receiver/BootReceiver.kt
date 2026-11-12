package com.otgguardian.app.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import com.otgguardian.app.data.DataStoreManager
import com.otgguardian.app.service.OtgMonitoringService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class BootReceiver : BroadcastReceiver() {

    private val scope = CoroutineScope(Dispatchers.IO)

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED || intent.action == Intent.ACTION_MY_PACKAGE_REPLACED) {
            Log.i("BootReceiver", "Boot or package update completed, checking OTG Guardian state...")

            scope.launch {
                val dataStore = DataStoreManager(context)
                val keepEnabled = dataStore.keepEnabledFlow.first()

                if (keepEnabled) {
                    Log.i("BootReceiver", "Keep OTG Enabled is active, restarting OtgMonitoringService...")
                    val serviceIntent = Intent(context, OtgMonitoringService::class.java).apply {
                        action = OtgMonitoringService.ACTION_START_MONITORING
                    }
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        context.startForegroundService(serviceIntent)
                    } else {
                        context.startService(serviceIntent)
                    }
                }
            }
        }
    }
}
