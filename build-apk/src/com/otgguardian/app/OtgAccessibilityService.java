package com.otgguardian.app;

import android.accessibilityservice.AccessibilityService;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import java.util.List;

public class OtgAccessibilityService extends AccessibilityService {
    private static final String TAG = "OtgAccessibilityService";
    public static volatile boolean isRunning = false;
    public static volatile boolean armedForToggle = false;
    private final Handler handler = new Handler(Looper.getMainLooper());

    @Override
    public void onServiceConnected() {
        super.onServiceConnected();
        isRunning = true;
        Log.i(TAG, "OtgAccessibilityService connected & ready for OxygenOS 14");
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (!armedForToggle || event == null) return;
        AccessibilityNodeInfo root = getRootInActiveWindow();
        if (root == null) return;

        try {
            for (String keyword : OxygenOsHelper.ACCESSIBILITY_KEYWORDS) {
                List<AccessibilityNodeInfo> nodes = root.findAccessibilityNodeInfosByText(keyword);
                if (nodes != null && !nodes.isEmpty()) {
                    for (AccessibilityNodeInfo node : nodes) {
                        if (tryToggleSwitch(node)) {
                            armedForToggle = false;
                            Log.i(TAG, "Successfully auto-toggled OTG switch in OxygenOS!");
                            handler.postDelayed(() -> {
                                try {
                                    performGlobalAction(GLOBAL_ACTION_BACK);
                                } catch (Exception ignored) {}
                            }, 500);
                            return;
                        }
                    }
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error in accessibility event processing", e);
        }
    }

    private boolean tryToggleSwitch(AccessibilityNodeInfo node) {
        AccessibilityNodeInfo parent = node.getParent();
        if (parent == null) return false;

        for (int i = 0; i < parent.getChildCount(); i++) {
            AccessibilityNodeInfo child = parent.getChild(i);
            if (child != null && child.isCheckable()) {
                if (!child.isChecked()) {
                    return child.performAction(AccessibilityNodeInfo.ACTION_CLICK);
                }
                return true;
            }
        }

        if (node.isClickable()) return node.performAction(AccessibilityNodeInfo.ACTION_CLICK);
        if (parent.isClickable()) return parent.performAction(AccessibilityNodeInfo.ACTION_CLICK);
        return false;
    }

    @Override
    public void onInterrupt() {
        armedForToggle = false;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        isRunning = false;
        armedForToggle = false;
    }

    public static void armAutoToggle() {
        armedForToggle = true;
        new Handler(Looper.getMainLooper()).postDelayed(() -> armedForToggle = false, 10000);
    }
}
