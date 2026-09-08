import React, { useState } from 'react';
import {
  Activity,
  Camera,
  Cast,
  Cpu,
  Eye,
  Flame,
  Gamepad2,
  Gauge,
  HardDrive,
  Headphones,
  Maximize2,
  Mic,
  Monitor,
  Radio,
  RefreshCw,
  Sliders,
  Smartphone,
  Sparkles,
  Tv,
  Usb,
  Video,
  Volume2,
  VolumeX,
  Zap,
  Disc,
  StopCircle,
  Layers,
  Wifi,
} from 'lucide-react';
import {
  CaptureSourceMode,
  ConsoleType,
  CustomFilterSettings,
  DetectedDevice,
  FilterPresetKey,
  NetworkStreamConfig,
  PerformanceSettings,
  RecordingState,
  ResolutionPresetKey,
  StreamTelemetry,
} from '../types';
import {
  CONSOLE_PROFILES,
  DEFAULT_CUSTOM_FILTERS,
  FILTER_PRESETS,
  RESOLUTION_PRESETS,
} from '../constants/presets';
import { IpMirrorPanel } from './IpMirrorPanel';

interface SidebarProps {
  selectedConsole: ConsoleType;
  onSelectConsole: (consoleType: ConsoleType) => void;
  videoDevices: DetectedDevice[];
  audioDevices: DetectedDevice[];
  selectedVideoDeviceId: string;
  onSelectVideoDevice: (deviceId: string) => void;
  selectedAudioDeviceId: string;
  onSelectAudioDevice: (deviceId: string) => void;
  selectedPreset: ResolutionPresetKey;
  onSelectPreset: (preset: ResolutionPresetKey) => void;
  activeFilter: FilterPresetKey;
  onSelectFilter: (filterKey: FilterPresetKey) => void;
  customFilterSettings: CustomFilterSettings;
  onChangeCustomFilter: (settings: CustomFilterSettings) => void;
  performanceSettings: PerformanceSettings;
  onUpdatePerformanceSettings: (settings: Partial<PerformanceSettings>) => void;
  isActive: boolean;
  isLoading: boolean;
  sourceMode: CaptureSourceMode;
  networkConfig: NetworkStreamConfig;
  onChangeNetworkConfig: (config: Partial<NetworkStreamConfig>) => void;
  onStartNetworkCapture: (config: NetworkStreamConfig) => void;
  onStartDeviceCapture: () => void;
  onStartRemotePlayCapture: () => void;
  onStopStream: () => void;
  onCaptureSnapshot: () => void;
  recordingState: RecordingState;
  onStartRecording: (bitrateMbps?: number) => void;
  onStopRecording: () => void;
  // Audio
  isAudioMuted: boolean;
  onToggleAudioMute: () => void;
  audioVolume: number;
  onChangeAudioVolume: (val: number) => void;
  audioDelayMs: number;
  onChangeAudioDelay: (val: number) => void;
  vuLevels: { left: number; right: number };
  isAudioActive: boolean;
  // Scanner
  onRescan: () => void;
  isScanning: boolean;
  telemetry: StreamTelemetry;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedConsole,
  onSelectConsole,
  videoDevices,
  audioDevices,
  selectedVideoDeviceId,
  onSelectVideoDevice,
  selectedAudioDeviceId,
  onSelectAudioDevice,
  selectedPreset,
  onSelectPreset,
  activeFilter,
  onSelectFilter,
  customFilterSettings,
  onChangeCustomFilter,
  performanceSettings,
  onUpdatePerformanceSettings,
  isActive,
  isLoading,
  sourceMode,
  networkConfig,
  onChangeNetworkConfig,
  onStartNetworkCapture,
  onStartDeviceCapture,
  onStartRemotePlayCapture,
  onStopStream,
  onCaptureSnapshot,
  recordingState,
  onStartRecording,
  onStopRecording,
  isAudioMuted,
  onToggleAudioMute,
  audioVolume,
  onChangeAudioVolume,
  audioDelayMs,
  onChangeAudioDelay,
  vuLevels,
  isAudioActive,
  onRescan,
  isScanning,
  telemetry,
}) => {
  const [activeTab, setActiveTab] = useState<'capture' | 'ip_mirror' | 'filters' | 'performance' | 'audio' | 'record'>('capture');
  const [recBitrate, setRecBitrate] = useState<number>(25);

  const currentConsole = CONSOLE_PROFILES[selectedConsole] || CONSOLE_PROFILES['auto'];

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <aside className="w-full md:w-[350px] xl:w-[390px] bg-[#0f0f0f] border-r border-[#202020] flex flex-col h-full overflow-hidden select-none flex-shrink-0">
      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-[#222] bg-[#121212] p-1 gap-1 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('capture')}
          className={`flex-1 py-1.5 px-1.5 text-[9px] font-bold font-mono tracking-wider rounded transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
            activeTab === 'capture'
              ? 'bg-[#1e1e1e] text-[#00ffcc] border border-[#333] shadow-sm'
              : 'text-[#888] hover:text-[#bbb] hover:bg-[#181818]'
          }`}
        >
          <Gamepad2 size={11} />
          <span>DEVICE</span>
        </button>

        <button
          onClick={() => setActiveTab('ip_mirror')}
          className={`flex-1 py-1.5 px-1.5 text-[9px] font-bold font-mono tracking-wider rounded transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
            activeTab === 'ip_mirror'
              ? 'bg-[#1e1e1e] text-[#00ffcc] border border-[#00ffcc44] shadow-sm'
              : 'text-[#888] hover:text-[#bbb] hover:bg-[#181818]'
          }`}
        >
          <Wifi size={11} className={sourceMode === 'network_ip' && isActive ? 'text-[#00ffcc] animate-pulse' : ''} />
          <span>IP MIRROR</span>
        </button>

        <button
          onClick={() => setActiveTab('performance')}
          className={`flex-1 py-1.5 px-1.5 text-[9px] font-bold font-mono tracking-wider rounded transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
            activeTab === 'performance'
              ? 'bg-[#1e1e1e] text-[#00ffcc] border border-[#333] shadow-sm'
              : 'text-[#888] hover:text-[#bbb] hover:bg-[#181818]'
          }`}
        >
          <Gauge size={11} />
          <span>RTX & LATENCY</span>
        </button>

        <button
          onClick={() => setActiveTab('filters')}
          className={`flex-1 py-1.5 px-1.5 text-[9px] font-bold font-mono tracking-wider rounded transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
            activeTab === 'filters'
              ? 'bg-[#1e1e1e] text-[#00ffcc] border border-[#333] shadow-sm'
              : 'text-[#888] hover:text-[#bbb] hover:bg-[#181818]'
          }`}
        >
          <Sliders size={11} />
          <span>FILTERS</span>
        </button>

        <button
          onClick={() => setActiveTab('audio')}
          className={`flex-1 py-1.5 px-1.5 text-[9px] font-bold font-mono tracking-wider rounded transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
            activeTab === 'audio'
              ? 'bg-[#1e1e1e] text-[#00ffcc] border border-[#333] shadow-sm'
              : 'text-[#888] hover:text-[#bbb] hover:bg-[#181818]'
          }`}
        >
          <Headphones size={11} />
          <span>AUDIO</span>
        </button>

        <button
          onClick={() => setActiveTab('record')}
          className={`flex-1 py-1.5 px-1.5 text-[9px] font-bold font-mono tracking-wider rounded transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
            activeTab === 'record'
              ? 'bg-[#1e1e1e] text-[#ff3366] border border-[#333] shadow-sm'
              : 'text-[#888] hover:text-[#bbb] hover:bg-[#181818]'
          }`}
        >
          <Disc size={11} />
          <span>REC</span>
        </button>
      </div>

      {/* Main Tab Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 custom-scrollbar text-[#ccc]">
        {/* ================= TAB 1: CONSOLE & HARDWARE SETUP ================= */}
        {activeTab === 'capture' && (
          <>
            {/* Console Profiles Selection Grid */}
            <section className="bg-[#141414] p-3 rounded-lg border border-[#242424]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-[#777] tracking-wider font-mono flex items-center gap-1.5">
                  <Gamepad2 size={12} className="text-[#00ffcc]" />
                  SELECT CONSOLE / MOBILE MIRROR
                </span>
                <span className="text-[9px] font-mono text-[#00ffcc] bg-[#00ffcc15] px-1.5 py-0.5 rounded border border-[#00ffcc30]">
                  {currentConsole.shortName}
                </span>
              </div>

              {/* Console Profile Buttons */}
              <div className="grid grid-cols-3 gap-1.5">
                {(Object.keys(CONSOLE_PROFILES) as ConsoleType[]).map((cKey) => {
                  const p = CONSOLE_PROFILES[cKey];
                  const isSelected = selectedConsole === cKey;
                  return (
                    <button
                      key={cKey}
                      onClick={() => onSelectConsole(cKey)}
                      className={`p-2 rounded text-left transition-all border flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#1a2523] border-[#00ffcc] shadow-[0_0_8px_rgba(0,255,204,0.2)]'
                          : 'bg-[#181818] border-[#2a2a2a] hover:bg-[#202020] hover:border-[#383838]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: p.badgeColor }}
                        />
                        <span className="text-[7.5px] font-mono text-[#666] uppercase">
                          {p.category}
                        </span>
                      </div>
                      <span
                        className={`text-[9.5px] font-bold font-mono truncate leading-tight ${
                          isSelected ? 'text-[#00ffcc]' : 'text-white'
                        }`}
                      >
                        {p.shortName}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Console Info Note */}
              <div className="mt-2.5 p-2 bg-[#181818] rounded border border-[#2a2a2a] text-[10px] text-[#888] font-mono leading-relaxed">
                <span className="text-white font-semibold">{currentConsole.name}: </span>
                {currentConsole.description}
              </div>
            </section>

            {/* Video Capture Device Detector & Selector */}
            <section className="bg-[#141414] p-3 rounded-lg border border-[#242424]">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] uppercase font-bold text-[#777] tracking-wider font-mono flex items-center gap-1.5">
                  <Usb size={12} className="text-[#00ffcc]" />
                  VIDEO CAPTURE DEVICE
                </label>
                <button
                  onClick={onRescan}
                  disabled={isScanning}
                  className="text-[9px] font-mono text-[#888] hover:text-[#00ffcc] flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={10} className={isScanning ? 'animate-spin' : ''} />
                  SCAN
                </button>
              </div>

              <div className="space-y-1.5">
                <select
                  value={selectedVideoDeviceId}
                  onChange={(e) => onSelectVideoDevice(e.target.value)}
                  className="w-full bg-[#181818] text-xs font-mono font-medium text-[#00ffcc] p-2 rounded border border-[#333] focus:border-[#00ffcc] focus:outline-none cursor-pointer"
                >
                  <option value="">-- Select or Auto-Detect Video Input --</option>
                  {videoDevices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.isLikelyCaptureCard ? '🎮 [CAPTURE] ' : d.isTypeCOTG ? '⚡ [OTG] ' : '📹 '}
                      {d.label || `Device ${d.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>

                <div className="flex items-center justify-between text-[9px] font-mono text-[#777] bg-[#101010] p-1.5 rounded border border-[#222]">
                  <span>PLUGGED HARDWARE:</span>
                  <span className="text-[#00ffcc]">
                    {videoDevices.length} Video / {audioDevices.length} Audio Detected
                  </span>
                </div>
              </div>
            </section>

            {/* Resolution & Refresh Rate Presets */}
            <section className="bg-[#141414] p-3 rounded-lg border border-[#242424]">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] uppercase font-bold text-[#777] tracking-wider font-mono flex items-center gap-1.5">
                  <Tv size={12} className="text-[#00ffcc]" />
                  RESOLUTION & REFRESH RATE
                </label>
                <span className="text-[9px] font-mono text-[#888]">
                  {RESOLUTION_PRESETS[selectedPreset]?.category || 'Standard'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(RESOLUTION_PRESETS) as ResolutionPresetKey[]).map((rKey) => {
                  const cfg = RESOLUTION_PRESETS[rKey];
                  const isSelected = selectedPreset === rKey;
                  const isRec = cfg.recommendedFor?.includes(selectedConsole);

                  return (
                    <button
                      key={rKey}
                      onClick={() => onSelectPreset(rKey)}
                      className={`p-2 rounded text-left border font-mono transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#00ffcc18] text-[#00ffcc] border-[#00ffcc] shadow-[0_0_8px_rgba(0,255,204,0.2)]'
                          : 'bg-[#181818] text-[#999] border-[#2a2a2a] hover:bg-[#202020] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-bold">{cfg.label.split('(')[0]}</span>
                        {isRec && (
                          <span className="text-[7.5px] bg-[#00ffcc22] text-[#00ffcc] px-1 py-0.2 rounded font-bold">
                            REC
                          </span>
                        )}
                      </div>
                      <span className="text-[8.5px] text-[#666]">
                        {cfg.width}x{cfg.height} • {cfg.frameRate} FPS
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Primary Action Buttons */}
            <div className="space-y-2 pt-1 font-mono">
              {!isActive ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={onStartDeviceCapture}
                    disabled={isLoading}
                    className="w-full bg-[#00ffcc] hover:bg-[#00e6b8] text-black text-xs font-black py-2.5 px-3 rounded shadow-[0_0_12px_rgba(0,255,204,0.3)] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Zap size={14} />
                    <span>{isLoading ? 'INITIALIZING...' : 'START CAPTURE'}</span>
                  </button>

                  <button
                    onClick={onStartRemotePlayCapture}
                    disabled={isLoading}
                    className="w-full bg-[#181818] hover:bg-[#252525] text-white border border-[#333] hover:border-[#00ffcc] text-xs font-bold py-2.5 px-3 rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Cast size={14} className="text-[#00ffcc]" />
                    <span>
                      {selectedConsole.includes('mirror') ? 'SCREEN MIRROR (144Hz)' : 'REMOTE PLAY'}
                    </span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={onStopStream}
                    className="w-full bg-[#ff3366] hover:bg-[#e62e5c] text-white text-xs font-bold py-2.5 px-3 rounded shadow-[0_0_10px_rgba(255,51,102,0.3)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <StopCircle size={14} />
                    <span>STOP STREAM</span>
                  </button>

                  <button
                    onClick={onStartRemotePlayCapture}
                    className="w-full bg-[#1e1e1e] hover:bg-[#282828] text-[#ddd] border border-[#333] text-xs font-bold py-2.5 px-3 rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Cast size={14} className="text-[#00ffcc]" />
                    <span>SWITCH TO MIRROR</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ================= TAB: IP & PORT SCREEN MIRROR ================= */}
        {activeTab === 'ip_mirror' && (
          <IpMirrorPanel
            config={networkConfig}
            onChangeConfig={onChangeNetworkConfig}
            onStartStream={onStartNetworkCapture}
            onStopStream={onStopStream}
            isActive={isActive && sourceMode === 'network_ip'}
            isLoading={isLoading}
          />
        )}

        {/* ================= TAB 2: RTX PERFORMANCE & LATENCY ================= */}
        {activeTab === 'performance' && (
          <div className="space-y-4 font-mono">
            {/* Latency Diagnostic Overlay Trigger */}
            <section className="bg-[#141414] p-3.5 rounded-lg border border-[#242424] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#777] tracking-wider flex items-center gap-1.5">
                  <Gauge size={13} className="text-[#00ffcc]" />
                  REAL-TIME LATENCY DIAGNOSTIC
                </span>
                <span className="text-[9px] text-[#00ffcc] font-bold">
                  {telemetry.latencyDiagnostic.frameToDisplayDelayMs.toFixed(1)} ms
                </span>
              </div>

              <p className="text-[10px] text-[#888] leading-relaxed">
                Displays live frame-to-display delay in milliseconds, pipeline stage breakdowns, jitter metrics, and oscilloscope graphs.
              </p>

              <button
                onClick={() =>
                  onUpdatePerformanceSettings({
                    showLatencyDiagnostic: !performanceSettings.showLatencyDiagnostic,
                  })
                }
                className={`w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  performanceSettings.showLatencyDiagnostic
                    ? 'bg-[#00ffcc] text-black shadow-[0_0_12px_rgba(0,255,204,0.3)]'
                    : 'bg-[#1c1c1c] text-[#ccc] border border-[#333] hover:border-[#00ffcc]'
                }`}
              >
                <Gauge size={14} />
                <span>
                  {performanceSettings.showLatencyDiagnostic
                    ? 'HIDE LATENCY DIAGNOSTIC OVERLAY'
                    : 'ACTIVATE LATENCY DIAGNOSTIC OVERLAY'}
                </span>
              </button>
            </section>

            {/* FPS Display Toggle (Default OFF) */}
            <section className="bg-[#141414] p-3 rounded-lg border border-[#242424]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-white block">
                    ON-SCREEN FPS DISPLAY
                  </span>
                  <span className="text-[8.5px] text-[#777]">
                    Shows live frame rate counter on video player (Default: OFF)
                  </span>
                </div>
                <button
                  onClick={() =>
                    onUpdatePerformanceSettings({
                      showFpsOverlay: !performanceSettings.showFpsOverlay,
                    })
                  }
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    performanceSettings.showFpsOverlay
                      ? 'bg-[#ffcc00] text-black font-black'
                      : 'bg-[#222] text-[#888]'
                  }`}
                >
                  {performanceSettings.showFpsOverlay ? 'SHOWING (ON)' : 'HIDDEN (OFF)'}
                </button>
              </div>
            </section>

            {/* RTX Ultra-Low Latency Mode */}
            <section className="bg-[#141414] p-3 rounded-lg border border-[#242424] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap size={14} className={performanceSettings.rtxLowLatency ? 'text-[#00ffcc]' : 'text-[#666]'} />
                  <div>
                    <span className="text-[10px] font-bold text-white block">
                      RTX ZERO-LATENCY MODE
                    </span>
                    <span className="text-[8.5px] text-[#777]">
                      GPU Queue=0 • Direct Hardware Composite
                    </span>
                  </div>
                </div>
                <button
                  onClick={() =>
                    onUpdatePerformanceSettings({
                      rtxLowLatency: !performanceSettings.rtxLowLatency,
                    })
                  }
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                    performanceSettings.rtxLowLatency
                      ? 'bg-[#00ffcc] text-black font-black shadow-[0_0_8px_rgba(0,255,204,0.3)]'
                      : 'bg-[#222] text-[#888]'
                  }`}
                >
                  {performanceSettings.rtxLowLatency ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </section>

            {/* Frame Generation & Auto Smooth Viewing */}
            <section className="bg-[#141414] p-3 rounded-lg border border-[#242424] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className={performanceSettings.frameGeneration ? 'text-[#ff9900]' : 'text-[#666]'} />
                  <div>
                    <span className="text-[10px] font-bold text-white block">
                      144 FPS FRAME GENERATION
                    </span>
                    <span className="text-[8.5px] text-[#777]">
                      Optical Flow Cadence Smoothing
                    </span>
                  </div>
                </div>
                <button
                  onClick={() =>
                    onUpdatePerformanceSettings({
                      frameGeneration: !performanceSettings.frameGeneration,
                    })
                  }
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                    performanceSettings.frameGeneration
                      ? 'bg-[#ff9900] text-black font-black shadow-[0_0_8px_rgba(255,153,0,0.3)]'
                      : 'bg-[#222] text-[#888]'
                  }`}
                >
                  {performanceSettings.frameGeneration ? 'ON (144Hz)' : 'OFF'}
                </button>
              </div>
            </section>

            {/* Perfect Ratio Lock (No Warping for iOS/Android mirrors) */}
            <section className="bg-[#141414] p-3 rounded-lg border border-[#242424]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-white block">
                    PERFECT RATIO LOCK
                  </span>
                  <span className="text-[8.5px] text-[#777]">
                    Prevents stretching for 19.5:9, 20:9 & 4:3 mobile mirrors
                  </span>
                </div>
                <button
                  onClick={() =>
                    onUpdatePerformanceSettings({
                      perfectRatioLock: !performanceSettings.perfectRatioLock,
                    })
                  }
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                    performanceSettings.perfectRatioLock
                      ? 'bg-[#00ffcc22] text-[#00ffcc] border border-[#00ffcc44]'
                      : 'bg-[#222] text-[#888]'
                  }`}
                >
                  {performanceSettings.perfectRatioLock ? 'LOCKED' : 'UNLOCKED'}
                </button>
              </div>
            </section>
          </div>
        )}

        {/* ================= TAB 3: FILTERS & COLORIMETRY ================= */}
        {activeTab === 'filters' && (
          <div className="space-y-4">
            <section className="bg-[#141414] p-3 rounded-lg border border-[#242424]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-[#777] tracking-wider font-mono flex items-center gap-1.5">
                  <Sliders size={12} className="text-[#00ffcc]" />
                  POST-PROCESSING FILTERS
                </span>
                <span className="text-[9px] font-mono text-[#00ffcc]">
                  {FILTER_PRESETS[activeFilter]?.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(FILTER_PRESETS) as FilterPresetKey[]).map((fKey) => {
                  const filter = FILTER_PRESETS[fKey];
                  const isSelected = activeFilter === fKey;
                  return (
                    <button
                      key={fKey}
                      onClick={() => onSelectFilter(fKey)}
                      className={`p-2 rounded text-left border transition-all cursor-pointer flex flex-col justify-between font-mono ${
                        isSelected
                          ? 'bg-[#00ffcc18] text-[#00ffcc] border-[#00ffcc] shadow-[0_0_8px_rgba(0,255,204,0.2)]'
                          : 'bg-[#181818] text-[#888] border-[#2a2a2a] hover:bg-[#202020] hover:text-white'
                      }`}
                    >
                      <span className="text-[10px] font-bold">{filter.label}</span>
                      <span className="text-[8px] text-[#555] line-clamp-1 mt-0.5">
                        {filter.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Custom Sliders for Fine-Tuning */}
            <section className="bg-[#141414] p-3 rounded-lg border border-[#242424] space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#777] tracking-wider flex items-center gap-1.5">
                  <Sparkles size={12} className="text-[#00ffcc]" />
                  MANUAL COLORIMETRY SLIDERS
                </span>
                <button
                  onClick={() => onChangeCustomFilter(DEFAULT_CUSTOM_FILTERS)}
                  className="text-[9px] text-[#666] hover:text-[#00ffcc] cursor-pointer"
                >
                  RESET
                </button>
              </div>

              {/* Brightness */}
              <div>
                <div className="flex justify-between text-[9px] text-[#888] mb-1">
                  <span>BRIGHTNESS (LUMINANCE)</span>
                  <span className="text-[#00ffcc]">{customFilterSettings.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={customFilterSettings.brightness}
                  onChange={(e) => {
                    onSelectFilter('custom');
                    onChangeCustomFilter({
                      ...customFilterSettings,
                      brightness: Number(e.target.value),
                    });
                  }}
                  className="w-full accent-[#00ffcc] bg-[#222] h-1.5 rounded cursor-pointer"
                />
              </div>

              {/* Contrast */}
              <div>
                <div className="flex justify-between text-[9px] text-[#888] mb-1">
                  <span>CONTRAST (DYNAMIC RANGE)</span>
                  <span className="text-[#00ffcc]">{customFilterSettings.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={customFilterSettings.contrast}
                  onChange={(e) => {
                    onSelectFilter('custom');
                    onChangeCustomFilter({
                      ...customFilterSettings,
                      contrast: Number(e.target.value),
                    });
                  }}
                  className="w-full accent-[#00ffcc] bg-[#222] h-1.5 rounded cursor-pointer"
                />
              </div>

              {/* Saturation */}
              <div>
                <div className="flex justify-between text-[9px] text-[#888] mb-1">
                  <span>SATURATION (COLOR DEPTH)</span>
                  <span className="text-[#00ffcc]">{customFilterSettings.saturate}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="250"
                  value={customFilterSettings.saturate}
                  onChange={(e) => {
                    onSelectFilter('custom');
                    onChangeCustomFilter({
                      ...customFilterSettings,
                      saturate: Number(e.target.value),
                    });
                  }}
                  className="w-full accent-[#00ffcc] bg-[#222] h-1.5 rounded cursor-pointer"
                />
              </div>
            </section>
          </div>
        )}

        {/* ================= TAB 4: AUDIO MONITORING ================= */}
        {activeTab === 'audio' && (
          <div className="space-y-4 font-mono">
            {/* Audio Device Selection */}
            <section className="bg-[#141414] p-3 rounded-lg border border-[#242424]">
              <label className="text-[10px] uppercase font-bold text-[#777] tracking-wider mb-2 flex items-center gap-1.5">
                <Mic size={12} className="text-[#00ffcc]" />
                SCREEN MIRROR & CAPTURE AUDIO IN
              </label>
              <select
                value={selectedAudioDeviceId}
                onChange={(e) => onSelectAudioDevice(e.target.value)}
                className="w-full bg-[#181818] text-xs font-mono text-[#00ffcc] p-2 rounded border border-[#333] focus:border-[#00ffcc] focus:outline-none cursor-pointer"
              >
                <option value="">-- Default Digital System Audio Loopback --</option>
                {audioDevices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Audio In (${d.deviceId.slice(0, 8)})`}
                  </option>
                ))}
              </select>
            </section>

            {/* Live Stereo VU Meters */}
            <section className="bg-[#141414] p-3 rounded-lg border border-[#242424]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-[#777] tracking-wider flex items-center gap-1.5">
                  <Volume2 size={12} className="text-[#00ffcc]" />
                  STEREO VU PEAK METERS
                </span>
                <span
                  className={`text-[9px] ${
                    isAudioActive && !isAudioMuted ? 'text-[#00ffcc]' : 'text-[#666]'
                  }`}
                >
                  {isAudioMuted ? 'MUTED' : isAudioActive ? '48kHz STEREO ACTIVE' : 'STANDBY'}
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[8px] text-[#666] mb-0.5">
                    <span>LEFT (CH1)</span>
                    <span>{Math.round(vuLevels.left * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#222] rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-gradient-to-r from-[#00ffcc] via-[#ffcc00] to-[#ff3366] transition-all duration-75"
                      style={{ width: `${Math.min(100, vuLevels.left * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[8px] text-[#666] mb-0.5">
                    <span>RIGHT (CH2)</span>
                    <span>{Math.round(vuLevels.right * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#222] rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-gradient-to-r from-[#00ffcc] via-[#ffcc00] to-[#ff3366] transition-all duration-75"
                      style={{ width: `${Math.min(100, vuLevels.right * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Master Volume & Mute */}
            <section className="bg-[#141414] p-3 rounded-lg border border-[#242424] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#777] tracking-wider">
                  MONITOR VOLUME
                </span>
                <button
                  onClick={onToggleAudioMute}
                  className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer border ${
                    isAudioMuted
                      ? 'bg-[#ff336622] text-[#ff3366] border-[#ff3366]'
                      : 'bg-[#1e1e1e] text-[#aaa] border-[#333] hover:text-white'
                  }`}
                >
                  {isAudioMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                  <span>{isAudioMuted ? 'UNMUTE' : 'MUTE'}</span>
                </button>
              </div>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isAudioMuted ? 0 : audioVolume}
                onChange={(e) => onChangeAudioVolume(Number(e.target.value))}
                className="w-full accent-[#00ffcc] bg-[#222] h-1.5 rounded cursor-pointer"
              />

              <div className="pt-2 border-t border-[#222]">
                <div className="flex justify-between text-[9px] text-[#888] mb-1">
                  <span>AUDIO/VIDEO SYNC DELAY</span>
                  <span className="text-[#00ffcc]">+{audioDelayMs} ms</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="300"
                  step="10"
                  value={audioDelayMs}
                  onChange={(e) => onChangeAudioDelay(Number(e.target.value))}
                  className="w-full accent-[#00ffcc] bg-[#222] h-1.5 rounded cursor-pointer"
                />
              </div>
            </section>
          </div>
        )}

        {/* ================= TAB 5: RECORDING ================= */}
        {activeTab === 'record' && (
          <div className="space-y-4 font-mono">
            <section className="bg-[#141414] p-3 rounded-lg border border-[#242424]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-[#777] tracking-wider flex items-center gap-1.5">
                  <Camera size={12} className="text-[#00ffcc]" />
                  INSTANT FRAME SNAPSHOT
                </span>
                <span className="text-[9px] text-[#888]">
                  {telemetry.actualWidth || 1920}x{telemetry.actualHeight || 1080}
                </span>
              </div>
              <button
                onClick={onCaptureSnapshot}
                disabled={!isActive}
                className="w-full bg-[#1a1a1a] hover:bg-[#242424] text-white border border-[#333] hover:border-[#00ffcc] text-xs font-bold py-2 rounded transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Camera size={14} className="text-[#00ffcc]" />
                <span>SAVE LOSSLESS PNG SNAPSHOT</span>
              </button>
            </section>

            <section className="bg-[#141414] p-3 rounded-lg border border-[#242424] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#777] tracking-wider flex items-center gap-1.5">
                  <Disc size={12} className="text-[#ff3366]" />
                  HARDWARE VIDEO ENCODER
                </span>
                {recordingState.isRecording && (
                  <span className="flex items-center gap-1 text-[9px] text-[#ff3366] animate-pulse font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff3366]" />
                    REC {formatDuration(recordingState.durationSeconds)}
                  </span>
                )}
              </div>

              <div>
                <label className="text-[9px] uppercase text-[#888] block mb-1">
                  BITRATE TARGET
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[10, 25, 40, 50].map((mbps) => (
                    <button
                      key={mbps}
                      disabled={recordingState.isRecording}
                      onClick={() => setRecBitrate(mbps)}
                      className={`py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                        recBitrate === mbps
                          ? 'bg-[#ff336622] text-[#ff3366] border-[#ff3366]'
                          : 'bg-[#181818] text-[#888] border-[#2a2a2a] hover:bg-[#202020]'
                      }`}
                    >
                      {mbps}M
                    </button>
                  ))}
                </div>
              </div>

              {!recordingState.isRecording ? (
                <button
                  onClick={() => onStartRecording(recBitrate)}
                  disabled={!isActive}
                  className="w-full bg-[#ff3366] hover:bg-[#e62e5c] text-white text-xs font-bold py-2.5 rounded shadow-[0_0_10px_rgba(255,51,102,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Disc size={14} />
                  <span>START HARDWARE RECORDING</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] bg-[#111] p-2 rounded border border-[#222]">
                    <span>RECORDED:</span>
                    <span className="text-[#00ffcc] font-bold">
                      {formatBytes(recordingState.recordedBytes)}
                    </span>
                  </div>
                  <button
                    onClick={onStopRecording}
                    className="w-full bg-[#ff3366] hover:bg-[#e62e5c] text-white text-xs font-bold py-2.5 rounded shadow-[0_0_10px_rgba(255,51,102,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <StopCircle size={14} />
                    <span>FINISH & EXPORT VIDEO</span>
                  </button>
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {/* Persistent Bottom Hardware Telemetry Bar */}
      <footer className="p-2.5 bg-[#0a0a0a] border-t border-[#202020] text-[9px] font-mono text-[#666]">
        <div className="flex items-center justify-between mb-1">
          <span>PIPELINE DELAY:</span>
          <span className="text-[#00ffcc] font-bold">
            {telemetry.latencyDiagnostic.frameToDisplayDelayMs.toFixed(1)} ms ({telemetry.latencyDiagnostic.latencyGrade})
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>RTX REFLEX MODE:</span>
          <span className="text-[#aaa]">{performanceSettings.rtxLowLatency ? 'QUEUE=0 BOOST' : 'STANDARD'}</span>
        </div>
      </footer>
    </aside>
  );
};
