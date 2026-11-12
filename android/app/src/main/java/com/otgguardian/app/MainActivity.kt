package com.otgguardian.app

import android.Manifest
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.provider.Settings
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.otgguardian.app.data.*
import com.otgguardian.app.service.OtgAccessibilityService
import com.otgguardian.app.service.OtgMonitoringService
import com.otgguardian.app.ui.screens.*
import com.otgguardian.app.ui.theme.AmoledBlack
import com.otgguardian.app.ui.theme.CyanAccent
import com.otgguardian.app.ui.theme.DarkBorder
import com.otgguardian.app.ui.theme.DarkSurface
import com.otgguardian.app.ui.theme.OTGGuardianTheme
import com.otgguardian.app.ui.theme.TextMuted
import com.otgguardian.app.ui.theme.TextPrimary
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private lateinit var dataStore: DataStoreManager

    private val notificationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            Toast.makeText(this, "Notification permission enabled", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        dataStore = DataStoreManager(applicationContext)

        // Handle trigger action if launched from notification action
        handleIncomingIntent(intent)

        setContent {
            OTGGuardianTheme {
                MainAppScaffold()
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleIncomingIntent(intent)
    }

    private fun handleIncomingIntent(intent: Intent?) {
        if (intent?.action == "com.otgguardian.app.ACTION_TRIGGER_SETTINGS") {
            OxygenOsHelper.openOtgSettings(this)
        }
    }

    @Composable
    private fun MainAppScaffold() {
        val coroutineScope = rememberCoroutineScope()
        var selectedScreen by remember { mutableStateOf(Screen.DASHBOARD) }

        // Live state collections
        val isKeepEnabled by dataStore.keepEnabledFlow.collectAsState(initial = false)
        val isAutoRecover by dataStore.autoRecoverFlow.collectAsState(initial = true)
        val recoveryMode by dataStore.recoveryModeFlow.collectAsState(initial = RecoveryMode.ACCESSIBILITY_AUTO)
        val isNotificationActive by dataStore.notifyStatusFlow.collectAsState(initial = true)
        val lastActivationTime by dataStore.lastActivationTimeFlow.collectAsState(initial = 0L)
        val lastStatusChangeTime by dataStore.lastStatusChangeTimeFlow.collectAsState(initial = 0L)

        // Device detection state
        var otgState by remember { mutableStateOf(OtgStateDetector.detectOtgState(this@MainActivity)) }
        var connectedDevices by remember { mutableStateOf(OtgStateDetector.getConnectedUsbDevices(this@MainActivity)) }

        // Dynamic event log
        val eventLogs = remember { mutableStateListOf<OtgLogEvent>() }

        // Initial log event
        LaunchedEffect(Unit) {
            eventLogs.add(
                OtgLogEvent(
                    eventType = OtgLogEvent.EventType.SERVICE_STARTED,
                    title = "App Initialized",
                    description = "Target verified: OnePlus Nord CE 2 Lite 5G (OxygenOS 14)"
                )
            )
        }

        // Periodic state refresh
        LaunchedEffect(Unit) {
            while (true) {
                otgState = OtgStateDetector.detectOtgState(this@MainActivity)
                connectedDevices = OtgStateDetector.getConnectedUsbDevices(this@MainActivity)
                kotlinx.coroutines.delay(2000)
            }
        }

        val hasNotificationPermission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.checkSelfPermission(
                this@MainActivity,
                Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
        } else {
            true
        }

        val isBatteryExempt = (getSystemService(Context.POWER_SERVICE) as? PowerManager)
            ?.isIgnoringBatteryOptimizations(packageName) ?: false

        val hasWriteSecureSettings = OxygenOsHelper.hasWriteSecureSettings(this@MainActivity)

        Scaffold(
            bottomBar = {
                NavigationBar(
                    containerColor = AmoledBlack,
                    contentColor = TextPrimary,
                    tonalElevation = 8.dp
                ) {
                    Screen.entries.forEach { screen ->
                        NavigationBarItem(
                            selected = selectedScreen == screen,
                            onClick = { selectedScreen = screen },
                            icon = {
                                Icon(
                                    imageVector = screen.icon,
                                    contentDescription = screen.title
                                )
                            },
                            label = { Text(screen.title) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = CyanAccent,
                                selectedTextColor = CyanAccent,
                                indicatorColor = DarkSurface,
                                unselectedIconColor = TextMuted,
                                unselectedTextColor = TextMuted
                            )
                        )
                    }
                }
            }
        ) { paddingValues ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
            ) {
                when (selectedScreen) {
                    Screen.DASHBOARD -> DashboardScreen(
                        otgState = otgState,
                        isKeepEnabledActive = isKeepEnabled,
                        onKeepEnabledToggle = { enabled ->
                            coroutineScope.launch {
                                dataStore.setKeepEnabled(enabled)
                                if (enabled) {
                                    OtgMonitoringService.startService(this@MainActivity)
                                    eventLogs.add(
                                        0,
                                        OtgLogEvent(
                                            eventType = OtgLogEvent.EventType.SERVICE_STARTED,
                                            title = "Guard Activated",
                                            description = "KEEP OTG ENABLED watchdog service engaged."
                                        )
                                    )
                                } else {
                                    OtgMonitoringService.stopService(this@MainActivity)
                                    eventLogs.add(
                                        0,
                                        OtgLogEvent(
                                            eventType = OtgLogEvent.EventType.SERVICE_STOPPED,
                                            title = "Guard Disarmed",
                                            description = "Background watchdog monitoring stopped."
                                        )
                                    )
                                }
                            }
                        },
                        connectedDevices = connectedDevices,
                        isMonitoringRunning = OtgMonitoringService.isRunning,
                        lastActivationTime = lastActivationTime,
                        lastStatusChangeTime = lastStatusChangeTime,
                        onEnableOtgAgainClick = {
                            eventLogs.add(
                                0,
                                OtgLogEvent(
                                    eventType = OtgLogEvent.EventType.RECOVERY_TRIGGERED,
                                    title = "Recovery Triggered",
                                    description = "Manual restore requested by user."
                                )
                            )
                            val result = RecoveryManager.performRecovery(this@MainActivity, "User 1-Tap Trigger")
                            coroutineScope.launch {
                                dataStore.recordActivation()
                            }
                        }
                    )

                    Screen.USB_ACTIVITY -> UsbActivityScreen(
                        connectedDevices = connectedDevices,
                        onRefreshUsbDevices = {
                            connectedDevices = OtgStateDetector.getConnectedUsbDevices(this@MainActivity)
                            otgState = OtgStateDetector.detectOtgState(this@MainActivity)
                            Toast.makeText(this@MainActivity, "USB devices updated", Toast.LENGTH_SHORT).show()
                        }
                    )

                    Screen.AUTOMATION -> AutomationScreen(
                        isKeepEnabledActive = isKeepEnabled,
                        onKeepEnabledChange = { enabled ->
                            coroutineScope.launch { dataStore.setKeepEnabled(enabled) }
                        },
                        isAutoRecoverActive = isAutoRecover,
                        onAutoRecoverChange = { autoRecover ->
                            coroutineScope.launch { dataStore.setAutoRecover(autoRecover) }
                        },
                        selectedRecoveryMode = recoveryMode,
                        onRecoveryModeChange = { mode ->
                            coroutineScope.launch { dataStore.setRecoveryMode(mode) }
                        },
                        isNotificationActive = isNotificationActive,
                        onNotificationChange = { notify ->
                            coroutineScope.launch { dataStore.setNotifyStatus(notify) }
                        },
                        isAccessibilityRunning = OtgAccessibilityService.isRunning,
                        hasWriteSecureSettings = hasWriteSecureSettings,
                        onOpenAccessibilitySettings = {
                            startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
                        },
                        onOpenBatterySettings = {
                            try {
                                val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                                    data = Uri.parse("package:$packageName")
                                }
                                startActivity(intent)
                            } catch (e: Exception) {
                                startActivity(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS))
                            }
                        }
                    )

                    Screen.PERMISSIONS -> PermissionsScreen(
                        hasNotificationPermission = hasNotificationPermission,
                        onRequestNotificationPermission = {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                                notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                            }
                        },
                        isAccessibilityEnabled = OtgAccessibilityService.isRunning,
                        onOpenAccessibilitySettings = {
                            startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
                        },
                        isBatteryOptimizedExempt = isBatteryExempt,
                        onRequestBatteryExemption = {
                            try {
                                val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                                    data = Uri.parse("package:$packageName")
                                }
                                startActivity(intent)
                            } catch (e: Exception) {
                                startActivity(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS))
                            }
                        },
                        hasWriteSecureSettings = hasWriteSecureSettings,
                        onCopyAdbCommand = { cmd ->
                            val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            clipboard.setPrimaryClip(ClipData.newPlainText("ADB Command", cmd))
                            Toast.makeText(this@MainActivity, "Copied to clipboard", Toast.LENGTH_SHORT).show()
                        }
                    )

                    Screen.HISTORY -> HistoryScreen(
                        events = eventLogs,
                        onClearHistory = {
                            eventLogs.clear()
                            Toast.makeText(this@MainActivity, "History cleared", Toast.LENGTH_SHORT).show()
                        }
                    )
                }
            }
        }
    }

    enum class Screen(val title: String, val icon: ImageVector) {
        DASHBOARD("Dashboard", Icons.Default.Dashboard),
        USB_ACTIVITY("USB Devices", Icons.Default.Usb),
        AUTOMATION("Automation", Icons.Default.Tune),
        PERMISSIONS("Permissions", Icons.Default.VerifiedUser),
        HISTORY("History", Icons.Default.History)
    }
}
