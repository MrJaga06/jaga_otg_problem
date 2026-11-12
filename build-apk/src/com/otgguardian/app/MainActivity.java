package com.otgguardian.app;

import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;
import java.util.List;

public class MainActivity extends Activity {
    private TextView statusTitleView;
    private TextView statusSubView;
    private TextView deviceCountView;
    private TextView lastActivationView;
    private Switch keepEnabledSwitch;
    private LinearLayout statusDial;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private SharedPreferences prefs;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        prefs = getSharedPreferences("otg_guardian", Context.MODE_PRIVATE);

        // Request notification permission on Android 13+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (checkSelfPermission("android.permission.POST_NOTIFICATIONS") != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"}, 101);
            }
        }

        handleIncomingIntent(getIntent());
        buildUi();
        startPeriodicUpdate();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleIncomingIntent(intent);
    }

    private void handleIncomingIntent(Intent intent) {
        if (intent != null && "com.otgguardian.app.ACTION_TRIGGER_SETTINGS".equals(intent.getAction())) {
            OxygenOsHelper.openOtgSettings(this);
        }
    }

    private void buildUi() {
        ScrollView scrollView = new ScrollView(this);
        scrollView.setBackgroundColor(Color.parseColor("#050811"));
        scrollView.setFillViewport(true);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(18), dp(20), dp(18), dp(30));
        root.setGravity(Gravity.CENTER_HORIZONTAL);

        // Header Title
        LinearLayout header = new LinearLayout(this);
        header.setOrientation(LinearLayout.VERTICAL);
        header.setLayoutParams(new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT));

        TextView appTitle = new TextView(this);
        appTitle.setText("⚡ OTG GUARDIAN");
        appTitle.setTextSize(20);
        appTitle.setTypeface(Typeface.DEFAULT_BOLD);
        appTitle.setTextColor(Color.WHITE);

        TextView targetDesc = new TextView(this);
        targetDesc.setText("OnePlus Nord CE 2 Lite 5G • OxygenOS 14 (CPH2381)");
        targetDesc.setTextSize(11);
        targetDesc.setTextColor(Color.parseColor("#06b6d4"));
        targetDesc.setPadding(0, dp(2), 0, 0);

        header.addView(appTitle);
        header.addView(targetDesc);
        root.addView(header);

        // Circular Status Indicator Dial
        statusDial = new LinearLayout(this);
        statusDial.setOrientation(LinearLayout.VERTICAL);
        statusDial.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams dialParams = new LinearLayout.LayoutParams(dp(180), dp(180));
        dialParams.setMargins(0, dp(24), 0, dp(16));
        statusDial.setLayoutParams(dialParams);

        statusTitleView = new TextView(this);
        statusTitleView.setText("OTG DETECTING...");
        statusTitleView.setTextSize(15);
        statusTitleView.setTypeface(Typeface.DEFAULT_BOLD);
        statusTitleView.setGravity(Gravity.CENTER);

        statusSubView = new TextView(this);
        statusSubView.setText("Probing hardware VBUS state");
        statusSubView.setTextSize(10);
        statusSubView.setTextColor(Color.parseColor("#94a3b8"));
        statusSubView.setGravity(Gravity.CENTER);
        statusSubView.setPadding(dp(8), dp(4), dp(8), 0);

        statusDial.addView(statusTitleView);
        statusDial.addView(statusSubView);
        root.addView(statusDial);

        // KEEP OTG ENABLED Master Switch Card
        LinearLayout switchCard = createCard();
        LinearLayout switchRow = new LinearLayout(this);
        switchRow.setOrientation(LinearLayout.HORIZONTAL);
        switchRow.setGravity(Gravity.CENTER_VERTICAL);
        switchRow.setLayoutParams(new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT));

        LinearLayout textCol = new LinearLayout(this);
        textCol.setOrientation(LinearLayout.VERTICAL);
        LinearLayout.LayoutParams tcParams = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1.0f);
        textCol.setLayoutParams(tcParams);

        TextView switchTitle = new TextView(this);
        switchTitle.setText("KEEP OTG ENABLED");
        switchTitle.setTextSize(14);
        switchTitle.setTypeface(Typeface.DEFAULT_BOLD);
        switchTitle.setTextColor(Color.WHITE);

        TextView switchDesc = new TextView(this);
        switchDesc.setText("Monitors OxygenOS 10m timeout & auto-recovers.");
        switchDesc.setTextSize(11);
        switchDesc.setTextColor(Color.parseColor("#94a3b8"));

        textCol.addView(switchTitle);
        textCol.addView(switchDesc);

        keepEnabledSwitch = new Switch(this);
        boolean currentKeep = prefs.getBoolean("keep_otg_enabled", true);
        keepEnabledSwitch.setChecked(currentKeep);
        keepEnabledSwitch.setOnCheckedChangeListener((buttonView, isChecked) -> {
            prefs.edit().putBoolean("keep_otg_enabled", isChecked).apply();
            if (isChecked) {
                OtgMonitoringService.startService(MainActivity.this);
                Toast.makeText(MainActivity.this, "OTG Guardian Watchdog Started", Toast.LENGTH_SHORT).show();
            } else {
                OtgMonitoringService.stopService(MainActivity.this);
                Toast.makeText(MainActivity.this, "OTG Guardian Stopped", Toast.LENGTH_SHORT).show();
            }
        });

        switchRow.addView(textCol);
        switchRow.addView(keepEnabledSwitch);
        switchCard.addView(switchRow);
        root.addView(switchCard);

        // ENABLE OTG AGAIN Button
        Button enableBtn = new Button(this);
        enableBtn.setText("⚡ ENABLE OTG AGAIN");
        enableBtn.setTextSize(13);
        enableBtn.setTypeface(Typeface.DEFAULT_BOLD);
        enableBtn.setTextColor(Color.WHITE);
        GradientDrawable btnBg = new GradientDrawable();
        btnBg.setColor(Color.parseColor("#2563eb"));
        btnBg.setCornerRadius(dp(12));
        enableBtn.setBackground(btnBg);
        LinearLayout.LayoutParams btnParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, dp(48));
        btnParams.setMargins(0, dp(12), 0, dp(16));
        enableBtn.setLayoutParams(btnParams);
        enableBtn.setOnClickListener(v -> {
            RecoveryManager.performRecovery(MainActivity.this, "1-Tap Manual Button");
            Toast.makeText(MainActivity.this, "Restoring OTG...", Toast.LENGTH_SHORT).show();
            updateStatusUi();
        });
        root.addView(enableBtn);

        // USB Status & Info Grid
        LinearLayout infoCard = createCard();
        deviceCountView = new TextView(this);
        deviceCountView.setText("USB Peripherals: Scanning...");
        deviceCountView.setTextSize(12);
        deviceCountView.setTextColor(Color.WHITE);
        deviceCountView.setTypeface(Typeface.DEFAULT_BOLD);

        lastActivationView = new TextView(this);
        lastActivationView.setText("Kernel Power Gate: 10m Inactivity Timeout");
        lastActivationView.setTextSize(11);
        lastActivationView.setTextColor(Color.parseColor("#94a3b8"));
        lastActivationView.setPadding(0, dp(4), 0, 0);

        infoCard.addView(deviceCountView);
        infoCard.addView(lastActivationView);
        root.addView(infoCard);

        // Permission & Setup Card
        LinearLayout setupCard = createCard();
        TextView setupTitle = new TextView(this);
        setupTitle.setText("🛠️ QUICK SETUP & ELEVATION");
        setupTitle.setTextSize(12);
        setupTitle.setTypeface(Typeface.DEFAULT_BOLD);
        setupTitle.setTextColor(Color.parseColor("#06b6d4"));
        setupCard.addView(setupTitle);

        Button accessBtn = createOutlinedButton("Open Accessibility Auto-Assist Settings", v -> {
            startActivity(new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS));
        });
        setupCard.addView(accessBtn);

        Button batteryBtn = createOutlinedButton("Exempt from OxygenOS Battery Killer", v -> {
            try {
                Intent i = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                i.setData(Uri.parse("package:" + getPackageName()));
                startActivity(i);
            } catch (Exception e) {
                startActivity(new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS));
            }
        });
        setupCard.addView(batteryBtn);

        Button copyAdbBtn = createOutlinedButton("Copy Optional ADB Secure Settings Command", v -> {
            ClipboardManager cm = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
            if (cm != null) {
                cm.setPrimaryClip(ClipData.newPlainText("ADB Command",
                    "adb shell pm grant " + getPackageName() + " android.permission.WRITE_SECURE_SETTINGS"));
                Toast.makeText(MainActivity.this, "Copied ADB command to clipboard!", Toast.LENGTH_LONG).show();
            }
        });
        setupCard.addView(copyAdbBtn);

        root.addView(setupCard);
        scrollView.addView(root);
        setContentView(scrollView);

        // Auto start service if enabled
        if (currentKeep && !OtgMonitoringService.isRunning) {
            OtgMonitoringService.startService(this);
        }
    }

    private LinearLayout createCard() {
        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setPadding(dp(14), dp(14), dp(14), dp(14));
        GradientDrawable gd = new GradientDrawable();
        gd.setColor(Color.parseColor("#0e1626"));
        gd.setCornerRadius(dp(14));
        gd.setStroke(dp(1), Color.parseColor("#1e293b"));
        card.setBackground(gd);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        params.setMargins(0, 0, 0, dp(12));
        card.setLayoutParams(params);
        return card;
    }

    private Button createOutlinedButton(String text, View.OnClickListener listener) {
        Button b = new Button(this);
        b.setText(text);
        b.setTextSize(11);
        b.setTextColor(Color.WHITE);
        GradientDrawable gd = new GradientDrawable();
        gd.setColor(Color.parseColor("#131d31"));
        gd.setCornerRadius(dp(8));
        gd.setStroke(dp(1), Color.parseColor("#334155"));
        b.setBackground(gd);
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, dp(40));
        p.setMargins(0, dp(8), 0, 0);
        b.setLayoutParams(p);
        b.setOnClickListener(listener);
        return b;
    }

    private void updateStatusUi() {
        OtgStateDetector.State state = OtgStateDetector.detectState(this);
        List<String> devices = OtgStateDetector.getConnectedDeviceNames(this);

        GradientDrawable dialBg = new GradientDrawable();
        dialBg.setShape(GradientDrawable.OVAL);

        if (state == OtgStateDetector.State.ON) {
            dialBg.setColor(Color.parseColor("#022c22"));
            dialBg.setStroke(dp(3), Color.parseColor("#10b981"));
            statusTitleView.setText("OTG ON");
            statusTitleView.setTextColor(Color.parseColor("#10b981"));
            statusSubView.setText(devices.isEmpty() ? "VBUS 5V Active (Watchdog armed)" : devices.size() + " peripheral(s) connected");
        } else if (state == OtgStateDetector.State.OFF) {
            dialBg.setColor(Color.parseColor("#450a0a"));
            dialBg.setStroke(dp(3), Color.parseColor("#f43f5e"));
            statusTitleView.setText("OTG OFF");
            statusTitleView.setTextColor(Color.parseColor("#f43f5e"));
            statusSubView.setText("10m timeout triggered. Tap button to restore.");
        } else {
            dialBg.setColor(Color.parseColor("#1e1b4b"));
            dialBg.setStroke(dp(3), Color.parseColor("#f59e0b"));
            statusTitleView.setText("UNKNOWN");
            statusTitleView.setTextColor(Color.parseColor("#f59e0b"));
            statusSubView.setText("OS hides switch state until device connects.");
        }
        statusDial.setBackground(dialBg);

        if (devices.isEmpty()) {
            deviceCountView.setText("USB Peripherals: None (10m timeout active)");
            deviceCountView.setTextColor(Color.parseColor("#94a3b8"));
        } else {
            deviceCountView.setText("USB Peripherals: " + devices.size() + " Connected");
            deviceCountView.setTextColor(Color.parseColor("#10b981"));
        }
    }

    private void startPeriodicUpdate() {
        handler.post(new Runnable() {
            @Override
            public void run() {
                updateStatusUi();
                handler.postDelayed(this, 2000);
            }
        });
    }

    private int dp(int v) {
        return (int) (v * getResources().getDisplayMetrics().density + 0.5f);
    }
}
