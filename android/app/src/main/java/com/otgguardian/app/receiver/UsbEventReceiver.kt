package com.otgguardian.app.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.hardware.usb.UsbDevice
import android.hardware.usb.UsbManager
import android.util.Log
import com.otgguardian.app.data.DataStoreManager
import com.otgguardian.app.data.OtgState
import com.otgguardian.app.data.RecoveryManager
import com.otgguardian.app.service.OtgMonitoringService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class UsbEventReceiver : BroadcastReceiver() {

    private val scope = CoroutineScope(Dispatchers.IO)

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return
        val dataStore = DataStoreManager(context)

        when (action) {
            UsbManager.ACTION_USB_DEVICE_ATTACHED -> {
                val device = intent.getParcelableExtra<UsbDevice>(UsbManager.EXTRA_DEVICE)
                val deviceName = device?.productName ?: device?.deviceName ?: "USB Peripheral"
                Log.i(TAG, "USB Device Attached: $deviceName (${device?.vendorId}:${device?.productId})")

                scope.launch {
                    dataStore.recordStatusChange(OtgState.ON)
                    dataStore.recordActivation()
                }

                // Notify monitoring service that active peripheral is holding the connection
                OtgMonitoringService.onDeviceAttached(context, device)
            }

            UsbManager.ACTION_USB_DEVICE_DETACHED -> {
                val device = intent.getParcelableExtra<UsbDevice>(UsbManager.EXTRA_DEVICE)
                Log.i(TAG, "USB Device Detached: ${device?.productName ?: "USB Device"}")

                // OxygenOS begins its 10-minute inactivity shutdown countdown
                OtgMonitoringService.onDeviceDetached(context)
            }

            ACTION_RECOVER_OTG -> {
                Log.i(TAG, "Manual recovery requested via broadcast intent")
                RecoveryManager.performRecovery(context, "Action button pressed")
            }
        }
    }

    companion object {
        private const val TAG = "UsbEventReceiver"
        const val ACTION_RECOVER_OTG = "com.otgguardian.app.ACTION_RECOVER_OTG"
    }
}
