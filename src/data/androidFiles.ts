import { AndroidFileRecord } from '../types';

export const ANDROID_PROJECT_FILES: AndroidFileRecord[] = [
  {
    path: 'android/settings.gradle.kts',
    filename: 'settings.gradle.kts',
    language: 'kotlin',
    category: 'config',
    description: 'Gradle project repositories and module include declaration.',
    content: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "OTG Guardian"
include(":app")`
  },
  {
    path: 'android/build.gradle.kts',
    filename: 'build.gradle.kts (Project)',
    language: 'kotlin',
    category: 'config',
    description: 'Top-level build script declaring Android and Kotlin Gradle plugins.',
    content: `plugins {
    id("com.android.application") version "8.3.0" apply false
    id("org.jetbrains.kotlin.android") version "1.9.22" apply false
}`
  },
  {
    path: 'android/app/build.gradle.kts',
    filename: 'app/build.gradle.kts',
    language: 'kotlin',
    category: 'config',
    description: 'App module build script targeting Android 14 (API 34) with Jetpack Compose Material 3.',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.otgguardian.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.otgguardian.app"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")

    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")

    implementation("androidx.datastore:datastore-preferences:1.0.0")
    implementation("androidx.work:work-runtime-ktx:2.9.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")

    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}`
  },
  {
    path: 'android/app/src/main/AndroidManifest.xml',
    filename: 'AndroidManifest.xml',
    language: 'xml',
    category: 'manifest',
    description: 'Android 14 manifest with foregroundServiceType="connectedDevice", USB host filters, and services.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.otgguardian.app">

    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_CONNECTED_DEVICE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    
    <uses-permission
        android:name="android.permission.WRITE_SECURE_SETTINGS"
        tools:ignore="ProtectedPermissions" />

    <uses-feature
        android:name="android.hardware.usb.host"
        android:required="false" />

    <application
        android:name=".OtgGuardianApp"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.OTGGuardian">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/Theme.OTGGuardian">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <intent-filter>
                <action android:name="android.hardware.usb.action.USB_DEVICE_ATTACHED" />
            </intent-filter>
            <meta-data
                android:name="android.hardware.usb.action.USB_DEVICE_ATTACHED"
                android:resource="@xml/device_filter" />
        </activity>

        <service
            android:name=".service.OtgMonitoringService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="connectedDevice" />

        <service
            android:name=".service.OtgAccessibilityService"
            android:enabled="true"
            android:exported="true"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/accessibility_service_config" />
        </service>

        <service
            android:name=".service.OtgTileService"
            android:enabled="true"
            android:exported="true"
            android:icon="@drawable/ic_otg_tile"
            android:label="@string/tile_label"
            android:permission="android.permission.BIND_QUICK_SETTINGS_TILE">
            <intent-filter>
                <action android:name="android.service.quicksettings.action.QS_TILE" />
            </intent-filter>
        </service>

        <receiver
            android:name=".receiver.UsbEventReceiver"
            android:enabled="true"
            android:exported="false">
            <intent-filter>
                <action android:name="android.hardware.usb.action.USB_DEVICE_ATTACHED" />
                <action android:name="android.hardware.usb.action.USB_DEVICE_DETACHED" />
                <action android:name="com.otgguardian.app.ACTION_RECOVER_OTG" />
            </intent-filter>
        </receiver>

        <receiver
            android:name=".receiver.BootReceiver"
            android:enabled="true"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="android.intent.action.MY_PACKAGE_REPLACED" />
            </intent-filter>
        </receiver>

    </application>
</manifest>`
  },
  {
    path: 'android/app/src/main/java/com/otgguardian/app/MainActivity.kt',
    filename: 'MainActivity.kt',
    language: 'kotlin',
    category: 'kotlin',
    description: 'Jetpack Compose entry point, 5-screen navigation scaffold, service controller, and intent handler.',
    content: `package com.otgguardian.app

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
import com.otgguardian.app.ui.theme.*
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

        val isKeepEnabled by dataStore.keepEnabledFlow.collectAsState(initial = false)
        val isAutoRecover by dataStore.autoRecoverFlow.collectAsState(initial = true)
        val recoveryMode by dataStore.recoveryModeFlow.collectAsState(initial = RecoveryMode.ACCESSIBILITY_AUTO)
        val isNotificationActive by dataStore.notifyStatusFlow.collectAsState(initial = true)
        val lastActivationTime by dataStore.lastActivationTimeFlow.collectAsState(initial = 0L)
        val lastStatusChangeTime by dataStore.lastStatusChangeTimeFlow.collectAsState(initial = 0L)

        var otgState by remember { mutableStateOf(OtgStateDetector.detectOtgState(this@MainActivity)) }
        var connectedDevices by remember { mutableStateOf(OtgStateDetector.getConnectedUsbDevices(this@MainActivity)) }
        val eventLogs = remember { mutableStateListOf<OtgLogEvent>() }

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
                            icon = { Icon(screen.icon, screen.title) },
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
            Box(modifier = Modifier.fillMaxSize().padding(paddingValues)) {
                when (selectedScreen) {
                    Screen.DASHBOARD -> DashboardScreen(
                        otgState = otgState,
                        isKeepEnabledActive = isKeepEnabled,
                        onKeepEnabledToggle = { enabled ->
                            coroutineScope.launch {
                                dataStore.setKeepEnabled(enabled)
                                if (enabled) {
                                    OtgMonitoringService.startService(this@MainActivity)
                                } else {
                                    OtgMonitoringService.stopService(this@MainActivity)
                                }
                            }
                        },
                        connectedDevices = connectedDevices,
                        isMonitoringRunning = OtgMonitoringService.isRunning,
                        lastActivationTime = lastActivationTime,
                        lastStatusChangeTime = lastStatusChangeTime,
                        onEnableOtgAgainClick = {
                            RecoveryManager.performRecovery(this@MainActivity, "User 1-Tap Trigger")
                            coroutineScope.launch { dataStore.recordActivation() }
                        }
                    )
                    Screen.USB_ACTIVITY -> UsbActivityScreen(
                        connectedDevices = connectedDevices,
                        onRefreshUsbDevices = {
                            connectedDevices = OtgStateDetector.getConnectedUsbDevices(this@MainActivity)
                            otgState = OtgStateDetector.detectOtgState(this@MainActivity)
                        }
                    )
                    Screen.AUTOMATION -> AutomationScreen(
                        isKeepEnabledActive = isKeepEnabled,
                        onKeepEnabledChange = { coroutineScope.launch { dataStore.setKeepEnabled(it) } },
                        isAutoRecoverActive = isAutoRecover,
                        onAutoRecoverChange = { coroutineScope.launch { dataStore.setAutoRecover(it) } },
                        selectedRecoveryMode = recoveryMode,
                        onRecoveryModeChange = { coroutineScope.launch { dataStore.setRecoveryMode(it) } },
                        isNotificationActive = isNotificationActive,
                        onNotificationChange = { coroutineScope.launch { dataStore.setNotifyStatus(it) } },
                        isAccessibilityRunning = OtgAccessibilityService.isRunning,
                        hasWriteSecureSettings = hasWriteSecureSettings,
                        onOpenAccessibilitySettings = { startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)) },
                        onOpenBatterySettings = {
                            try {
                                startActivity(Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                                    data = Uri.parse("package:$packageName")
                                })
                            } catch (_: Exception) {
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
                        onOpenAccessibilitySettings = { startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)) },
                        isBatteryOptimizedExempt = isBatteryExempt,
                        onRequestBatteryExemption = {
                            try {
                                startActivity(Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                                    data = Uri.parse("package:$packageName")
                                })
                            } catch (_: Exception) {
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
                        onClearHistory = { eventLogs.clear() }
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
}`
  },
  {
    path: 'android/app/src/main/java/com/otgguardian/app/service/OtgMonitoringService.kt',
    filename: 'OtgMonitoringService.kt',
    language: 'kotlin',
    category: 'kotlin',
    description: 'Android 14 Foreground Service with watchdog timer tracking the 10-minute OxygenOS timeout.',
    content: `package com.otgguardian.app.service

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

    override fun onCreate() {
        super.onCreate()
        dataStore = DataStoreManager(applicationContext)
        isRunning = true
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
            "OTG Guardian Active",
            "Monitoring OxygenOS 10-minute inactivity timeout"
        )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_CONNECTED_DEVICE)
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
    }

    private fun inspectCurrentHardwareState() {
        val connected = OtgStateDetector.getConnectedUsbDevices(this)
        if (connected.isNotEmpty()) {
            isDeviceConnected = true
            updateNotification("OTG Active: Peripheral Connected", "\${connected.size} USB device(s) active")
        } else {
            isDeviceConnected = false
            startInactivityWatchdog()
        }
    }

    private fun startInactivityWatchdog() {
        countdownJob?.cancel()
        countdownJob = serviceScope.launch {
            updateNotification("OTG Standby", "No USB peripheral. Watchdog monitoring 10-minute limit.")
            delay(10 * 60 * 1000L) // 10 minutes exact OxygenOS kernel timeout

            if (!isDeviceConnected) {
                val autoRecover = dataStore.autoRecoverFlow.first()
                withContext(Dispatchers.Main) {
                    if (autoRecover) {
                        RecoveryManager.performRecovery(applicationContext, "10-minute inactivity timeout reached")
                    } else {
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
        val appIntent = Intent(this, MainActivity::class.java).apply { flags = Intent.FLAG_ACTIVITY_SINGLE_TOP }
        val pFlags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE else PendingIntent.FLAG_UPDATE_CURRENT
        val appPendingIntent = PendingIntent.getActivity(this, 0, appIntent, pFlags)

        val recoverIntent = Intent(this, UsbEventReceiver::class.java).apply { action = UsbEventReceiver.ACTION_RECOVER_OTG }
        val recoverPendingIntent = PendingIntent.getBroadcast(this, 1, recoverIntent, pFlags)

        return NotificationCompat.Builder(this, OtgGuardianApp.CHANNEL_MONITORING)
            .setSmallIcon(R.drawable.ic_otg_tile)
            .setContentTitle(title)
            .setContentText(content)
            .setOngoing(true)
            .setContentIntent(appPendingIntent)
            .addAction(R.drawable.ic_otg_tile, "Restore OTG", recoverPendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun updateNotification(title: String, content: String) {
        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as? android.app.NotificationManager
        nm?.notify(NOTIFICATION_ID, buildNotification(title, content))
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        countdownJob?.cancel()
        serviceJob.cancel()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        const val NOTIFICATION_ID = 1001
        const val ACTION_START_MONITORING = "com.otgguardian.app.START_MONITORING"
        const val ACTION_STOP_MONITORING = "com.otgguardian.app.STOP_MONITORING"
        const val ACTION_DEVICE_ATTACHED = "com.otgguardian.app.DEVICE_ATTACHED"
        const val ACTION_DEVICE_DETACHED = "com.otgguardian.app.DEVICE_DETACHED"

        var isRunning: Boolean = false
            private set

        fun startService(context: Context) {
            val intent = Intent(context, OtgMonitoringService::class.java).apply { action = ACTION_START_MONITORING }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) context.startForegroundService(intent) else context.startService(intent)
        }

        fun stopService(context: Context) {
            val intent = Intent(context, OtgMonitoringService::class.java).apply { action = ACTION_STOP_MONITORING }
            context.startService(intent)
        }

        fun onDeviceAttached(context: Context, device: UsbDevice?) {
            val intent = Intent(context, OtgMonitoringService::class.java).apply { action = ACTION_DEVICE_ATTACHED }
            context.startService(intent)
        }

        fun onDeviceDetached(context: Context) {
            val intent = Intent(context, OtgMonitoringService::class.java).apply { action = ACTION_DEVICE_DETACHED }
            context.startService(intent)
        }
    }
}`
  },
  {
    path: 'android/app/src/main/java/com/otgguardian/app/service/OtgAccessibilityService.kt',
    filename: 'OtgAccessibilityService.kt',
    language: 'kotlin',
    category: 'kotlin',
    description: 'Accessibility Service that detects OxygenOS 14 Settings window, safely toggles "OTG connection", and navigates back.',
    content: `package com.otgguardian.app.service

import android.accessibilityservice.AccessibilityService
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import com.otgguardian.app.data.DataStoreManager
import com.otgguardian.app.data.OxygenOsHelper
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class OtgAccessibilityService : AccessibilityService() {

    private val serviceScope = CoroutineScope(Dispatchers.IO)
    private val mainHandler = Handler(Looper.getMainLooper())

    override fun onServiceConnected() {
        super.onServiceConnected()
        isRunning = true
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (!armedForToggle || event == null) return
        val rootNode = rootInActiveWindow ?: return

        try {
            for (keyword in OxygenOsHelper.ACCESSIBILITY_KEYWORDS) {
                val nodes = rootNode.findAccessibilityNodeInfosByText(keyword)
                if (nodes.isNotEmpty()) {
                    for (node in nodes) {
                        if (tryToggleOtgSwitch(node)) {
                            armedForToggle = false
                            serviceScope.launch {
                                val dataStore = DataStoreManager(applicationContext)
                                dataStore.incrementRecoveryCount()
                                dataStore.recordActivation()
                            }
                            mainHandler.postDelayed({
                                try {
                                    performGlobalAction(GLOBAL_ACTION_BACK)
                                } catch (_: Exception) {}
                            }, 500)
                            return
                        }
                    }
                }
            }
        } catch (e: Exception) {
            Log.e("OtgAccessibilityService", "Error toggling node", e)
        }
    }

    private fun tryToggleOtgSwitch(labelNode: AccessibilityNodeInfo): Boolean {
        val parent = labelNode.parent ?: return false
        for (i in 0 until parent.childCount) {
            val child = parent.getChild(i) ?: continue
            if (child.isCheckable) {
                if (!child.isChecked) {
                    return child.performAction(AccessibilityNodeInfo.ACTION_CLICK)
                }
                return true
            }
        }
        if (labelNode.isClickable) return labelNode.performAction(AccessibilityNodeInfo.ACTION_CLICK)
        if (parent.isClickable) return parent.performAction(AccessibilityNodeInfo.ACTION_CLICK)
        return false
    }

    override fun onInterrupt() {
        armedForToggle = false
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        armedForToggle = false
    }

    companion object {
        var isRunning: Boolean = false
            private set

        @Volatile
        var armedForToggle: Boolean = false
            private set

        fun armAutoToggle() {
            armedForToggle = true
            Handler(Looper.getMainLooper()).postDelayed({
                armedForToggle = false
            }, 10000)
        }
    }
}`
  },
  {
    path: 'android/app/src/main/java/com/otgguardian/app/service/OtgTileService.kt',
    filename: 'OtgTileService.kt',
    language: 'kotlin',
    category: 'kotlin',
    description: 'Quick Settings Tile for 1-tap recovery from notification shade.',
    content: `package com.otgguardian.app.service

import android.os.Build
import android.service.quicksettings.Tile
import android.service.quicksettings.TileService
import androidx.annotation.RequiresApi
import com.otgguardian.app.data.OtgState
import com.otgguardian.app.data.OtgStateDetector
import com.otgguardian.app.data.RecoveryManager

@RequiresApi(Build.VERSION_CODES.N)
class OtgTileService : TileService() {

    override fun onStartListening() {
        super.onStartListening()
        updateTileState()
    }

    override fun onClick() {
        super.onClick()
        RecoveryManager.performRecovery(this, "Quick Settings Tile Triggered")
        updateTileState()
    }

    private fun updateTileState() {
        val tile = qsTile ?: return
        val currentState = OtgStateDetector.detectOtgState(this)

        when (currentState) {
            OtgState.ON -> {
                tile.state = Tile.STATE_ACTIVE
                tile.label = "OTG Active"
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) tile.subtitle = "Connected / Ready"
            }
            OtgState.OFF -> {
                tile.state = Tile.STATE_INACTIVE
                tile.label = "OTG Disabled"
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) tile.subtitle = "Tap to Enable"
            }
            OtgState.UNKNOWN -> {
                tile.state = Tile.STATE_INACTIVE
                tile.label = "OTG Guardian"
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) tile.subtitle = "Tap to Restore"
            }
        }
        tile.updateTile()
    }
}`
  },
  {
    path: 'android/app/src/main/java/com/otgguardian/app/data/OxygenOsHelper.kt',
    filename: 'OxygenOsHelper.kt',
    language: 'kotlin',
    category: 'kotlin',
    description: 'OnePlus Nord CE 2 Lite 5G & OxygenOS 14 system settings keys, intent targets, and ADB commands.',
    content: `package com.otgguardian.app.data

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.provider.Settings
import android.util.Log

object OxygenOsHelper {
    const val TARGET_MANUFACTURER = "OnePlus"
    const val TARGET_MODEL = "CPH2381"
    const val TARGET_FIRMWARE = "CPH2381_14.0.0.0.3000(EX01C10P02)"
    const val TIMEOUT_MILLIS = 10 * 60 * 1000L

    const val SETTING_OTG_ENABLED = "otg_enabled"
    const val SETTING_OPLUS_OTG_STATE = "oplus_otg_state"
    const val SETTING_PERSIST_OTG = "persist.sys.oplus.otg_support"

    private val SETTINGS_TARGETS = listOf(
        Intent("oplus.intent.action.OTG_SETTINGS"),
        Intent().setComponent(ComponentName("com.android.settings", "com.android.settings.Settings\\$OtgSettingsActivity")),
        Intent().setComponent(ComponentName("com.oplus.wirelesssettings", "com.oplus.wirelesssettings.WirelessSettings")),
        Intent(Settings.ACTION_SETTINGS)
    )

    fun openOtgSettings(context: Context): Boolean {
        for (intent in SETTINGS_TARGETS) {
            try {
                val candidate = Intent(intent).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NO_ANIMATION)
                }
                if (candidate.resolveActivity(context.packageManager) != null) {
                    context.startActivity(candidate)
                    return true
                }
            } catch (_: Exception) {}
        }
        return try {
            context.startActivity(Intent(Settings.ACTION_SETTINGS).apply { addFlags(Intent.FLAG_ACTIVITY_NEW_TASK) })
            true
        } catch (_: Exception) { false }
    }

    fun hasWriteSecureSettings(context: Context): Boolean {
        return try {
            context.checkCallingOrSelfPermission(android.Manifest.permission.WRITE_SECURE_SETTINGS) ==
                    android.content.pm.PackageManager.PERMISSION_GRANTED
        } catch (_: Exception) { false }
    }

    fun tryDirectToggle(context: Context, enable: Boolean): Boolean {
        if (!hasWriteSecureSettings(context)) return false
        val v = if (enable) 1 else 0
        return try {
            Settings.Global.putInt(context.contentResolver, SETTING_OTG_ENABLED, v)
            try { Settings.Global.putInt(context.contentResolver, SETTING_OPLUS_OTG_STATE, v) } catch (_: Exception) {}
            true
        } catch (_: Exception) { false }
    }

    fun getAdbGrantCommand(packageName: String): String =
        "adb shell pm grant $packageName android.permission.WRITE_SECURE_SETTINGS"

    fun getAdbDirectOtgCommand(): String =
        "adb shell settings put global otg_enabled 1"

    fun getAdbWhitelistCommand(packageName: String): String =
        "adb shell dumpsys deviceidle whitelist +$packageName"

    val ACCESSIBILITY_KEYWORDS = listOf(
        "OTG", "OTG connection", "OTG Connection", "OTG-Verbindung", "Connexion OTG", "Conexión OTG"
    )
}`
  },
  {
    path: 'android/app/src/main/java/com/otgguardian/app/data/OtgStateDetector.kt',
    filename: 'OtgStateDetector.kt',
    language: 'kotlin',
    category: 'kotlin',
    description: 'Hardware state detector that strictly distinguishes ON, OFF, and UNKNOWN without spoofing.',
    content: `package com.otgguardian.app.data

