package com.otgguardian.app.service

import android.accessibilityservice.AccessibilityService
import android.content.Intent
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
        Log.i(TAG, "OtgAccessibilityService connected & ready for OxygenOS 14")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (!armedForToggle) return
        if (event == null) return

        val rootNode = rootInActiveWindow ?: return

        try {
            // Find OTG switch in OxygenOS settings hierarchy
            for (keyword in OxygenOsHelper.ACCESSIBILITY_KEYWORDS) {
                val nodes = rootNode.findAccessibilityNodeInfosByText(keyword)
                if (nodes.isNotEmpty()) {
                    for (node in nodes) {
                        if (tryToggleOtgSwitch(node)) {
                            // Successfully toggled - disarm immediately to prevent repeat clicks
                            armedForToggle = false
                            Log.i(TAG, "Successfully toggled OTG switch via AccessibilityService!")
                            
                            // Record recovery success
                            serviceScope.launch {
                                val dataStore = DataStoreManager(applicationContext)
                                dataStore.incrementRecoveryCount()
                                dataStore.recordActivation()
                            }

                            // Return to previous app after a small delay to allow settings animation
                            mainHandler.postDelayed({
                                try {
                                    performGlobalAction(GLOBAL_ACTION_BACK)
                                } catch (e: Exception) {
                                    Log.w(TAG, "Back navigation failed: ${e.message}")
                                }
                            }, 500)

                            return
                        }
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error processing accessibility event", e)
        }
    }

    private fun tryToggleOtgSwitch(labelNode: AccessibilityNodeInfo): Boolean {
        // Look in parent / siblings for checkable Switch
        val parent = labelNode.parent ?: return false
        for (i in 0 until parent.childCount) {
            val child = parent.getChild(i) ?: continue
            if (child.isCheckable) {
                if (!child.isChecked) {
                    val clicked = child.performAction(AccessibilityNodeInfo.ACTION_CLICK)
                    Log.d(TAG, "Performed ACTION_CLICK on checkable switch: $clicked")
                    return clicked
                } else {
                    Log.d(TAG, "OTG switch is already ON. No toggle needed.")
                    return false
                }
            }
        }

        // If parent itself is clickable
        if (labelNode.isClickable) {
            return labelNode.performAction(AccessibilityNodeInfo.ACTION_CLICK)
        }
        if (parent.isClickable) {
            return parent.performAction(AccessibilityNodeInfo.ACTION_CLICK)
        }

        return false
    }

    override fun onInterrupt() {
        Log.w(TAG, "OtgAccessibilityService interrupted")
        armedForToggle = false
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        armedForToggle = false
        Log.i(TAG, "OtgAccessibilityService destroyed")
    }

    companion object {
        private const val TAG = "OtgAccessibilityService"
        var isRunning: Boolean = false
            private set

        @Volatile
        var armedForToggle: Boolean = false
            private set

        /**
         * Arms the service so it only acts on the next explicit recovery trigger.
         * Disarms automatically after 10 seconds if not executed.
         */
        fun armAutoToggle() {
            armedForToggle = true
            Handler(Looper.getMainLooper()).postDelayed({
                if (armedForToggle) {
                    Log.d(TAG, "Disarming auto-toggle after timeout.")
                    armedForToggle = false
                }
            }, 10000)
        }
    }
    
}
