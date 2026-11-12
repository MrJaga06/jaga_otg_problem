import React, { useState } from 'react';
import {
  Usb,
  PowerOff,
  HelpCircle,
  Shield,
  Zap,
  RefreshCw,
  Clock,
  HardDrive,
  Settings,
  Activity,
  Trash2,
  Maximize2,
  Smartphone,
  Copy,
  Check
} from 'lucide-react';
import { OtgState, RecoveryMode, SimulatedUsbDevice, SimulatedLogEvent } from '../types';

interface PhoneSimulatorProps {
  otgState: OtgState;
  keepEnabled: boolean;
  onToggleKeepEnabled: (val: boolean) => void;
  connectedDevices: SimulatedUsbDevice[];
  secondsRemaining: number;
  isWatchdogRunning: boolean;
  recoveryMode: RecoveryMode;
  onChangeRecoveryMode: (mode: RecoveryMode) => void;
  hasNotificationPerm: boolean;
  onGrantNotificationPerm: () => void;
  isAccessibilityActive: boolean;
  onToggleAccessibility: () => void;
  isBatteryExempt: boolean;
  onToggleBatteryExempt: () => void;
  hasWriteSecureSettings: boolean;
  onTriggerRecovery: (reason: string) => void;
  logs: SimulatedLogEvent[];
  onClearLogs: () => void;
  lastActivationTime: Date | null;
  lastStatusChangeTime: Date | null;
  recoveryCount: number;
  isFrameless?: boolean;
  onToggleFrameless?: () => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  otgState,
  keepEnabled,
  onToggleKeepEnabled,
  connectedDevices,
  secondsRemaining,
  isWatchdogRunning,
  recoveryMode,
  onChangeRecoveryMode,
  hasNotificationPerm,
  onGrantNotificationPerm,
  isAccessibilityActive,
  onToggleAccessibility,
  isBatteryExempt,
  onToggleBatteryExempt,
  hasWriteSecureSettings,
  onTriggerRecovery,
  logs,
  onClearLogs,
  lastActivationTime,
  lastStatusChangeTime,
  recoveryCount,
  isFrameless = false,
  onToggleFrameless
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'usb' | 'automation' | 'permissions' | 'history'>('dashboard');
  const [historyFilter, setHistoryFilter] = useState<string>('ALL');
  const [simulatedToast, setSimulatedToast] = useState<string | null>(null);
  const [copiedAdb, setCopiedAdb] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setSimulatedToast(msg);
    setTimeout(() => setSimulatedToast(null), 3000);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredLogs = logs.filter(log => {
    if (historyFilter === 'ALL') return true;
    if (historyFilter === 'USB') return log.eventType.includes('USB');
    if (historyFilter === 'RECOVERY') return log.eventType.includes('RECOVERY');
    if (historyFilter === 'STATE') return log.eventType === 'OTG_STATE_CHANGE' || log.eventType === 'TIMEOUT_WATCHDOG';
    return true;
  });

