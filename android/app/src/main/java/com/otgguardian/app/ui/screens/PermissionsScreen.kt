package com.otgguardian.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.otgguardian.app.data.OxygenOsHelper
import com.otgguardian.app.ui.theme.*

@Composable
fun PermissionsScreen(
    hasNotificationPermission: Boolean,
    onRequestNotificationPermission: () -> Unit,
    isAccessibilityEnabled: Boolean,
    onOpenAccessibilitySettings: () -> Unit,
    isBatteryOptimizedExempt: Boolean,
    onRequestBatteryExemption: () -> Unit,
    hasWriteSecureSettings: Boolean,
    onCopyAdbCommand: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()
    val packageName = "com.otgguardian.app"
    var copyConfirmation by remember { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .verticalScroll(scrollState)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        Text(
            text = "Permissions & Device Setup",
            style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
            color = TextPrimary
        )
        Text(
            text = "Configure the necessary Android 14 and OxygenOS permissions. No root access is required.",
            style = MaterialTheme.typography.bodyMedium,
            color = TextSecondary
        )

        // Permission 1: Notifications
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = DarkSurface),
            shape = RoundedCornerShape(14.dp),
            border = androidx.compose.foundation.BorderStroke(
                1.dp,
                if (hasNotificationPermission) ActiveEmerald.copy(alpha = 0.5f) else AlertRose.copy(alpha = 0.5f)
            )
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .background(
                                if (hasNotificationPermission) ActiveEmerald.copy(alpha = 0.15f) else AlertRose.copy(alpha = 0.15f),
                                RoundedCornerShape(10.dp)
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Notifications,
                            contentDescription = null,
                            tint = if (hasNotificationPermission) ActiveEmerald else AlertRose,
                            modifier = Modifier.size(22.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = "Post Notifications",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = TextPrimary
                        )
                        Text(
                            text = if (hasNotificationPermission) "Granted • Alerts enabled" else "Required for foreground watchdog",
                            style = MaterialTheme.typography.bodyMedium,
                            color = if (hasNotificationPermission) ActiveEmerald else AlertRose
                        )
                    }
                }

                if (!hasNotificationPermission) {
                    Button(
                        onClick = onRequestNotificationPermission,
                        colors = ButtonDefaults.buttonColors(containerColor = CyanAccent, contentColor = AmoledBlack),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("Grant")
                    }
                }
            }
        }

        // Permission 2: Accessibility Auto-Assist Service
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = DarkSurface),
            shape = RoundedCornerShape(14.dp),
            border = androidx.compose.foundation.BorderStroke(
                1.dp,
                if (isAccessibilityEnabled) ActiveEmerald.copy(alpha = 0.5f) else WarningAmber.copy(alpha = 0.5f)
            )
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .background(
                                    if (isAccessibilityEnabled) ActiveEmerald.copy(alpha = 0.15f) else WarningAmber.copy(alpha = 0.15f),
                                    RoundedCornerShape(10.dp)
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.AccessibilityNew,
                                contentDescription = null,
                                tint = if (isAccessibilityEnabled) ActiveEmerald else WarningAmber,
                                modifier = Modifier.size(22.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "Accessibility Auto-Assist",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                color = TextPrimary
                            )
                            Text(
                                text = if (isAccessibilityEnabled) "Active • Auto-toggle ready" else "Disabled • Optional helper",
                                style = MaterialTheme.typography.bodyMedium,
                                color = if (isAccessibilityEnabled) ActiveEmerald else WarningAmber
                            )
                        }
                    }

                    Button(
                        onClick = onOpenAccessibilitySettings,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isAccessibilityEnabled) DarkCard else CyanAccent,
                            contentColor = if (isAccessibilityEnabled) TextPrimary else AmoledBlack
                        ),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text(if (isAccessibilityEnabled) "Configure" else "Enable")
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Enables OTG Guardian to detect the OxygenOS Settings screen and automatically tap 'OTG connection' ON when the 10-minute timer expires.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondary
                )
            }
        }

        // Permission 3: Battery Optimization Exemption
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = DarkSurface),
            shape = RoundedCornerShape(14.dp),
            border = androidx.compose.foundation.BorderStroke(
                1.dp,
                if (isBatteryOptimizedExempt) ActiveEmerald.copy(alpha = 0.5f) else DarkBorder
            )
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .background(ActiveEmerald.copy(alpha = 0.15f), RoundedCornerShape(10.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.BatteryChargingFull,
                            contentDescription = null,
                            tint = ActiveEmerald,
                            modifier = Modifier.size(22.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = "Battery Optimization Exemption",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = TextPrimary
                        )
                        Text(
                            text = if (isBatteryOptimizedExempt) "Unrestricted • Will not be killed" else "Recommended for OnePlus",
                            style = MaterialTheme.typography.bodyMedium,
                            color = if (isBatteryOptimizedExempt) ActiveEmerald else TextSecondary
                        )
                    }
                }

                if (!isBatteryOptimizedExempt) {
                    Button(
                        onClick = onRequestBatteryExemption,
                        colors = ButtonDefaults.buttonColors(containerColor = ElectricBlue, contentColor = Color.White),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("Exempt")
                    }
                }
            }
        }

        // Optional Privileged Setup: ADB WRITE_SECURE_SETTINGS
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = DarkCard),
            shape = RoundedCornerShape(14.dp),
            border = androidx.compose.foundation.BorderStroke(
                1.dp,
                if (hasWriteSecureSettings) ActiveEmerald.copy(alpha = 0.5f) else DarkBorder
            )
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Terminal,
                            contentDescription = null,
                            tint = ElectricBlue,
                            modifier = Modifier.size(22.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "Optional: One-Time ADB Command",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = TextPrimary
                        )
                    }

                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = if (hasWriteSecureSettings) ActiveEmerald.copy(alpha = 0.2f) else DarkSurface
                    ) {
                        Text(
                            text = if (hasWriteSecureSettings) "GRANTED" else "OPTIONAL",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = FontWeight.Bold,
                                color = if (hasWriteSecureSettings) ActiveEmerald else TextMuted
                            ),
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "If you have a computer with USB debugging, granting WRITE_SECURE_SETTINGS allows the app to toggle OTG silently in the background without opening the Settings UI:",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSecondary
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Terminal command box
                val adbCmd = OxygenOsHelper.getAdbGrantCommand(packageName)
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(AmoledBlack, RoundedCornerShape(8.dp))
                        .border(1.dp, DarkBorder, RoundedCornerShape(8.dp))
                        .padding(12.dp)
                ) {
                    Text(
                        text = adbCmd,
                        style = MaterialTheme.typography.bodyMedium.copy(
                            fontFamily = FontFamily.Monospace,
                            fontSize = 12.sp,
                            color = CyanAccent
                        )
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedButton(
                    onClick = {
                        onCopyAdbCommand(adbCmd)
                        copyConfirmation = true
                    },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = ElectricBlue)
                ) {
                    Icon(
                        imageVector = if (copyConfirmation) Icons.Default.Check else Icons.Default.ContentCopy,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(if (copyConfirmation) "Command Copied to Clipboard!" else "Copy ADB Command")
                }
            }
        }
    }
}
