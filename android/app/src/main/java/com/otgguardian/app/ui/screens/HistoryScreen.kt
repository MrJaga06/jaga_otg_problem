package com.otgguardian.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.otgguardian.app.data.OtgLogEvent
import com.otgguardian.app.ui.theme.*
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun HistoryScreen(
    events: List<OtgLogEvent>,
    onClearHistory: () -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedFilter by remember { mutableStateOf("ALL") }
    val timeFormatter = remember { SimpleDateFormat("MMM dd, HH:mm:ss", Locale.getDefault()) }

    val filteredEvents = remember(events, selectedFilter) {
        when (selectedFilter) {
            "USB" -> events.filter {
                it.eventType == OtgLogEvent.EventType.USB_CONNECTED || it.eventType == OtgLogEvent.EventType.USB_DISCONNECTED
            }
            "RECOVERY" -> events.filter {
                it.eventType == OtgLogEvent.EventType.RECOVERY_TRIGGERED ||
                it.eventType == OtgLogEvent.EventType.RECOVERY_SUCCESS ||
                it.eventType == OtgLogEvent.EventType.RECOVERY_FAILED
            }
            "STATE" -> events.filter {
                it.eventType == OtgLogEvent.EventType.OTG_STATE_CHANGE || it.eventType == OtgLogEvent.EventType.TIMEOUT_WATCHDOG
            }
            else -> events
        }
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Header
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = "Activity History",
                        style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
                        color = TextPrimary
                    )
                    Text(
                        text = "${events.size} Logged Events",
                        style = MaterialTheme.typography.bodyMedium,
                        color = CyanAccent
                    )
                }

                if (events.isNotEmpty()) {
                    IconButton(
                        onClick = onClearHistory,
                        colors = IconButtonDefaults.iconButtonColors(containerColor = DarkSurface)
                    ) {
                        Icon(
                            imageVector = Icons.Default.DeleteSweep,
                            contentDescription = "Clear History",
                            tint = AlertRose
                        )
                    }
                }
            }
        }

        // Filter chips
        item {
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(vertical = 4.dp)
            ) {
                val filters = listOf("ALL", "USB", "RECOVERY", "STATE")
                items(filters) { filter ->
                    FilterChip(
                        selected = selectedFilter == filter,
                        onClick = { selectedFilter = filter },
                        label = { Text(filter) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = CyanAccent,
                            selectedLabelColor = AmoledBlack,
                            containerColor = DarkSurface,
                            labelColor = TextSecondary
                        )
                    )
                }
            }
        }

        if (filteredEvents.isEmpty()) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = DarkSurface),
                    shape = RoundedCornerShape(14.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.HistoryToggleOff,
                            contentDescription = null,
                            tint = TextMuted,
                            modifier = Modifier.size(44.dp)
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = "No Activity Logged Yet",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = TextPrimary
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "OTG status shifts, USB attachments, and automated recovery actions will be logged here.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = TextSecondary,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )
                    }
                }
            }
        } else {
            items(filteredEvents, key = { it.id }) { event ->
                val (tintColor, icon) = when (event.eventType) {
                    OtgLogEvent.EventType.USB_CONNECTED -> Pair(ActiveEmerald, Icons.Default.Usb)
                    OtgLogEvent.EventType.USB_DISCONNECTED -> Pair(WarningAmber, Icons.Default.UsbOff)
                    OtgLogEvent.EventType.RECOVERY_SUCCESS -> Pair(ActiveEmerald, Icons.Default.CheckCircle)
                    OtgLogEvent.EventType.RECOVERY_TRIGGERED -> Pair(ElectricBlue, Icons.Default.Bolt)
                    OtgLogEvent.EventType.RECOVERY_FAILED -> Pair(AlertRose, Icons.Default.ErrorOutline)
                    OtgLogEvent.EventType.TIMEOUT_WATCHDOG -> Pair(AlertRose, Icons.Default.TimerOff)
                    OtgLogEvent.EventType.OTG_STATE_CHANGE -> Pair(CyanAccent, Icons.Default.ChangeCircle)
                    else -> Pair(TextMuted, Icons.Default.Info)
                }

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = DarkSurface),
                    shape = RoundedCornerShape(12.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, DarkBorder)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        Box(
                            modifier = Modifier
                                .size(34.dp)
                                .clip(CircleShape)
                                .background(tintColor.copy(alpha = 0.15f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = icon,
                                contentDescription = null,
                                tint = tintColor,
                                modifier = Modifier.size(18.dp)
                            )
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = event.title,
                                    style = MaterialTheme.typography.titleMedium.copy(
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp
                                    ),
                                    color = TextPrimary
                                )

                                Text(
                                    text = timeFormatter.format(Date(event.timestamp)),
                                    style = MaterialTheme.typography.labelSmall,
                                    color = TextMuted
                                )
                            }

                            Spacer(modifier = Modifier.height(4.dp))

                            Text(
                                text = event.description,
                                style = MaterialTheme.typography.bodyMedium.copy(fontSize = 12.sp),
                                color = TextSecondary
                            )
                        }
                    }
                }
            }
        }
    }
}
