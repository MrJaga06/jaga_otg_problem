import React from 'react';
import {
  Usb,
  PowerOff,
  FastForward,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { SimulatedUsbDevice } from '../types';

interface HardwareControlDeckProps {
  onAttachDevice: (device: Omit<SimulatedUsbDevice, 'id' | 'connectedAt'>) => void;
  onDetachDevices: () => void;
  onAdvanceTimer: () => void;
  onTriggerTimeout: () => void;
  onSimulateReboot: () => void;
  connectedDevices: SimulatedUsbDevice[];
  secondsRemaining: number;
  hasWriteSecureSettings: boolean;
  onToggleWriteSecureSettings: () => void;
  isAccessibilityActive: boolean;
  onToggleAccessibility: () => void;
}

export const HardwareControlDeck: React.FC<HardwareControlDeckProps> = ({
  onAttachDevice,
  onDetachDevices,
  onAdvanceTimer,
  onTriggerTimeout,
  onSimulateReboot,
  connectedDevices,
  secondsRemaining,
  hasWriteSecureSettings,
  onToggleWriteSecureSettings,
  isAccessibilityActive,
  onToggleAccessibility
}) => {
  return (
    <div className="bg-[#0b101d] border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-4 sm:space-y-5">
      {/* Target Device Hardware Spec Badge */}
      <div className="p-3 sm:p-3.5 bg-[#0e1628] rounded-xl border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-white truncate">OnePlus Nord CE 2 Lite 5G</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 shrink-0">
                CPH2381
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono truncate">
              OxygenOS 14.0 • Android 14 API 34 • 600s Power Gate
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right flex sm:block items-center justify-between border-t sm:border-t-0 pt-1.5 sm:pt-0 border-slate-800">
          <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 block">Kernel Power Gate</span>
          <span className="text-[11px] sm:text-xs font-mono font-bold text-amber-400">10m Inactivity Limit</span>
        </div>
      </div>

      {/* Hardware Simulation Controls */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-bold tracking-wider uppercase text-slate-300 flex items-center gap-1.5">
            <Usb className="w-3.5 h-3.5 text-cyan-400" />
            <span>Simulate USB Hardware Attachments</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">
            Status: {connectedDevices.length > 0 ? `${connectedDevices.length} Connected` : 'Bus Idle'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Preset 1: Flash Drive */}
          <button
            onClick={() => onAttachDevice({
              deviceName: 'sda1',
              manufacturerName: 'SanDisk',
              productName: 'Ultra Luxe USB 3.1 Flash Drive',
              vendorId: 0x0781,
              productId: 0x5583,
              deviceClass: 8,
              deviceClassLabel: 'Mass Storage (Flash Drive)'
            })}
            className="p-3 bg-[#0e1628] hover:bg-[#142038] active:scale-[0.98] border border-slate-700/80 hover:border-cyan-500/40 rounded-xl text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white group-hover:text-cyan-300">SanDisk Flash Drive</span>
              <span className="text-[9px] font-mono text-cyan-400">0x0781</span>
            </div>
            <p className="text-[10px] text-slate-400">Mass storage • Resets 10m timer</p>
          </button>

          {/* Preset 2: USB Mouse / Keyboard */}
          <button
            onClick={() => onAttachDevice({
              deviceName: 'hidraw0',
              manufacturerName: 'Logitech',
              productName: 'G305 Lightspeed Wireless Receiver',
              vendorId: 0x046d,
              productId: 0xc53f,
              deviceClass: 3,
              deviceClassLabel: 'HID (Mouse / Keyboard)'
            })}
            className="p-3 bg-[#0e1628] hover:bg-[#142038] active:scale-[0.98] border border-slate-700/80 hover:border-cyan-500/40 rounded-xl text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white group-hover:text-cyan-300">Logitech Receiver</span>
              <span className="text-[9px] font-mono text-cyan-400">0x046D</span>
            </div>
            <p className="text-[10px] text-slate-400">HID device • Continuous VBUS</p>
          </button>

          {/* Preset 3: Audio DAC */}
          <button
            onClick={() => onAttachDevice({
              deviceName: 'snd_card1',
              manufacturerName: 'FiiO',
              productName: 'FiiO KA3 High-Res Audio DAC',
              vendorId: 0x2972,
              productId: 0x0047,
              deviceClass: 1,
              deviceClassLabel: 'Audio (DAC / Amplifier)'
            })}
            className="p-3 bg-[#0e1628] hover:bg-[#142038] active:scale-[0.98] border border-slate-700/80 hover:border-cyan-500/40 rounded-xl text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white group-hover:text-cyan-300">FiiO Audio DAC</span>
              <span className="text-[9px] font-mono text-cyan-400">0x2972</span>
            </div>
            <p className="text-[10px] text-slate-400">Audio class • Constant draw</p>
          </button>
        </div>

        {/* Detach button */}
        {connectedDevices.length > 0 && (
          <button
            onClick={onDetachDevices}
            className="w-full mt-2.5 py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
          >
            <PowerOff className="w-3.5 h-3.5" />
            <span>Unplug All USB Peripherals (Starts 10m OxygenOS Timeout Countdown)</span>
          </button>
        )}
      </div>

      {/* Inactivity Watchdog Simulation Controls */}
      <div className="pt-3 border-t border-slate-800">
        <h3 className="text-xs font-bold tracking-wider uppercase text-slate-300 mb-2.5 flex items-center gap-1.5">
          <FastForward className="w-3.5 h-3.5 text-amber-400" />
          <span>OxygenOS 10-Minute Timeout Watchdog Testing</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={onAdvanceTimer}
            className="p-3 bg-[#0e1628] hover:bg-[#142038] border border-slate-700/80 rounded-xl text-left transition-all flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-bold text-white block">Fast-Forward to 9m 50s</span>
              <span className="text-[10px] text-slate-400">Leave only 10s on countdown</span>
            </div>
            <FastForward className="w-4 h-4 text-amber-400" />
          </button>

          <button
            onClick={onTriggerTimeout}
            className="p-3 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/30 rounded-xl text-left transition-all flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-bold text-rose-300 block">Trigger 10m Timeout Event</span>
              <span className="text-[10px] text-rose-400/80">Simulates kernel turning OTG OFF</span>
            </div>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </button>
        </div>
      </div>

      {/* System Privileges & Reboot Deck */}
      <div className="pt-3 border-t border-slate-800">
        <h3 className="text-xs font-bold tracking-wider uppercase text-slate-300 mb-2.5 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>Privilege &amp; Lifecycle Toggles</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* ADB Permission Toggle */}
          <button
            onClick={onToggleWriteSecureSettings}
            className={`p-3 rounded-xl border text-left transition-all ${
              hasWriteSecureSettings
                ? 'bg-emerald-950/20 border-emerald-500/40'
                : 'bg-[#0e1628] border-slate-700/80'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">ADB Secure Settings</span>
              <span className={`text-[9px] font-mono px-1 py-0.5 rounded ${
                hasWriteSecureSettings ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {hasWriteSecureSettings ? 'GRANTED' : 'REVOKED'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">WRITE_SECURE_SETTINGS direct toggle</p>
          </button>

          {/* Accessibility Service Toggle */}
          <button
            onClick={onToggleAccessibility}
            className={`p-3 rounded-xl border text-left transition-all ${
              isAccessibilityActive
                ? 'bg-cyan-950/20 border-cyan-500/40'
                : 'bg-[#0e1628] border-slate-700/80'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">Accessibility Service</span>
              <span className={`text-[9px] font-mono px-1 py-0.5 rounded ${
                isAccessibilityActive ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {isAccessibilityActive ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">OxygenOS Settings auto-click helper</p>
          </button>

          {/* Phone Reboot Simulation */}
          <button
            onClick={onSimulateReboot}
            className="p-3 bg-[#0e1628] hover:bg-[#142038] border border-slate-700/80 rounded-xl text-left transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">Phone Restart</span>
              <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <p className="text-[10px] text-slate-400">Triggers BOOT_COMPLETED receiver</p>
          </button>
        </div>
      </div>
    </div>
  );
};