import android.content.Context
import android.hardware.usb.UsbManager
import android.provider.Settings
import java.io.File

object OtgStateDetector {
    private val KNOWN_SYSFS_PATHS = listOf(
        "/sys/class/power_supply/usb/otg_switch",
        "/sys/class/power_supply/usb/otg_online",
        "/sys/class/typec/port0/power_role"
    )

    fun detectOtgState(context: Context): OtgState {
        try {
            val globalOtg = Settings.Global.getInt(context.contentResolver, OxygenOsHelper.SETTING_OTG_ENABLED, -1)
            if (globalOtg == 1) return OtgState.ON
            if (globalOtg == 0) return OtgState.OFF
        } catch (_: Exception) {}

        try {
            val oplusOtg = Settings.Global.getInt(context.contentResolver, OxygenOsHelper.SETTING_OPLUS_OTG_STATE, -1)
            if (oplusOtg == 1) return OtgState.ON
            if (oplusOtg == 0) return OtgState.OFF
        } catch (_: Exception) {}

        for (path in KNOWN_SYSFS_PATHS) {
            val file = File(path)
            if (file.exists() && file.canRead()) {
                try {
                    val content = file.readText().trim()
                    if (content == "1" || content.equals("source", true) || content.equals("host", true)) return OtgState.ON
                    if (content == "0" || content.equals("sink", true) || content.equals("device", true)) return OtgState.OFF
                } catch (_: Exception) {}
            }
        }

        val usbManager = context.getSystemService(Context.USB_SERVICE) as? UsbManager
        val connected = usbManager?.deviceList
        if (connected != null && connected.isNotEmpty()) return OtgState.ON

        // Return UNKNOWN when OS hides switch state while no device is connected
        return OtgState.UNKNOWN
    }

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
}`
  },
  {
    path: 'android/app/src/main/res/xml/accessibility_service_config.xml',
    filename: 'accessibility_service_config.xml',
    language: 'xml',
    category: 'res',
    description: 'Accessibility configuration filtering OxygenOS Settings windows.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:accessibilityEventTypes="typeWindowStateChanged|typeWindowContentChanged"
    android:accessibilityFeedbackType="feedbackGeneric"
    android:accessibilityFlags="flagDefault|flagRetrieveInteractiveWindows"
    android:canRetrieveWindowContent="true"
    android:description="@string/accessibility_service_description"
    android:notificationTimeout="100"
    android:packageNames="com.android.settings,com.oplus.wirelesssettings,com.oplus.subsettings" />`
  }
];
