package com.otgguardian.app;

import android.os.Build;
import android.service.quicksettings.Tile;
import android.service.quicksettings.TileService;

public class OtgTileService extends TileService {
    @Override
    public void onStartListening() {
        super.onStartListening();
        updateTile();
    }

    @Override
    public void onClick() {
        super.onClick();
        RecoveryManager.performRecovery(this, "Quick Settings Tile");
        updateTile();
    }

    private void updateTile() {
        Tile tile = getQsTile();
        if (tile == null) return;
        OtgStateDetector.State state = OtgStateDetector.detectState(this);
        if (state == OtgStateDetector.State.ON) {
            tile.setState(Tile.STATE_ACTIVE);
            tile.setLabel("OTG Active");
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) tile.setSubtitle("Ready / Powered");
        } else {
            tile.setState(Tile.STATE_INACTIVE);
            tile.setLabel("OTG Disabled");
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) tile.setSubtitle("Tap to Restore");
        }
        tile.updateTile();
    }
}
