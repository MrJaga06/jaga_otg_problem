package com.otgguardian.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.otgguardian.app.data.RecoveryMode
import com.otgguardian.app.ui.theme.*

@Composable
fun AutomationScreen(
    isKeepEnabledActive: Boolean,
    onKeepEnabledChange: (Boolean) -> Unit,
    isAutoRecoverActive: Boolean,
    onAutoRecoverChange: (Boolean) -> Unit,
    selectedRecoveryMode: RecoveryMode,
    onRecoveryModeChange: (RecoveryMode) -> Unit,
    isNotificationActive: Boolean,
    onNotificationChange: (Boolean) -> Unit,
    isAccessibilityRunning: Boolean,
    hasWriteSecureSettings: Boolean,
    onOpenAccessibilitySettings: () -> Unit,
    onOpenBatterySettings: () -> Unit,
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .verticalScroll(scrollState)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Screen Header
        Text(
            text = "OTG Automation & Recovery",
            style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
            color = TextPrimary
        )
        Text(
            text = "Configure how OTG Guardian detects and recovers from the OxygenOS 10-minute timeout.",
            style = MaterialTheme.typography.bodyMedium,
            color = TextSecondary
        )

        // Master Automation Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = DarkSurface),
            shape = RoundedCornerShape(14.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, if (isKeepEnabledActive) CyanAccent else DarkBorder)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Automatic Watchdog Monitoring",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = TextPrimary
                        )
                        Text(
                            text = "Arms low-power foreground timer to monitor the 10-minute timeout window.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = TextSecondary
                        )
                    }
                    Switch(
                        checked = isKeepEnabledActive,
                        onCheckedChange = onKeepEnabledChange,
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = AmoledBlack,
                            checkedTrackColor = CyanAccent
                        )
                    )
                }

                Divider(modifier = Modifier.padding(vertical = 12.dp), color = DarkBorder)

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Auto-Restore on Timeout",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = TextPrimary
                        )
                        Text(
                            text = "Immediately launch restoration when timeout or disconnect is detected.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = TextSecondary
                        )
                    }
                    Switch(
                        checked = isAutoRecoverActive,
                        onCheckedChange = onAutoRecoverChange,
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = AmoledBlack,
                            checkedTrackColor = ElectricBlue
                        )
                    )
                }
            }
        }

        // Recovery Strategy Selection
        Text(
            text = "RECOVERY MECHANISM STRATEGY",
            style = MaterialTheme.typography.labelSmall,
            color = TextMuted
        )

        // Mode 1: Accessibility Service Auto-Assist
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = if (selectedRecoveryMode == RecoveryMode.ACCESSIBILITY_AUTO) DarkCard else DarkSurface
            ),
            shape = RoundedCornerShape(14.dp),
            border = androidx.compose.foundation.BorderStroke(
                1.dp,
                if (selectedRecoveryMode == RecoveryMode.ACCESSIBILITY_AUTO) CyanAccent else DarkBorder
            )
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        RadioButton(
                            selected = selectedRecoveryMode == RecoveryMode.ACCESSIBILITY_AUTO,
                            onClick = { onRecoveryModeChange(RecoveryMode.ACCESSIBILITY_AUTO) },
                            colors = RadioButtonDefaults.colors(selectedColor = CyanAccent)
                        )
                        Column {
                            Text(
                                text = "Accessibility Auto-Assist",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                color = TextPrimary
                            )
                            Text(
                                text = "Best balance: No root required, automatic toggle",
                                style = MaterialTheme.typography.labelSmall,
                                color = if (isAccessibilityRunning) ActiveEmerald else WarningAmber
                            )
                        }
                    }
                }

                Text(
                    text = "When OTG times out, opens OxygenOS OTG Settings and safely toggles the switch back on without manual touches.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondary,
                    modifier = Modifier.padding(start = 48.dp, top = 4.dp, bottom = 8.dp)
                )

                if (!isAccessibilityRunning) {
                    OutlinedButton(
                        onClick = onOpenAccessibilitySettings,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(start = 48.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = CyanAccent)
                    ) {
                        Icon(Icons.Default.AccessibilityNew, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Enable in Android Accessibility Settings")
                    }
                }
            }
        }

        // Mode 2: Direct Settings.Global via ADB
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = if (selectedRecoveryMode == RecoveryMode.DIRECT_SECURE_SETTINGS) DarkCard else DarkSurface
            ),
            shape = RoundedCornerShape(14.dp),
            border = androidx.compose.foundation.BorderStroke(
                1.dp,
                if (selectedRecoveryMode == RecoveryMode.DIRECT_SECURE_SETTINGS) ElectricBlue else DarkBorder
            )
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    RadioButton(
                        selected = selectedRecoveryMode == RecoveryMode.DIRECT_SECURE_SETTINGS,
                        onClick = { onRecoveryModeChange(RecoveryMode.DIRECT_SECURE_SETTINGS) },
                        colors = RadioButtonDefaults.colors(selectedColor = ElectricBlue)
                    )
                    Column {
                        Text(
                            text = "Direct System Setting (ADB Granted)",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = TextPrimary
                        )
                        Text(
                            text = if (hasWriteSecureSettings) "WRITE_SECURE_SETTINGS Granted" else "Requires One-time ADB Command",
                            style = MaterialTheme.typography.labelSmall,
                            color = if (hasWriteSecureSettings) ActiveEmerald else TextMuted
                        )
                    }
                }

                Text(
                    text = "Directly writes 'otg_enabled = 1' into Settings.Global in the background without opening the Settings UI. Zero screen flashes.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondary,
                    modifier = Modifier.padding(start = 48.dp, top = 4.dp)
                )
            }
        }

        // Mode 3: Interactive Notification
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = if (selectedRecoveryMode == RecoveryMode.INTERACTIVE_NOTIFICATION) DarkCard else DarkSurface
            ),
            shape = RoundedCornerShape(14.dp),
            border = androidx.compose.foundation.BorderStroke(
                1.dp,
                if (selectedRecoveryMode == RecoveryMode.INTERACTIVE_NOTIFICATION) ActiveEmerald else DarkBorder
            )
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    RadioButton(
                        selected = selectedRecoveryMode == RecoveryMode.INTERACTIVE_NOTIFICATION,
                        onClick = { onRecoveryModeChange(RecoveryMode.INTERACTIVE_NOTIFICATION) },
                        colors = RadioButtonDefaults.colors(selectedColor = ActiveEmerald)
                    )
                    Column {
                        Text(
                            text = "1-Tap Interactive Heads-Up Notification",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = TextPrimary
                        )
                        Text(
                            text = "Manual Confirmation",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextMuted
                        )
                    }
                }

                Text(
                    text = "Sends a persistent heads-up notification with a 1-tap 'RESTORE OTG' action whenever the 10-minute timer disables OTG.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondary,
                    modifier = Modifier.padding(start = 48.dp, top = 4.dp)
                )
            }
        }

        // OxygenOS Battery Optimization Safeguard
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = DarkSurface),
            shape = RoundedCornerShape(14.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "OxygenOS Battery Optimization",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = TextPrimary
                    )
                    Text(
                        text = "Prevent OxygenOS 14 from killing the watchdog foreground service.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextSecondary
                    )
                }

                OutlinedButton(
                    onClick = onOpenBatterySettings,
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = CyanAccent)
                ) {
                    Text("Exempt")
                }
            }
        }
    }
}
