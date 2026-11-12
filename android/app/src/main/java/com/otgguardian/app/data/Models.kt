package com.otgguardian.app.data

enum class OtgState {
    ON,
    OFF,
    UNKNOWN
}

enum class RecoveryMode {
    ACCESSIBILITY_AUTO,
    DIRECT_SECURE_SETTINGS,
    INTERACTIVE_NOTIFICATION
}

data class UsbDeviceInfo(
    val deviceName: String,
    val manufacturerName: String?,
    val productName: String?,
    val vendorId: Int,
    val productId: Int,
    val deviceClass: Int,
    val connectedAt: Long = System.currentTimeMillis()
) {
    val formattedVidPid: String
        get() = String.format("VID: 0x%04X | PID: 0x%04X", vendorId, productId)

    val deviceClassLabel: String
        get() = when (deviceClass) {
            0 -> "Composite / Multi-function"
            1 -> "Audio (DAC / Headset)"
            2 -> "Communications (CDC)"
            3 -> "HID (Keyboard / Mouse / Controller)"
            8 -> "Mass Storage (Flash Drive / SSD)"
            9 -> "USB Hub"
            else -> "Peripheral (Class $deviceClass)"
        }
}

data class OtgLogEvent(
    val id: String = java.util.UUID.randomUUID().toString(),
    val timestamp: Long = System.currentTimeMillis(),
    val eventType: EventType,
    val title: String,
    val description: String,
    val isSuccess: Boolean = true
) {
    enum class EventType {
        OTG_STATE_CHANGE,
        USB_CONNECTED,
        USB_DISCONNECTED,
        RECOVERY_TRIGGERED,
        RECOVERY_SUCCESS,
        RECOVERY_FAILED,
        SERVICE_STARTED,
        SERVICE_STOPPED,
        TIMEOUT_WATCHDOG
    }
}

data class DeviceTargetSpec(
    val manufacturer: String = "OnePlus",
    val model: String = "CPH2381 (OnePlus Nord CE 2 Lite 5G)",
    val osVersion: String = "OxygenOS 14.0",
    val androidVersion: String = "Android 14 (API 34)",
    val firmware: String = "CPH2381_14.0.0.0.3000(EX01C10P02)",
    val hardwareTimeoutMinutes: Int = 10
)
