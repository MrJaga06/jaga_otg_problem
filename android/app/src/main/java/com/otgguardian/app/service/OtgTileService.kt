package com.otgguardian.app.service

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
        // Trigger immediate recovery / toggle when tapped from quick settings
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
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    tile.subtitle = "Connected / Ready"
                }
            }
            OtgState.OFF -> {
                tile.state = Tile.STATE_INACTIVE
                tile.label = "OTG Disabled"
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    tile.subtitle = "Tap to Enable"
                }
            }
            OtgState.UNKNOWN -> {
                tile.state = Tile.STATE_INACTIVE
                tile.label = "OTG Guardian"
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    tile.subtitle = "Tap to Check/Restore"
                }
            }
        }
        tile.updateTile()
    }
}
