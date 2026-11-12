import React, { useState, useEffect } from 'react';
import {
  Usb,
  Shield,
  Smartphone,
  Cpu,
  Terminal,
  Boxes,
  FileCode2,
  Download,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  Info,
  Sliders,
  CheckCircle2,
  ArrowDownCircle
} from 'lucide-react';
import { PhoneSimulator } from './components/PhoneSimulator';
import { HardwareControlDeck } from './components/HardwareControlDeck';
import { OxygenOsAuditMatrix } from './components/OxygenOsAuditMatrix';
import { ProjectCodeExplorer } from './components/ProjectCodeExplorer';
import { AdbTerminalHelper } from './components/AdbTerminalHelper';
import { ApkDownloadCard } from './components/ApkDownloadCard';
import { OtgState, RecoveryMode, SimulatedUsbDevice, SimulatedLogEvent } from './types';

export default function App() {
  const [activeMainTab, setActiveMainTab] = useState<'simulator' | 'apk' | 'audit' | 'code' | 'adb'>('apk');
  const [mobileSubTab, setMobileSubTab] = useState<'app' | 'deck'>('app');
  const [isFrameless, setIsFrameless] = useState<boolean>(true);

  // Auto-detect screen width on mount
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsFrameless(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Simulation State
  const [otgState, setOtgState] = useState<OtgState>('ON');
  const [keepEnabled, setKeepEnabled] = useState<boolean>(true);
  const [connectedDevices, setConnectedDevices] = useState<SimulatedUsbDevice[]>([]);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(600); // 10 minutes (600s)
  const [recoveryMode, setRecoveryMode] = useState<RecoveryMode>('ACCESSIBILITY_AUTO');
  const [hasNotificationPerm, setHasNotificationPerm] = useState<boolean>(true);
  const [isAccessibilityActive, setIsAccessibilityActive] = useState<boolean>(true);
  const [isBatteryExempt, setIsBatteryExempt] = useState<boolean>(true);
  const [hasWriteSecureSettings, setHasWriteSecureSettings] = useState<boolean>(false);
  const [lastActivationTime, setLastActivationTime] = useState<Date | null>(new Date());
  const [lastStatusChangeTime, setLastStatusChangeTime] = useState<Date | null>(new Date());
  const [recoveryCount, setRecoveryCount] = useState<number>(0);

  const [logs, setLogs] = useState<SimulatedLogEvent[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      eventType: 'SERVICE_STARTED',
      title: 'OtgMonitoringService Started',
      description: 'Foreground watchdog active with type="connectedDevice" on OxygenOS 14.',
      isSuccess: true
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1000 * 60 * 4),
      eventType: 'OTG_STATE_CHANGE',
      title: 'Hardware State Verified',
      description: 'Settings.Global key "otg_enabled" = 1 verified on CPH2381.',
      isSuccess: true
    }
  ]);

  const addLog = (
    eventType: SimulatedLogEvent['eventType'],
    title: string,
    description: string,
    isSuccess: boolean = true
  ) => {
    const newLog: SimulatedLogEvent = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
      eventType,
      title,
      description,
      isSuccess
    };
    setLogs(prev => [newLog, ...prev.slice(0, 49)]);
  };

  // 10-Minute OxygenOS Watchdog Timer Effect
  useEffect(() => {
    if (!keepEnabled) return;

    const timer = setInterval(() => {
      // If a USB device is attached, OxygenOS's hardware watchdog is paused!
      if (connectedDevices.length > 0) {
        return;
      }

      setSecondsRemaining(prev => {
        if (prev <= 1) {
          triggerTimeoutHandling();
          return 600;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [keepEnabled, connectedDevices.length, recoveryMode, hasWriteSecureSettings, isAccessibilityActive]);

  const triggerTimeoutHandling = () => {
    addLog(
      'TIMEOUT_WATCHDOG',
      '10-Minute Inactivity Reached',
      'OxygenOS power-gating triggered hardware OTG shutdown.',
      false
    );

    if (recoveryMode === 'DIRECT_SECURE_SETTINGS' && hasWriteSecureSettings) {
      setOtgState('ON');
      setLastActivationTime(new Date());
      setRecoveryCount(c => c + 1);
      addLog(
        'RECOVERY_SUCCESS',
        'Auto-Restored via WRITE_SECURE_SETTINGS',
        'Directly wrote Settings.Global "otg_enabled" = 1 without UI disruption.',
        true
      );
    } else if (recoveryMode === 'ACCESSIBILITY_AUTO' && isAccessibilityActive) {
      setOtgState('ON');
      setLastActivationTime(new Date());
      setRecoveryCount(c => c + 1);
      addLog(
        'RECOVERY_SUCCESS',
        'Auto-Restored via AccessibilityService',
        'OtgAccessibilityService detected Settings switch and toggled OTG back ON.',
        true
      );
    } else {
      setOtgState('OFF');
      setLastStatusChangeTime(new Date());
      addLog(
        'RECOVERY_TRIGGERED',
        'Alert Notification Posted',
        'OTG is OFF. High-priority notification posted with 1-tap restore action.',
        false
      );
    }
  };

  const handleAttachDevice = (device: Omit<SimulatedUsbDevice, 'id' | 'connectedAt'>) => {
    const fullDevice: SimulatedUsbDevice = {
      ...device,
      id: Math.random().toString(),
      connectedAt: new Date()
    };
    setConnectedDevices(prev => [...prev, fullDevice]);
    setOtgState('ON');
    setLastActivationTime(new Date());
    setSecondsRemaining(600);

    addLog(
      'USB_CONNECTED',
      `USB Attached: ${fullDevice.productName}`,
      `Hardware Host enumerated VID: 0x${fullDevice.vendorId.toString(16).padStart(4, '0')} (${fullDevice.deviceClassLabel}). Inactivity timer postponed.`
    );
  };

  const handleDetachDevices = () => {
    setConnectedDevices([]);
    setSecondsRemaining(600);
    addLog(
      'USB_DISCONNECTED',
      'All USB Peripherals Detached',
      'OxygenOS 10-minute countdown started. No devices drawing VBUS current.'
    );
  };

  const handleAdvanceTimer = () => {
    setSecondsRemaining(10);
    addLog(
      'TIMEOUT_WATCHDOG',
      'Watchdog Fast-Forwarded',
      'Timer advanced to 9m 50s (10 seconds remaining).'
    );
  };

  const handleManualTriggerRecovery = (reason: string) => {
    setOtgState('ON');
    setSecondsRemaining(600);
    setLastActivationTime(new Date());
    setRecoveryCount(c => c + 1);
    addLog(
      'RECOVERY_SUCCESS',
      'OTG Restored',
      `Triggered by: ${reason}. Hardware OTG state re-activated.`
    );
  };

  const handleSimulateReboot = () => {
    addLog(
      'SERVICE_STARTED',
      'Device Reboot (BOOT_COMPLETED)',
      'BootReceiver intercepted phone restart; successfully restored OtgMonitoringService.'
    );
    if (keepEnabled) {
      setSecondsRemaining(600);
    }
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans antialiased overflow-x-hidden">
      {/* Top Application Bar - Clean & Mobile Aligned */}
      <header className="border-b border-slate-800 bg-[#080d1a]/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4">
          
          {/* Brand Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-950 shrink-0">
                <Usb className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-sm sm:text-base font-black tracking-wide text-white">OTG GUARDIAN</h1>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold shrink-0">
                    OnePlus CPH2381
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400 leading-tight">
                  OxygenOS 14 Auto-Maintenance • Android 14 API 34
                </p>
              </div>
            </div>

            {/* Direct Download Button in Header */}
            <a
              href="/otg-guardian.apk"
              download="otg-guardian.apk"
              className="py-1.5 px-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold text-xs rounded-lg flex items-center gap-1.5 shadow-md shadow-cyan-950/40 shrink-0 transition-transform active:scale-95"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Download APK</span>
              <span className="sm:hidden">APK</span>
            </a>
          </div>

          {/* Navigation Tabs - Horizontally scrollable on mobile */}
          <div className="w-full md:w-auto flex items-center gap-1 p-1 bg-[#0c1220] rounded-xl border border-slate-800 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveMainTab('apk')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeMainTab === 'apk'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-md'
                  : 'text-cyan-400 hover:text-white bg-cyan-950/40 border border-cyan-800/40'
              }`}
            >
              <ArrowDownCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Download APK (Installed App)</span>
            </button>

            <button
              onClick={() => setActiveMainTab('simulator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeMainTab === 'simulator'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 shrink-0" />
              <span>Device &amp; Simulator</span>
            </button>

            <button
              onClick={() => setActiveMainTab('audit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeMainTab === 'audit'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 shrink-0" />
              <span>OxygenOS 14 Audit</span>
            </button>

            <button
              onClick={() => setActiveMainTab('code')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeMainTab === 'code'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5 shrink-0" />
              <span>Source Code &amp; ZIP</span>
            </button>

            <button
              onClick={() => setActiveMainTab('adb')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeMainTab === 'adb'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 shrink-0" />
              <span>ADB Guide</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-6 lg:px-8 py-3 sm:py-6">
        {/* APK Download View */}
        {activeMainTab === 'apk' && (
          <div className="max-w-4xl mx-auto space-y-5">
            <ApkDownloadCard />
          </div>
        )}

        {/* Interactive Device Simulator View */}
        {activeMainTab === 'simulator' && (
          <div className="space-y-4">
            
            {/* Quick APK Banner */}
            <div className="p-3 bg-gradient-to-r from-[#0c1b33] to-[#08182b] rounded-xl border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-200">
                  Real Signed Android APK is built and ready for OnePlus Nord CE 2 Lite 5G.
                </span>
              </div>
              <a
                href="/otg-guardian.apk"
                download="otg-guardian.apk"
                className="py-1 px-3 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 flex items-center gap-1 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Get otg-guardian.apk</span>
              </a>
            </div>

            {/* Mobile View Switcher (Visible on screens < lg) */}
            <div className="flex lg:hidden bg-[#0c1220] p-1 rounded-xl border border-slate-800 text-xs font-bold w-full max-w-md mx-auto">
              <button
                onClick={() => setMobileSubTab('app')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mobileSubTab === 'app'
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>OTG Guardian App</span>
              </button>

              <button
                onClick={() => setMobileSubTab('deck')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mobileSubTab === 'deck'
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Hardware Lab ({connectedDevices.length})</span>
              </button>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Phone Simulator */}
              <div className={`lg:col-span-5 flex justify-center w-full ${
                mobileSubTab === 'deck' ? 'hidden lg:flex' : 'flex'
              }`}>
                <PhoneSimulator
                  otgState={otgState}
                  keepEnabled={keepEnabled}
                  onToggleKeepEnabled={setKeepEnabled}
                  connectedDevices={connectedDevices}
                  secondsRemaining={secondsRemaining}
                  isWatchdogRunning={keepEnabled}
                  recoveryMode={recoveryMode}
                  onChangeRecoveryMode={setRecoveryMode}
                  hasNotificationPerm={hasNotificationPerm}
                  onGrantNotificationPerm={() => setHasNotificationPerm(true)}
                  isAccessibilityActive={isAccessibilityActive}
                  onToggleAccessibility={() => setIsAccessibilityActive(!isAccessibilityActive)}
                  isBatteryExempt={isBatteryExempt}
                  onToggleBatteryExempt={() => setIsBatteryExempt(!isBatteryExempt)}
                  hasWriteSecureSettings={hasWriteSecureSettings}
                  onTriggerRecovery={handleManualTriggerRecovery}
                  logs={logs}
                  onClearLogs={() => setLogs([])}
                  lastActivationTime={lastActivationTime}
                  lastStatusChangeTime={lastStatusChangeTime}
                  recoveryCount={recoveryCount}
                  isFrameless={isFrameless}
                  onToggleFrameless={() => setIsFrameless(!isFrameless)}
                />
              </div>

              {/* Right Column: Hardware Simulator Deck */}
              <div className={`lg:col-span-7 space-y-5 w-full ${
                mobileSubTab === 'app' ? 'hidden lg:block' : 'block'
              }`}>
                <HardwareControlDeck
                  onAttachDevice={handleAttachDevice}
                  onDetachDevices={handleDetachDevices}
                  onAdvanceTimer={handleAdvanceTimer}
                  onTriggerTimeout={() => {
                    triggerTimeoutHandling();
                    setSecondsRemaining(600);
                  }}
                  onSimulateReboot={handleSimulateReboot}
                  connectedDevices={connectedDevices}
                  secondsRemaining={secondsRemaining}
                  hasWriteSecureSettings={hasWriteSecureSettings}
                  onToggleWriteSecureSettings={() => setHasWriteSecureSettings(!hasWriteSecureSettings)}
                  isAccessibilityActive={isAccessibilityActive}
                  onToggleAccessibility={() => setIsAccessibilityActive(!isAccessibilityActive)}
                />

                {/* Technical Strategy Overview Card */}
                <div className="p-4 sm:p-5 bg-[#0b101d] rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                    <h3 className="text-sm font-bold text-white">How OTG Guardian Defeats the 10-Minute Timeout</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
                    <div className="p-3 bg-[#0e1628] rounded-xl border border-slate-800/80">
                      <span className="font-bold text-cyan-300 block mb-0.5">1. Accessibility Auto-Assist</span>
                      When the 10-minute timer runs out, the watchdog launches OxygenOS OTG settings. The accessibility service toggles the switch and returns in &lt;500ms.
                    </div>
                    <div className="p-3 bg-[#0e1628] rounded-xl border border-slate-800/80">
                      <span className="font-bold text-blue-300 block mb-0.5">2. Direct ADB Elevation</span>
                      If granted <code className="text-cyan-300 font-mono">WRITE_SECURE_SETTINGS</code> once, the app updates <code className="text-cyan-300 font-mono">Settings.Global</code> directly in background.
                    </div>
                    <div className="p-3 bg-[#0e1628] rounded-xl border border-slate-800/80">
                      <span className="font-bold text-emerald-300 block mb-0.5">3. USB Host Current Shield</span>
                      Connecting any active USB peripheral (flash drive, wireless dongle, or DAC) resets the kernel inactivity timer automatically.
                    </div>
                    <div className="p-3 bg-[#0e1628] rounded-xl border border-slate-800/80">
                      <span className="font-bold text-amber-300 block mb-0.5">4. Quick Settings Tile</span>
                      Adds an &quot;OTG Guard&quot; tile in Android status pull-down for instant 1-tap toggling without opening Settings.
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Technical Audit View */}
        {activeMainTab === 'audit' && (
          <div className="max-w-5xl mx-auto">
            <OxygenOsAuditMatrix />
          </div>
        )}

        {/* Source Code View */}
        {activeMainTab === 'code' && (
          <div className="max-w-6xl mx-auto">
            <ProjectCodeExplorer />
          </div>
        )}

        {/* ADB & Testing View */}
        {activeMainTab === 'adb' && (
          <div className="max-w-5xl mx-auto">
            <AdbTerminalHelper />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#060913] py-3.5 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-1.5">
          <span>OTG Guardian • OnePlus Nord CE 2 Lite 5G Native Utility</span>
          <span className="font-mono text-[11px] text-cyan-500/80">CPH2381 • OxygenOS 14.0 (API 34)</span>
        </div>
      </footer>
    </div>
  );
}
