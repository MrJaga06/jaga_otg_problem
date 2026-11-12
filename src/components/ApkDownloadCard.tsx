import React, { useState } from 'react';
import {
  Download,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Cpu,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  Zap,
  ArrowDownCircle
} from 'lucide-react';

export const ApkDownloadCard: React.FC = () => {
  const [copiedAdb, setCopiedAdb] = useState<boolean>(false);
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);

  const adbCmd = 'adb shell pm grant com.otgguardian.app android.permission.WRITE_SECURE_SETTINGS';

  const handleCopyAdb = () => {
    navigator.clipboard.writeText(adbCmd);
    setCopiedAdb(true);
    setTimeout(() => setCopiedAdb(false), 2000);
  };

  return (
    <div className="bg-[#0b101d] border border-cyan-500/40 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-black shadow-lg shadow-cyan-950 shrink-0">
            <Smartphone className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black tracking-wide text-white">
                OTG GUARDIAN APK (v1.0.0)
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                SIGNED &amp; READY
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Compiled specifically for OnePlus Nord CE 2 Lite 5G • Android 14 (API 34)
            </p>
          </div>
        </div>

        {/* Primary Download Anchor Button */}
        <a
          href="/otg-guardian.apk"
          download="otg-guardian.apk"
          onClick={() => setIsDownloaded(true)}
          className="w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98] text-black font-black text-sm rounded-xl shadow-xl shadow-cyan-950/60 flex items-center justify-center gap-2.5 transition-all cursor-pointer shrink-0"
        >
          <ArrowDownCircle className="w-5 h-5" />
          <span>{isDownloaded ? 'Downloaded! (Tap to Re-download)' : 'DOWNLOAD APK NOW'}</span>
        </a>
      </div>

      {/* APK Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-3 bg-[#0e1628] rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-500 font-mono block">PACKAGE</span>
          <span className="font-mono text-cyan-400 font-bold truncate block">com.otgguardian.app</span>
        </div>
        <div className="p-3 bg-[#0e1628] rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-500 font-mono block">TARGET OS</span>
          <span className="font-bold text-white block">Android 14 (API 34)</span>
        </div>
        <div className="p-3 bg-[#0e1628] rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-500 font-mono block">DEVICE BUILD</span>
          <span className="font-mono text-white block truncate">OnePlus CPH2381</span>
        </div>
        <div className="p-3 bg-[#0e1628] rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-500 font-mono block">APK SIGNATURE</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>v2 + v3 Verified</span>
          </span>
        </div>
      </div>

      {/* Installation Instructions for OnePlus Nord CE 2 Lite (OxygenOS 14) */}
      <div className="p-4 bg-[#080d19] rounded-xl border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          <span>How to Install on your OnePlus Mobile Phone:</span>
        </h3>

        <ol className="list-decimal pl-5 space-y-2 text-xs text-slate-300 leading-relaxed">
          <li>
            Tap the <strong className="text-white">DOWNLOAD APK NOW</strong> button above. Your browser will download <code className="text-cyan-300 font-mono bg-black/50 px-1 py-0.5 rounded">otg-guardian.apk</code>.
          </li>
          <li>
            In your notification drawer or Downloads folder, tap <strong className="text-white">otg-guardian.apk</strong> to open it.
          </li>
          <li>
            If OxygenOS displays <em>&quot;For your security, your phone is not allowed to install unknown apps from this source&quot;</em>, tap <strong className="text-white">Settings</strong> and turn on <strong className="text-white">Allow from this source</strong>.
          </li>
          <li>
            Tap <strong className="text-white">Install</strong>, then tap <strong className="text-white">Open</strong>.
          </li>
          <li>
            Inside OTG Guardian:
            <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-400">
              <li>Turn ON <strong className="text-cyan-300">KEEP OTG ENABLED</strong>.</li>
              <li>Tap <strong className="text-white">Open Accessibility Auto-Assist Settings</strong> and turn on <strong className="text-white">OTG Guardian</strong> so it can automatically re-enable OTG when OxygenOS times out.</li>
              <li>Tap <strong className="text-white">Exempt from OxygenOS Battery Killer</strong> to ensure the watchdog stays active in background.</li>
            </ul>
          </li>
        </ol>
      </div>

      {/* Optional ADB Zero-Touch Command */}
      <div className="p-4 bg-[#0e1628] rounded-xl border border-slate-800 space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">Optional: Zero-Touch Direct Toggle (ADB)</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              NO ROOT
            </span>
          </div>
          <button
            onClick={handleCopyAdb}
            className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedAdb ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedAdb ? 'Copied' : 'Copy ADB Command'}</span>
          </button>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          If you have a PC with USB debugging enabled, running this command allows OTG Guardian to toggle the OxygenOS switch directly in the background with zero screen popups:
        </p>
        <div className="p-2.5 bg-black/70 rounded-lg border border-slate-800 font-mono text-[11px] text-cyan-400 break-all select-all">
          {adbCmd}
        </div>
      </div>
    </div>
  );
};
