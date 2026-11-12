package com.otgguardian.app.data

import android.content.Context
import android.hardware.usb.UsbManager
import android.provider.Settings
import android.util.Log
import java.io.File

object OtgStateDetector {
    private const val TAG = "OtgStateDetector"

    // Common OxygenOS / Android sysfs paths for USB VBUS / OTG status inspection
    private val KNOWN_SYSFS_PATHS = listOf(
        "/sys/class/power_supply/usb/otg_switch",
        "/sys/class/power_supply/usb/otg_online",
        "/sys/devices/platform/soc/4e00000.qcom,dwc3/otg_state",
        "/sys/class/typec/port0/power_role"
    )

    /**
     * Determines genuine OTG state using system settings, sysfs probes, and device state.
     * Guaranteed never to produce fake status: returns UNKNOWN if OS hides the switch state.
     */
    fun detectOtgState(context: Context): OtgState {
        // Method 1: Check Settings.Global (OxygenOS / ColorOS standard key: "otg_enabled")
        try {
            val globalOtg = Settings.Global.getInt(context.contentResolver, OxygenOsHelper.SETTING_OTG_ENABLED, -1)
            if (globalOtg == 1) return OtgState.ON
            if (globalOtg == 0) return OtgState.OFF
        } catch (e: Exception) {
            Log.v(TAG, "Settings.Global otg_enabled not accessible: ${e.message}")
        }

        // Method 2: Check OPlus OEM specific setting "oplus_otg_state"
        try {
            val oplusOtg = Settings.Global.getInt(context.contentResolver, OxygenOsHelper.SETTING_OPLUS_OTG_STATE, -1)
            if (oplusOtg == 1) return OtgState.ON
            if (oplusOtg == 0) return OtgState.OFF
        } catch (e: Exception) {
            Log.v(TAG, "Settings.Global oplus_otg_state not accessible: ${e.message}")
        }

        // Method 3: Probe read-accessible sysfs nodes
        for (path in KNOWN_SYSFS_PATHS) {
            val file = File(path)
            if (file.exists() && file.canRead()) {
                try {
                    val content = file.readText().trim()
                    if (content == "1" || content.equals("source", ignoreCase = true) || content.equals("host", ignoreCase = true)) {
                        return OtgState.ON
                    } else if (content == "0" || content.equals("sink", ignoreCase = true) || content.equals("device", ignoreCase = true)) {
                        return OtgState.OFF
                    }
                } catch (e: Exception) {
                    Log.v(TAG, "Cannot read sysfs node $path: ${e.message}")
                }
            }
        }

        // Method 4: Check if USB peripherals are actively enumerated via UsbManager
        // Note: active peripherals prove VBUS power is delivered, but absence does NOT prove OTG is off.
        val usbManager = context.getSystemService(Context.USB_SERVICE) as? UsbManager
        val connectedDevices = usbManager?.deviceList
        if (connectedDevices != null && connectedDevices.isNotEmpty()) {
            return OtgState.ON
        }

        // Strict Requirement: OxygenOS restricted sandbox hides switch when no device is connected.
        // Return UNKNOWN rather than guessing false ON/OFF.
        return OtgState.UNKNOWN
    }

    /**
     * Retrieves list of currently enumerated USB peripherals through Android USB Host API.
     */
    fun getConnectedUsbDevices(context: Context): List<UsbDeviceInfo> {
        val usbManager = context.getSystemService(Context.USB_SERVICE) as? UsbManager ?: return emptyList()
        val deviceMap = usbManager.deviceList ?: return emptyList()

        return deviceMap.values.map { usbDevice ->
            UsbDeviceInfo(
                deviceName = usbDevice.deviceName,
                manufacturerName = try { usbDevice.manufacturerName } catch (_: Exception) { null },
                productName = try { usbDevice.productName } catch (_: Exception) { null },
                vendorId = usbDevice.vendorId,
                productId = usbDevice.productId,
                deviceClass = usbDevice.deviceClass
            )
        }
    }
}
