import React, { useState, useRef, useEffect } from 'react';
import {
  AlertCircle,
  Camera,
  Cast,
  Disc,
  Gamepad2,
  Gauge,
  Layers,
  Maximize,
  Minimize,
  PictureInPicture,
  RotateCw,
  Sliders,
  Sparkles,
  StopCircle,
  Tv,
  Volume2,
  VolumeX,
  Wifi,
  Zap,
} from 'lucide-react';
import {
  ConsoleType,
  FilterPresetKey,
  PerformanceSettings,
  RecordingState,
  StreamTelemetry,
} from '../types';
import { CONSOLE_PROFILES, buildFilterCss } from '../constants/presets';
import { LatencyDiagnosticOverlay } from './LatencyDiagnosticOverlay';

interface VideoPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  selectedConsole: ConsoleType;
  activeFilter: FilterPresetKey;
  customFilterSettings: any;
  telemetry: StreamTelemetry;
  recordingState: RecordingState;
  performanceSettings: PerformanceSettings;
  onUpdatePerformanceSettings: (settings: Partial<PerformanceSettings>) => void;
  onStartDeviceCapture: () => void;
  onStartRemotePlayCapture: () => void;
  onOpenIpMirrorModal?: () => void;
  sourceMode?: string;
  onStopStream: () => void;
  onCaptureSnapshot: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  isAudioMuted: boolean;
  onToggleAudioMute: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoRef,
  stream,
  isActive,
  isLoading,
  error,
  selectedConsole,
  activeFilter,
  customFilterSettings,
  telemetry,
  recordingState,
  performanceSettings,
  onUpdatePerformanceSettings,
  onStartDeviceCapture,
  onStartRemotePlayCapture,
  onOpenIpMirrorModal,
  sourceMode,
  onStopStream,
  onCaptureSnapshot,
  onStartRecording,
  onStopRecording,
  isAudioMuted,
  onToggleAudioMute,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOsd, setShowOsd] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<'contain' | 'cover' | 'fill' | '16:9' | '4:3'>('contain');
  const [rotationDeg, setRotationDeg] = useState<number>(0);
  const [isPipSupported, setIsPipSupported] = useState(false);
  const [showControlDock, setShowControlDock] = useState(true);
  const hideDockTimerRef = useRef<number | null>(null);

  const currentConsole = CONSOLE_PROFILES[selectedConsole];

  // Fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // PiP support check
  useEffect(() => {
    setIsPipSupported(
      'pictureInPictureEnabled' in document &&
        (document as any).pictureInPictureEnabled
    );
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error('Exit fullscreen failed:', err);
      });
    }
  };

  const togglePip = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error('PiP failed:', err);
    }
  };

  const handleRotate = () => {
    setRotationDeg((prev) => (prev + 90) % 360);
  };

  // Auto hide controls in fullscreen when idle
  const handleMouseMove = () => {
    setShowControlDock(true);
    if (hideDockTimerRef.current) clearTimeout(hideDockTimerRef.current);
    if (isFullscreen) {
      hideDockTimerRef.current = window.setTimeout(() => {
        setShowControlDock(false);
      }, 3500);
    }
  };

  const computedFilterStyle = buildFilterCss(activeFilter, customFilterSettings);

  const getAspectRatioClass = () => {
    if (performanceSettings.perfectRatioLock && (selectedConsole === 'ios_mirror' || selectedConsole === 'android_mirror')) {
      return 'object-contain'; // guarantees zero warping for mobile mirrors
    }
    switch (aspectRatio) {
      case 'cover':
        return 'object-cover';
      case 'fill':
        return 'object-fill';
      default:
        return 'object-contain';
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative flex-1 bg-black flex items-center justify-center overflow-hidden select-none ${
        isFullscreen ? 'w-screen h-screen' : 'w-full h-full min-h-[420px]'
      }`}
    >
      {/* Active Video Element */}
      {isActive && (
        <video
          ref={videoRef as any}
          autoPlay
          playsInline
          muted
          className={`w-full h-full transition-transform duration-200 ${getAspectRatioClass()} ${
            performanceSettings.frameGeneration ? 'motion-smooth-144' : ''
          }`}
          style={{
            filter: computedFilterStyle,
            transform: `rotate(${rotationDeg}deg)`,
            maxWidth: rotationDeg % 180 !== 0 ? '56.25%' : '100%',
          }}
        />
      )}

      {/* Top Left Optional FPS & Resolution HUD (Toggleable, Default OFF) */}
      {isActive && showOsd && (
        <div
          className={`absolute top-4 left-4 z-20 flex flex-col gap-1.5 transition-opacity duration-300 ${
            showControlDock ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Main Resolution & Optional FPS Pill */}
          <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white font-mono flex items-center gap-2 shadow-lg">
            <div className="w-2 h-2 rounded-full bg-[#00ffcc] animate-pulse shadow-[0_0_8px_#00ffcc]" />
            <span className="text-[11px] font-black tracking-wider text-[#00ffcc]">
              {telemetry.actualWidth || 1920}x{telemetry.actualHeight || 1080}
            </span>

            {/* FPS is displayed ONLY when showFpsOverlay is enabled (Default: OFF) */}
            {performanceSettings.showFpsOverlay && (
              <>
                <span className="text-[10px] text-[#888]">•</span>
                <span className="text-[11px] font-black text-[#ffcc00] animate-pulse">
                  {telemetry.actualFps || telemetry.targetFps} FPS
                </span>
              </>
            )}

            <span className="text-[9px] px-1.5 py-0.2 bg-[#00ffcc22] text-[#00ffcc] rounded border border-[#00ffcc33] font-bold">
              {sourceMode === 'network_ip' ? 'IP:PORT STREAM' : currentConsole.shortName}
            </span>
          </div>

          {/* Quick Latency Indicator Pill */}
          <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-mono text-[#aaa] border border-white/5 flex items-center gap-2">
            <span>
              DELAY:{' '}
              <span className="text-[#00ffcc] font-bold">
                {telemetry.latencyDiagnostic.frameToDisplayDelayMs.toFixed(1)}ms
              </span>
            </span>
            <span>•</span>
            <button
              onClick={() =>
                onUpdatePerformanceSettings({
                  showLatencyDiagnostic: !performanceSettings.showLatencyDiagnostic,
                })
              }
              className="text-[#00ffcc] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Gauge size={10} />
              <span>{performanceSettings.showLatencyDiagnostic ? 'HIDE DIAGNOSTIC' : 'DIAGNOSTIC'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Latency Diagnostic Overlay */}
      {isActive && performanceSettings.showLatencyDiagnostic && (
        <LatencyDiagnosticOverlay
          data={telemetry.latencyDiagnostic}
          targetFps={telemetry.targetFps}
          actualFps={telemetry.actualFps}
          performanceSettings={performanceSettings}
          onToggleRtxLowLatency={() =>
            onUpdatePerformanceSettings({
              rtxLowLatency: !performanceSettings.rtxLowLatency,
            })
          }
          onToggleFrameGen={() =>
            onUpdatePerformanceSettings({
              frameGeneration: !performanceSettings.frameGeneration,
            })
          }
          onToggleAutoSmooth={() =>
            onUpdatePerformanceSettings({
              autoSmoothViewing: !performanceSettings.autoSmoothViewing,
            })
          }
          onClose={() =>
            onUpdatePerformanceSettings({
              showLatencyDiagnostic: false,
            })
          }
        />
      )}

      {/* Top Right Recording Badge */}
      {recordingState.isRecording && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-[#ff3366]/90 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/20 text-white font-mono text-xs font-bold shadow-[0_0_15px_rgba(255,51,102,0.5)] animate-pulse">
          <div className="w-2.5 h-2.5 rounded-full bg-white" />
          <span>REC [{Math.floor(recordingState.durationSeconds / 60)}:{(recordingState.durationSeconds % 60).toString().padStart(2, '0')}]</span>
        </div>
      )}

      {/* Empty / Standby / Error State Screen */}
      {!isActive && (
        <div className="flex flex-col items-center justify-center p-6 text-center max-w-xl z-10 font-mono">
          {error ? (
            <div className="bg-[#1f1214] border border-[#ff3366]/40 p-5 rounded-xl text-left mb-5 shadow-2xl max-w-md">
              <div className="flex items-center gap-2 text-[#ff3366] font-mono font-bold text-xs mb-2">
                <AlertCircle size={16} />
                <span>DEVICE CAPTURE ALERT</span>
              </div>
              <p className="text-xs text-[#ddd] leading-relaxed mb-3">
                {error}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={onStartDeviceCapture}
                  className="bg-[#ff3366] hover:bg-[#e62e5c] text-white text-[11px] font-bold px-3 py-1.5 rounded cursor-pointer"
                >
                  RETRY HARDWARE CAPTURE
                </button>
                <button
                  onClick={onStartRemotePlayCapture}
                  className="bg-[#222] hover:bg-[#333] text-[#ccc] text-[11px] px-3 py-1.5 rounded cursor-pointer"
                >
                  TRY SCREEN / MIRROR
                </button>
                {onOpenIpMirrorModal && (
                  <button
                    onClick={onOpenIpMirrorModal}
                    className="bg-[#1a1a1a] hover:bg-[#252525] text-[#00ffcc] border border-[#00ffcc44] text-[11px] px-3 py-1.5 rounded cursor-pointer flex items-center gap-1"
                  >
                    <Wifi size={12} />
                    <span>INPUT IP:PORT</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              {/* Animated Hardware Icon */}
              <div className="relative p-5 rounded-2xl bg-[#121212] border border-[#222] shadow-2xl group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00ffcc] to-[#0070d1] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                <Tv size={56} className="relative text-[#00ffcc]" />
              </div>

              <div>
                <h2 className="text-base font-black uppercase tracking-widest text-white">
                  {currentConsole.name}
                </h2>
                <p className="text-xs text-[#777] mt-1 max-w-md">
                  {currentConsole.description} Supports 144 FPS screen mirroring, RTX Ultra-Low Latency, and audio pass-through.
                </p>
              </div>

              {/* Quick Connect Actions */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={onStartDeviceCapture}
                  disabled={isLoading}
                  className="bg-[#00ffcc] hover:bg-[#00e6b8] text-black text-xs font-black px-5 py-2.5 rounded-lg shadow-[0_0_15px_rgba(0,255,204,0.4)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Zap size={15} />
                  <span>{isLoading ? 'INITIALIZING CAPTURE...' : 'AUTO-CAPTURE HARDWARE'}</span>
                </button>

                <button
                  onClick={onStartRemotePlayCapture}
                  disabled={isLoading}
                  className="bg-[#181818] hover:bg-[#252525] text-white border border-[#333] hover:border-[#00ffcc] text-xs font-bold px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Cast size={15} className="text-[#00ffcc]" />
                  <span>
                    {selectedConsole.includes('mirror')
                      ? 'CAPTURE SCREEN MIRROR (144FPS)'
                      : 'CAPTURE REMOTE PLAY APP'}
                  </span>
                </button>

                {onOpenIpMirrorModal && (
                  <button
                    onClick={onOpenIpMirrorModal}
                    disabled={isLoading}
                    className="bg-[#141414] hover:bg-[#202020] text-white border border-[#333] hover:border-[#00ffcc] text-xs font-bold px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Wifi size={15} className="text-[#00ffcc]" />
                    <span>INPUT IP & PORT MIRROR</span>
                  </button>
                )}
              </div>

              {/* Hardware Connection Tips */}
              <div className="mt-4 p-3 bg-[#111] rounded-lg border border-[#222] text-[10px] text-[#777] text-left w-full">
                <span className="text-[#00ffcc] font-bold">CONNECTIVITY GUIDE: </span>
                {currentConsole.hardwareGuide}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Bottom Control Dock */}
      {isActive && (
        <div
          className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-30 transition-all duration-300 ${
            showControlDock ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <div className="bg-[#111]/90 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2.5 font-mono">
            {/* Snapshot Button */}
            <button
              onClick={onCaptureSnapshot}
              title="Instant 4K Snapshot (PNG)"
              className="p-2 rounded-xl bg-[#1e1e1e] hover:bg-[#282828] text-[#ddd] hover:text-[#00ffcc] transition-colors cursor-pointer"
            >
              <Camera size={16} />
            </button>

            {/* Record / Stop Button */}
            {!recordingState.isRecording ? (
              <button
                onClick={onStartRecording}
                title="Start Hardware Recording"
                className="p-2 rounded-xl bg-[#ff3366] hover:bg-[#e62e5c] text-white shadow-[0_0_10px_rgba(255,51,102,0.4)] transition-all cursor-pointer"
              >
                <Disc size={16} />
              </button>
            ) : (
              <button
                onClick={onStopRecording}
                title="Stop & Save Video"
                className="p-2 rounded-xl bg-[#ff3366] hover:bg-[#e62e5c] text-white shadow-[0_0_12px_rgba(255,51,102,0.6)] animate-pulse transition-all cursor-pointer"
              >
                <StopCircle size={16} />
              </button>
            )}

            <div className="h-4 w-[1px] bg-white/10" />

            {/* FPS Toggle Button (Default OFF) */}
            <button
              onClick={() =>
                onUpdatePerformanceSettings({
                  showFpsOverlay: !performanceSettings.showFpsOverlay,
                })
              }
              title={`Toggle FPS Display (Currently: ${performanceSettings.showFpsOverlay ? 'ON' : 'OFF'})`}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                performanceSettings.showFpsOverlay
                  ? 'bg-[#ffcc0022] text-[#ffcc00] border border-[#ffcc0055]'
                  : 'bg-[#1e1e1e] text-[#666] hover:text-white'
              }`}
            >
              FPS: {performanceSettings.showFpsOverlay ? 'ON' : 'OFF'}
            </button>

            {/* Latency Diagnostic Toggle */}
            <button
              onClick={() =>
                onUpdatePerformanceSettings({
                  showLatencyDiagnostic: !performanceSettings.showLatencyDiagnostic,
                })
              }
              title="Toggle Real-Time Latency Diagnostic Overlay"
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                performanceSettings.showLatencyDiagnostic
                  ? 'bg-[#00ffcc22] text-[#00ffcc] border border-[#00ffcc55]'
                  : 'bg-[#1e1e1e] hover:bg-[#282828] text-[#aaa] hover:text-white'
              }`}
            >
              <Gauge size={16} />
            </button>

            {/* RTX Low Latency Fast Toggle */}
            <button
              onClick={() =>
                onUpdatePerformanceSettings({
                  rtxLowLatency: !performanceSettings.rtxLowLatency,
                })
              }
              title={`RTX Low-Latency Mode (${performanceSettings.rtxLowLatency ? 'ENABLED' : 'DISABLED'})`}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                performanceSettings.rtxLowLatency
                  ? 'bg-[#00ffcc22] text-[#00ffcc]'
                  : 'bg-[#1e1e1e] text-[#666]'
              }`}
            >
              <Zap size={15} />
            </button>

            {/* Aspect Ratio Toggle */}
            <button
              onClick={() => {
                const next =
                  aspectRatio === 'contain'
                    ? 'cover'
                    : aspectRatio === 'cover'
                    ? 'fill'
                    : 'contain';
                setAspectRatio(next);
              }}
              title={`Aspect Mode: ${aspectRatio.toUpperCase()}`}
              className="px-2.5 py-1 rounded-lg bg-[#1e1e1e] hover:bg-[#282828] text-[10px] text-[#aaa] hover:text-white transition-colors cursor-pointer uppercase"
            >
              {aspectRatio}
            </button>

            {/* Rotate (Tate Mode for Switch / Mobile vertical mirrors) */}
            <button
              onClick={handleRotate}
              title={`Rotate Feed (${rotationDeg}°)`}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                rotationDeg !== 0
                  ? 'bg-[#00ffcc22] text-[#00ffcc]'
                  : 'bg-[#1e1e1e] hover:bg-[#282828] text-[#aaa] hover:text-white'
              }`}
            >
              <RotateCw size={15} />
            </button>

            {/* Audio Mute Toggle */}
            <button
              onClick={onToggleAudioMute}
              title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isAudioMuted
                  ? 'bg-[#ff336622] text-[#ff3366]'
                  : 'bg-[#1e1e1e] hover:bg-[#282828] text-[#aaa] hover:text-white'
              }`}
            >
              {isAudioMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            {/* Picture in Picture */}
            {isPipSupported && (
              <button
                onClick={togglePip}
                title="Picture in Picture"
                className="p-2 rounded-xl bg-[#1e1e1e] hover:bg-[#282828] text-[#aaa] hover:text-white transition-colors cursor-pointer"
              >
                <PictureInPicture size={16} />
              </button>
            )}

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              className="p-2 rounded-xl bg-[#00ffcc] hover:bg-[#00e6b8] text-black font-bold shadow-[0_0_10px_rgba(0,255,204,0.3)] transition-all cursor-pointer"
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
