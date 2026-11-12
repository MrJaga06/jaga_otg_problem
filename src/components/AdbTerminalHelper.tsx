import React, { useState } from 'react';
import {
  Terminal,
  Copy,
  Check,
  Zap,
  PlayCircle,
  HelpCircle,
  ShieldAlert,
  Smartphone
} from 'lucide-react';

export const AdbTerminalHelper: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const adbCommands = [
    {
      title: 'Grant WRITE_SECURE_SETTINGS (Recommended for Zero-Touch)',
      description: 'Allows OTG Guardian to toggle the OxygenOS OTG setting directly in the background without opening the Settings screen.',
      command: 'adb shell pm grant com.otgguardian.app android.permission.WRITE_SECURE_SETTINGS'
    },
    {
      title: 'Directly Query OxygenOS OTG State via ADB',
      description: 'Verifies the current value in Settings.Global on your OnePlus Nord CE 2 Lite (returns 1 for ON, 0 for OFF).',
      command: 'adb shell settings get global otg_enabled'
    },
    {
      title: 'Directly Toggle OTG ON via ADB',
      description: 'Forces OTG ON immediately from your PC shell.',
      command: 'adb shell settings put global otg_enabled 1'
    },
    {
      title: 'Exempt OTG Guardian from OxygenOS Doze / Deep Sleep',
      description: 'Prevents the OxygenOS 14 background task cleaner from killing the watchdog foreground service.',
      command: 'adb shell dumpsys deviceidle whitelist +com.otgguardian.app'
    },
    {
      title: 'Directly Launch OxygenOS OTG Settings Screen via Intent',
      description: 'Tests if your OnePlus Nord CE 2 Lite opens the exact OTG toggle page.',
      command: 'adb shell am start -a oplus.intent.action.OTG_SETTINGS'
    }
  ];

  const handleCopy = (cmd: string, idx: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-[#0b101d] border border-slate-800 rounded-2xl p-3.5 sm:p-6 shadow-xl space-y-4 sm:space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Terminal className="w-5 h-5 text-cyan-400 shrink-0" />
          <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
            ADB Command Center &amp; OnePlus Testing Suite
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          One-click copy commands to inspect, configure, and elevate OTG Guardian on OnePlus Nord CE 2 Lite 5G (OxygenOS 14).
        </p>
      </div>

      {/* Commands List */}
      <div className="space-y-3">
        {adbCommands.map((item, idx) => (
          <div key={idx} className="p-4 bg-[#0e1628] rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white">{item.title}</span>
              <button
                onClick={() => handleCopy(item.command, idx)}
                className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400">{item.description}</p>

            <div className="p-2.5 bg-black/60 rounded-lg border border-slate-800 font-mono text-[11px] text-cyan-400 break-all select-all">
              {item.command}
            </div>
          </div>
        ))}
      </div>

      {/* APK Compilation Instructions */}
      <div className="p-4 bg-[#0a0f1b] rounded-xl border border-slate-800 text-xs space-y-2">
        <h3 className="font-bold text-white flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>Building the Debug &amp; Release APK:</span>
        </h3>
        <ol className="list-decimal pl-5 space-y-1 text-slate-300 text-[11px] leading-relaxed">
          <li>Unzip the project downloaded from the &quot;Android Project Code&quot; tab.</li>
          <li>In your terminal inside the project directory, run: <code className="text-cyan-400 font-mono bg-black/60 px-1 py-0.5 rounded">./gradlew assembleDebug</code></li>
          <li>The APK will be generated at <code className="text-cyan-400 font-mono bg-black/60 px-1 py-0.5 rounded">app/build/outputs/apk/debug/app-debug.apk</code></li>
          <li>Install directly to your phone: <code className="text-cyan-400 font-mono bg-black/60 px-1 py-0.5 rounded">adb install -r app/build/outputs/apk/debug/app-debug.apk</code></li>
        </ol>
      </div>
    </div>
  );
};
