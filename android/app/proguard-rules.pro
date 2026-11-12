# OTG Guardian Proguard Configuration

# Keep Compose rules
-keep class androidx.compose.** { *; }

# Keep DataStore Preferences
-keep class androidx.datastore.** { *; }

# Keep Accessibility Service & Tile Service
-keep class com.otgguardian.app.service.OtgAccessibilityService { *; }
-keep class com.otgguardian.app.service.OtgTileService { *; }
-keep class com.otgguardian.app.service.OtgMonitoringService { *; }
-keep class com.otgguardian.app.receiver.** { *; }

# Keep models for reflection/serialization
-keepclassmembers class com.otgguardian.app.data.** { *; }