  return (
    <div className="w-full flex flex-col items-center">
      {/* Mobile Fit / Frame Toggle Bar on Desktop */}
      {onToggleFrameless && (
        <div className="w-full max-w-md flex justify-between items-center mb-2 px-2 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">OnePlus Nord CE 2 Lite View</span>
            <span className="sm:hidden">OnePlus View</span>
          </span>
          <button
            onClick={onToggleFrameless}
            className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700/60 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Maximize2 className="w-3 h-3" />
            <span>{isFrameless ? 'Show Frame' : 'Full Mobile Fit'}</span>
          </button>
        </div>
      )}

      {/* Main Container - Fully responsive for mobile browsers and optionally framed for desktop */}
      <div
        className={`w-full transition-all duration-300 ${
          isFrameless
            ? 'max-w-md bg-[#050811] rounded-2xl border border-slate-800 shadow-2xl p-0 overflow-hidden flex flex-col h-[740px]'
            : 'max-w-[400px] sm:bg-[#0c0f17] sm:rounded-[44px] sm:p-2.5 sm:shadow-2xl sm:border-[5px] sm:border-[#1e293b] sm:ring-1 sm:ring-cyan-500/20 rounded-2xl bg-[#050811] border border-slate-800 sm:border-0 p-0 flex flex-col justify-between overflow-hidden h-[740px]'
        }`}
      >
        {/* Top Punch Hole & Speaker Grille (only shown when framed on sm+ screens) */}
        {!isFrameless && (
          <div className="hidden sm:flex absolute top-3 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-black rounded-full border border-neutral-800 z-50 items-center justify-center">
            <div className="w-1.5 h-1.5 bg-[#0a1128] rounded-full"></div>
          </div>
        )}

        {/* Phone Screen Area */}
        <div className={`relative w-full h-full bg-[#050811] ${isFrameless ? 'rounded-2xl' : 'sm:rounded-[36px] rounded-2xl'} flex flex-col overflow-hidden text-slate-100 select-none`}>
          
          {/* OxygenOS Simulated Status Bar */}
          <div className="pt-2.5 px-4 sm:px-6 pb-2 flex justify-between items-center text-[11px] font-mono font-medium text-slate-400 bg-black/70 z-40 backdrop-blur-sm border-b border-slate-900/60">
            <span>10:48</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-cyan-400 font-bold">5G</span>
              <span>VoLTE</span>
              <div className="w-4 h-2.5 border border-slate-400 rounded-sm flex items-center p-0.5">
                <div className="w-full h-full bg-cyan-400 rounded-[1px]"></div>
              </div>
            </div>
          </div>

          {/* Simulated Toast / Heads Up Notification */}
          {simulatedToast && (
            <div className="absolute top-12 left-3 right-3 z-50 bg-[#0e1626] border border-cyan-500/50 rounded-xl p-3 shadow-2xl animate-in slide-in-from-top duration-200">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
                <p className="text-xs text-slate-100 font-medium leading-tight">{simulatedToast}</p>
              </div>
            </div>
          )}

          {/* Screen Content Body - Fully Scrollable */}
          <div className="flex-1 overflow-y-auto px-3.5 sm:px-4 py-3 custom-scrollbar">
            
            {/* SCREEN 1: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-3.5">
                {/* Header */}
                <div className="flex justify-between items-center pt-0.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${isWatchdogRunning ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                      <h1 className="text-sm sm:text-base font-black tracking-wider text-white">OTG GUARDIAN</h1>
                    </div>
                    <p className="text-[10px] font-mono text-cyan-400">OnePlus Nord CE 2 Lite • OxygenOS 14</p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    isWatchdogRunning
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {isWatchdogRunning ? 'WATCHDOG ON' : 'IDLE'}
                  </span>
                </div>

                {/* Circular OTG Status Dial */}
                <div className="flex flex-col items-center justify-center py-1">
                  <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center">
                    {/* Outer Pulsing Ring */}
                    <div className={`absolute inset-0 rounded-full border-2 transition-all duration-700 ${
                      otgState === 'ON'
                        ? 'border-emerald-500/40 bg-emerald-500/10 animate-ping'
                        : otgState === 'OFF'
                        ? 'border-rose-500/40 bg-rose-500/10'
                        : 'border-amber-500/40 bg-amber-500/10'
                    }`} style={{ animationDuration: '3s' }} />

                    {/* Inner Dial */}
                    <div className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 flex flex-col items-center justify-center shadow-2xl bg-gradient-to-b from-[#0e1626] to-black ${
                      otgState === 'ON'
                        ? 'border-emerald-500 text-emerald-400'
                        : otgState === 'OFF'
                        ? 'border-rose-500 text-rose-400'
                        : 'border-amber-500 text-amber-400'
                    }`}>
                      {otgState === 'ON' && <Usb className="w-8 h-8 sm:w-9 sm:h-9 mb-1" />}
                      {otgState === 'OFF' && <PowerOff className="w-8 h-8 sm:w-9 sm:h-9 mb-1" />}
                      {otgState === 'UNKNOWN' && <HelpCircle className="w-8 h-8 sm:w-9 sm:h-9 mb-1" />}

                      <span className="text-xs font-black tracking-wider">
                        {otgState === 'ON' ? 'OTG ON' : otgState === 'OFF' ? 'OTG OFF' : 'UNKNOWN'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                        {otgState === 'ON' ? 'VBUS 5V ACTIVE' : otgState === 'OFF' ? 'POWER GATED' : 'OS HIDDEN'}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-center text-slate-300 mt-2 px-2 max-w-[320px]">
                    {otgState === 'ON'
                      ? 'USB Host power is active. Peripherals receive VBUS current.'
                      : otgState === 'OFF'
                      ? 'OxygenOS 10-minute inactivity timeout triggered. OTG switched off.'
                      : 'OxygenOS hides global switch state until a USB device is plugged in.'}
                  </p>
                </div>

                {/* KEEP OTG ENABLED Master Switch Card */}
                <div className={`p-3 sm:p-3.5 rounded-xl border transition-all ${
                  keepEnabled
                    ? 'bg-[#0e1b2e] border-cyan-500/50 shadow-lg shadow-cyan-950/40'
                    : 'bg-[#0c121e] border-slate-800'
                }`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${keepEnabled ? 'text-cyan-400 animate-spin' : 'text-slate-500'}`} style={{ animationDuration: '6s' }} />
                        <span className="text-xs font-bold text-white tracking-wide truncate">KEEP OTG ENABLED</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                        Auto-detects 10m timeout &amp; restores OTG automatically.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const next = !keepEnabled;
                        onToggleKeepEnabled(next);
                        showToast(next ? 'Keep OTG Enabled: Watchdog Started' : 'Keep OTG Enabled: Disabled');
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                        keepEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          keepEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Watchdog Timer Progress if enabled */}
                  {keepEnabled && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                      <div className="flex justify-between items-center text-[10px] font-mono mb-1">
                        <span className="text-slate-400">OxygenOS 10m Watchdog:</span>
                        <span className={connectedDevices.length > 0 ? 'text-emerald-400 font-bold' : secondsRemaining < 120 ? 'text-rose-400 font-bold' : 'text-cyan-400 font-bold'}>
                          {connectedDevices.length > 0 ? 'PAUSED (Device Connected)' : `${formatTimer(secondsRemaining)} left`}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            connectedDevices.length > 0
                              ? 'bg-emerald-500 w-full'
                              : secondsRemaining < 120
                              ? 'bg-rose-500'
                              : 'bg-cyan-500'
                          }`}
                          style={{
                            width: connectedDevices.length > 0 ? '100%' : `${(secondsRemaining / 600) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* ENABLE OTG AGAIN Primary Button */}
                <button
                  onClick={() => {
                    onTriggerRecovery('User 1-Tap Dashboard Button');
                    showToast('Executing OTG Auto-Recovery...');
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[46px]"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>ENABLE OTG AGAIN</span>
                </button>

                {/* Status Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 sm:p-3 bg-[#0a0f1b] rounded-xl border border-slate-800/80">
                    <span className="text-[9px] font-mono text-slate-400 block uppercase">USB Peripherals</span>
                    <span className="text-xs font-bold text-white block mt-0.5 truncate">
                      {connectedDevices.length > 0 ? `${connectedDevices.length} Connected` : 'None Connected'}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 block truncate mt-0.5">
                      {connectedDevices.length > 0 ? connectedDevices[0].productName : 'Watchdog armed'}
                    </span>
                  </div>

                  <div className="p-2.5 sm:p-3 bg-[#0a0f1b] rounded-xl border border-slate-800/80">
                    <span className="text-[9px] font-mono text-slate-400 block uppercase">Recoveries Done</span>
                    <span className="text-xs font-bold text-emerald-400 block mt-0.5 truncate">
                      {recoveryCount} Restored
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 block truncate mt-0.5">
                      {lastActivationTime ? `Last: ${lastActivationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Default'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 2: USB ACTIVITY */}
            {activeTab === 'usb' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-sm font-bold text-white">USB Host Peripherals</h2>
                    <p className="text-[10px] text-cyan-400 font-mono">{connectedDevices.length} Active Enumeration(s)</p>
                  </div>
                  <button
                    onClick={() => showToast('Refreshed USB Host Bus')}
                    className="p-1.5 bg-slate-800 rounded-lg text-cyan-400 hover:bg-slate-700 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Explanatory banner */}
                <div className="p-2.5 bg-[#0e1b2e] rounded-xl border border-cyan-500/30 text-[10px] text-slate-300">
                  <span className="font-semibold text-cyan-300 block mb-0.5">⚡ Timeout Hardware Shield:</span>
                  When an active USB peripheral is enumerated, OxygenOS resets its 10-minute timeout counter automatically.
                </div>

                {connectedDevices.length === 0 ? (
                  <div className="py-10 flex flex-col items-center justify-center text-center p-4 bg-[#0a0f1b] rounded-xl border border-slate-800">
                    <HardDrive className="w-10 h-10 text-slate-600 mb-2" />
                    <span className="text-xs font-bold text-slate-300">No USB Devices Attached</span>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-[240px]">
                      Use the Hardware Simulator tab to connect a simulated flash drive or mouse.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {connectedDevices.map(device => (
                      <div key={device.id} className="p-3 bg-[#0d1524] rounded-xl border border-emerald-500/30">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block truncate">{device.productName}</span>
                            <span className="text-[10px] text-slate-400 truncate block">{device.manufacturerName}</span>
                          </div>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
                            ONLINE
                          </span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-400">
                          <div className="truncate">Class: <span className="text-slate-200">{device.deviceClassLabel}</span></div>
                          <div className="text-right">VID/PID: <span className="text-cyan-400">0x{device.vendorId.toString(16).padStart(4, '0')}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SCREEN 3: AUTOMATION */}
            {activeTab === 'automation' && (
              <div className="space-y-3">
                <div>
                  <h2 className="text-sm font-bold text-white">OTG Automation Engine</h2>
                  <p className="text-[10px] text-slate-400">Configure how OTG Guardian automatically recovers.</p>
                </div>

                {/* Mode Selectors */}
                <div className="space-y-2">
                  <div
                    onClick={() => onChangeRecoveryMode('ACCESSIBILITY_AUTO')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      recoveryMode === 'ACCESSIBILITY_AUTO'
                        ? 'bg-[#0f1f38] border-cyan-500/60'
                        : 'bg-[#0a0f1b] border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded-full border shrink-0 flex items-center justify-center ${
                        recoveryMode === 'ACCESSIBILITY_AUTO' ? 'border-cyan-400 bg-cyan-500' : 'border-slate-600'
                      }`}>
                        {recoveryMode === 'ACCESSIBILITY_AUTO' && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                      </div>
                      <span className="text-xs font-bold text-white">Accessibility Auto-Assist</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono ml-auto">RECOMMENDED</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 pl-5">
                      Opens OxygenOS Settings and automatically clicks &apos;OTG connection&apos; ON without user touch.
                    </p>
                  </div>

                  <div
                    onClick={() => onChangeRecoveryMode('DIRECT_SECURE_SETTINGS')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      recoveryMode === 'DIRECT_SECURE_SETTINGS'
                        ? 'bg-[#0f1f38] border-blue-500/60'
                        : 'bg-[#0a0f1b] border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded-full border shrink-0 flex items-center justify-center ${
                        recoveryMode === 'DIRECT_SECURE_SETTINGS' ? 'border-blue-400 bg-blue-500' : 'border-slate-600'
                      }`}>
                        {recoveryMode === 'DIRECT_SECURE_SETTINGS' && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                      </div>
                      <span className="text-xs font-bold text-white">Direct Settings.Global (ADB)</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 pl-5">
                      Zero-touch background toggle via WRITE_SECURE_SETTINGS.
                    </p>
                  </div>

                  <div
                    onClick={() => onChangeRecoveryMode('INTERACTIVE_NOTIFICATION')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      recoveryMode === 'INTERACTIVE_NOTIFICATION'
                        ? 'bg-[#0f1f38] border-slate-400'
                        : 'bg-[#0a0f1b] border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded-full border shrink-0 flex items-center justify-center ${
                        recoveryMode === 'INTERACTIVE_NOTIFICATION' ? 'border-slate-300 bg-slate-300' : 'border-slate-600'
                      }`}>
                        {recoveryMode === 'INTERACTIVE_NOTIFICATION' && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                      </div>
                      <span className="text-xs font-bold text-white">1-Tap Notification Alert</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 pl-5">
                      Sends high-priority notification with 1-tap restore action.
                    </p>
                  </div>
                </div>

                {/* Battery Optimization Card */}
                <div className="p-3 bg-[#0a0f1b] rounded-xl border border-slate-800 flex justify-between items-center gap-2">
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">OxygenOS Battery Exemption</span>
                    <span className="text-[10px] text-slate-400 block truncate">Prevent deep freeze in background</span>
                  </div>
                  <button
                    onClick={onToggleBatteryExempt}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold shrink-0 cursor-pointer ${
                      isBatteryExempt ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {isBatteryExempt ? 'EXEMPT' : 'RESTRICTED'}
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 4: PERMISSIONS */}
            {activeTab === 'permissions' && (
              <div className="space-y-3">
                <div>
                  <h2 className="text-sm font-bold text-white">Permissions &amp; Setup</h2>
                  <p className="text-[10px] text-slate-400">All permissions respect Android 14 security rules. No root required.</p>
                </div>

                <div className="space-y-2">
                  {/* Notification Permission */}
                  <div className="p-3 bg-[#0a0f1b] rounded-xl border border-slate-800 flex justify-between items-center gap-2">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate">Post Notifications</span>
                      <span className="text-[10px] text-slate-400 block truncate">Foreground watchdog service</span>
                    </div>
                    <button
                      onClick={onGrantNotificationPerm}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold shrink-0 cursor-pointer ${
                        hasNotificationPerm ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500 text-black'
                      }`}
                    >
                      {hasNotificationPerm ? 'GRANTED' : 'GRANT'}
                    </button>
                  </div>

                  {/* Accessibility Service */}
                  <div className="p-3 bg-[#0a0f1b] rounded-xl border border-slate-800 flex justify-between items-center gap-2">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate">Accessibility Auto-Assist</span>
                      <span className="text-[10px] text-slate-400 block truncate">Target: OxygenOS Settings</span>
                    </div>
                    <button
                      onClick={onToggleAccessibility}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold shrink-0 cursor-pointer ${
                        isAccessibilityActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {isAccessibilityActive ? 'ACTIVE' : 'ENABLE'}
                    </button>
                  </div>

                  {/* ADB WRITE_SECURE_SETTINGS */}
                  <div className="p-3 bg-[#0a0f1b] rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-white">WRITE_SECURE_SETTINGS</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        hasWriteSecureSettings ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {hasWriteSecureSettings ? 'GRANTED' : 'OPTIONAL (ADB)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <p className="text-[9px] font-mono text-cyan-400 bg-black/60 p-2 rounded border border-slate-800 break-all select-all flex-1">
                        adb shell pm grant com.otgguardian.app android.permission.WRITE_SECURE_SETTINGS
                      </p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('adb shell pm grant com.otgguardian.app android.permission.WRITE_SECURE_SETTINGS');
                          setCopiedAdb(true);
                          setTimeout(() => setCopiedAdb(false), 2000);
                        }}
                        className="p-2 bg-slate-800 rounded text-slate-300 hover:text-white shrink-0 cursor-pointer"
                        title="Copy command"
                      >
                        {copiedAdb ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 5: HISTORY */}
            {activeTab === 'history' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-bold text-white">Activity History ({filteredLogs.length})</h2>
                  <button
                    onClick={onClearLogs}
                    className="p-1.5 text-rose-400 hover:text-rose-300 cursor-pointer"
                    title="Clear history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Filter chips */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 text-[10px] custom-scrollbar">
                  {['ALL', 'USB', 'RECOVERY', 'STATE'].map(f => (
                    <button
                      key={f}
                      onClick={() => setHistoryFilter(f)}
                      className={`px-2.5 py-1 rounded-full font-medium transition-colors shrink-0 cursor-pointer ${
                        historyFilter === f
                          ? 'bg-cyan-500 text-black font-bold'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-0.5 custom-scrollbar">
                  {filteredLogs.map(log => (
                    <div key={log.id} className="p-2.5 bg-[#0a0f1b] rounded-xl border border-slate-800/80 text-[10px]">
                      <div className="flex justify-between items-center gap-1">
                        <span className="font-bold text-slate-200 truncate">{log.title}</span>
                        <span className="font-mono text-[9px] text-slate-500 shrink-0">
                          {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-400 mt-0.5 leading-tight">{log.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Android Navigation Bar - Perfectly spaced & responsive */}
          <div className="bg-black/95 border-t border-slate-800/80 px-1 py-1 flex items-center justify-around z-40 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg transition-colors cursor-pointer min-w-0 ${
                activeTab === 'dashboard' ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Activity className="w-4 h-4 shrink-0" />
              <span className="text-[9px] mt-0.5 truncate w-full text-center">Status</span>
            </button>

            <button
              onClick={() => setActiveTab('usb')}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg transition-colors cursor-pointer min-w-0 ${
                activeTab === 'usb' ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Usb className="w-4 h-4 shrink-0" />
              <span className="text-[9px] mt-0.5 truncate w-full text-center">USB Host</span>
            </button>

            <button
              onClick={() => setActiveTab('automation')}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg transition-colors cursor-pointer min-w-0 ${
                activeTab === 'automation' ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span className="text-[9px] mt-0.5 truncate w-full text-center">Auto</span>
            </button>

            <button
              onClick={() => setActiveTab('permissions')}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg transition-colors cursor-pointer min-w-0 ${
                activeTab === 'permissions' ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Shield className="w-4 h-4 shrink-0" />
              <span className="text-[9px] mt-0.5 truncate w-full text-center">Setup</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg transition-colors cursor-pointer min-w-0 ${
                activeTab === 'history' ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span className="text-[9px] mt-0.5 truncate w-full text-center">History</span>
            </button>
          </div>

          {/* Android Home Bar Pill */}
          <div className="w-24 h-1 bg-slate-600 rounded-full mx-auto my-1.5 opacity-60 shrink-0"></div>

        </div>
      </div>
    </div>
  );
};
