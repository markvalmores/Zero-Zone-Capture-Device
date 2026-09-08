export type ConsoleType =
  | 'auto'
  | 'ps5'
  | 'ps4'
  | 'xbox_series'
  | 'xbox_one'
  | 'switch'
  | 'switch_2'
  | 'ios_mirror'
  | 'android_mirror'
  | 'type_c_otg'
  | 'hdmi_grabber';

export type CaptureSourceMode = 'device' | 'remote_play_screen' | 'network_ip';

export type NetworkStreamType = 'mjpeg' | 'video' | 'demo' | 'auto';

export interface NetworkStreamConfig {
  ip: string;
  port: string;
  protocol: 'http' | 'https' | 'ws' | 'wss';
  path: string;
  streamType: NetworkStreamType;
  targetFps: number;
  autoReconnect: boolean;
  lowLatencyBuffer: boolean;
  audioEnabled: boolean;
  audioPort?: string;
  audioPath?: string;
  presetApp: 'screen_stream' | 'ip_webcam' | 'droidcam' | 'vlc_obs' | 'custom' | 'demo';
}

export interface NetworkAppPreset {
  id: NetworkStreamConfig['presetApp'];
  name: string;
  defaultPort: string;
  defaultPath: string;
  streamType: NetworkStreamType;
  audioSupported: boolean;
  defaultAudioPath?: string;
  description: string;
  badge: string;
}

export type ResolutionPresetKey =
  | '4k60'
  | '1440p144'
  | '1440p120'
  | '1440p60'
  | '1080p144'
  | '1080p120'
  | '1080p60'
  | '720p144'
  | '720p60'
  | 'auto_highest';

export interface ResolutionConfig {
  id: ResolutionPresetKey;
  label: string;
  width: number;
  height: number;
  frameRate: number;
  category: string;
  recommendedFor?: string[];
  aspectRatio: string;
}

export type FilterPresetKey =
  | 'original'
  | 'bright'
  | 'device_quality'
  | 'shadowed'
  | 'more_lighting'
  | 'vibrant_console'
  | 'esports_clarity'
  | 'hdr_boost'
  | 'custom';

export interface CustomFilterSettings {
  brightness: number; // default 100%
  contrast: number; // default 100%
  saturate: number; // default 100%
  hueRotate: number; // default 0deg
  sharpness: number; // default 0%
  gamma: number; // default 1.0
}

export interface ConsoleProfileInfo {
  id: ConsoleType;
  name: string;
  shortName: string;
  category: 'playstation' | 'xbox' | 'nintendo' | 'mobile' | 'hardware' | 'auto';
  badgeColor: string;
  icon: string;
  description: string;
  defaultPreset: ResolutionPresetKey;
  supportedPresets: ResolutionPresetKey[];
  recommendedFilter: FilterPresetKey;
  remotePlayInstructions: string;
  hardwareGuide: string;
  audioFeatures: string[];
}

export interface DetectedDevice {
  deviceId: string;
  label: string;
  kind: 'videoinput' | 'audioinput';
  groupId: string;
  isLikelyCaptureCard: boolean;
  isTypeCOTG: boolean;
  isHDMI: boolean;
  detectedBrand?: string;
  supportedMaxRes?: string;
}

export interface LatencyDiagnosticData {
  frameToDisplayDelayMs: number;
  captureBufferDelayMs: number;
  decodeDelayMs: number;
  renderDelayMs: number;
  jitterMs: number;
  fpsStabilityPct: number;
  latencyGrade: 'EXCELLENT (E-SPORTS)' | 'OPTIMAL' | 'MODERATE' | 'BUFFERING';
  latencyHistory: number[]; // Array of last 24 ms values for the mini oscilloscope
}

export interface PerformanceSettings {
  showFpsOverlay: boolean; // default false
  showLatencyDiagnostic: boolean; // default false
  rtxLowLatency: boolean; // default true
  frameGeneration: boolean; // default false (RTX motion interpolator)
  autoSmoothViewing: boolean; // default true
  perfectRatioLock: boolean; // default true
}

export interface StreamTelemetry {
  actualWidth: number;
  actualHeight: number;
  actualFps: number;
  targetFps: number;
  estimatedBitrateMbps: number;
  droppedFrames: number;
  totalFrames: number;
  estimatedLatencyMs: number;
  colorSpace: string;
  aspectRatio: string;
  audioLevelLeft: number;
  audioLevelRight: number;
  audioActive: boolean;
  lowLatencyMode: boolean;
  signalLocked: boolean;
  latencyDiagnostic: LatencyDiagnosticData;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  durationSeconds: number;
  recordedBytes: number;
  format: 'video/webm' | 'video/mp4';
  bitrateMbps: number;
}
