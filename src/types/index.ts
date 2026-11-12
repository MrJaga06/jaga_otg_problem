export type OtgState = 'ON' | 'OFF' | 'UNKNOWN';

export type RecoveryMode = 'ACCESSIBILITY_AUTO' | 'DIRECT_SECURE_SETTINGS' | 'INTERACTIVE_NOTIFICATION';

export interface SimulatedUsbDevice {
  id: string;
  deviceName: string;
  manufacturerName: string;
  productName: string;
  vendorId: number;
  productId: number;
  deviceClass: number;
  deviceClassLabel: string;
  connectedAt: Date;
}

export interface SimulatedLogEvent {
  id: string;
  timestamp: Date;
  eventType: 'OTG_STATE_CHANGE' | 'USB_CONNECTED' | 'USB_DISCONNECTED' | 'RECOVERY_TRIGGERED' | 'RECOVERY_SUCCESS' | 'RECOVERY_FAILED' | 'SERVICE_STARTED' | 'SERVICE_STOPPED' | 'TIMEOUT_WATCHDOG';
  title: string;
  description: string;
  isSuccess: boolean;
}

export interface AndroidFileRecord {
  path: string;
  filename: string;
  language: string;
  category: 'config' | 'manifest' | 'kotlin' | 'res';
  description: string;
  content: string;
}
