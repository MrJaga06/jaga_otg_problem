package com.otgguardian.app;

import android.content.Context;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbManager;
import android.provider.Settings;
import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class OtgStateDetector {
    public enum State {
        ON, OFF, UNKNOWN
    }

    public static State detectState(Context context) {
        try {
            int globalOtg = Settings.Global.getInt(context.getContentResolver(), OxygenOsHelper.SETTING_OTG_ENABLED, -1);
            if (globalOtg == 1) return State.ON;
            if (globalOtg == 0) return State.OFF;
        } catch (Exception ignored) {}

        try {
            int oplusOtg = Settings.Global.getInt(context.getContentResolver(), OxygenOsHelper.SETTING_OPLUS_OTG_STATE, -1);
            if (oplusOtg == 1) return State.ON;
            if (oplusOtg == 0) return State.OFF;
        } catch (Exception ignored) {}

        String[] sysfsPaths = new String[] {
            "/sys/class/power_supply/usb/otg_switch",
            "/sys/class/power_supply/usb/otg_online",
            "/sys/class/typec/port0/power_role"
        };
        for (String path : sysfsPaths) {
            File f = new File(path);
            if (f.exists() && f.canRead()) {
                try {
                    byte[] bytes = java.nio.file.Files.readAllBytes(f.toPath());
                    String s = new String(bytes).trim();
                    if ("1".equals(s) || "source".equalsIgnoreCase(s) || "host".equalsIgnoreCase(s)) return State.ON;
                    if ("0".equals(s) || "sink".equalsIgnoreCase(s) || "device".equalsIgnoreCase(s)) return State.OFF;
                } catch (Exception ignored) {}
            }
        }

        UsbManager usbManager = (UsbManager) context.getSystemService(Context.USB_SERVICE);
        if (usbManager != null) {
            HashMap<String, UsbDevice> devices = usbManager.getDeviceList();
            if (devices != null && !devices.isEmpty()) {
                return State.ON;
            }
        }

        // Return UNKNOWN when OS hides the switch state and 0 peripherals attached
        return State.UNKNOWN;
    }

    public static List<String> getConnectedDeviceNames(Context context) {
        List<String> list = new ArrayList<>();
        UsbManager usbManager = (UsbManager) context.getSystemService(Context.USB_SERVICE);
        if (usbManager != null) {
            HashMap<String, UsbDevice> map = usbManager.getDeviceList();
            if (map != null) {
                for (UsbDevice device : map.values()) {
                    String name = device.getProductName();
                    if (name == null || name.isEmpty()) name = device.getDeviceName();
                    list.add(name + " [VID:0x" + Integer.toHexString(device.getVendorId()) + "]");
                }
            }
        }
        return list;
    }
}
