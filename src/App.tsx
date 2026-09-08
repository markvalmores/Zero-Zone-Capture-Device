import React, { useState, useEffect, useCallback } from 'react';
import { ConsoleType, FilterPresetKey, NetworkStreamConfig, PerformanceSettings, ResolutionPresetKey } from './types';
import {
  CONSOLE_PROFILES,
  DEFAULT_CUSTOM_FILTERS,
  DEFAULT_NETWORK_STREAM_CONFIG,
  DEFAULT_PERFORMANCE_SETTINGS,
  RESOLUTION_PRESETS,
} from './constants/presets';
import { useDeviceDetector } from './hooks/useDeviceDetector';
import { useAudioMonitor } from './hooks/useAudioMonitor';
import { useCaptureStream } from './hooks/useCaptureStream';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { VideoPlayer } from './components/VideoPlayer';
import { DeviceDetectorModal } from './components/DeviceDetectorModal';
import { RemotePlayGuideModal } from './components/RemotePlayGuideModal';
import { IpMirrorModal } from './components/IpMirrorModal';
import { Usb, X } from 'lucide-react';

export default function App() {
  const [selectedConsole, setSelectedConsole] = useState<ConsoleType>('auto');
  const [selectedPreset, setSelectedPreset] = useState<ResolutionPresetKey>('1080p120');
  const [activeFilter, setActiveFilter] = useState<FilterPresetKey>('device_quality');
  const [customFilterSettings, setCustomFilterSettings] = useState(DEFAULT_CUSTOM_FILTERS);

  // Network IP Stream Configuration
  const [networkConfig, setNetworkConfig] = useState<NetworkStreamConfig>(
    DEFAULT_NETWORK_STREAM_CONFIG
  );

  const handleUpdateNetworkConfig = useCallback(
    (newConfig: Partial<NetworkStreamConfig>) => {
      setNetworkConfig((prev) => ({
        ...prev,
        ...newConfig,
      }));
    },
    []
  );

  // Performance & Latency Tuning Settings
  const [performanceSettings, setPerformanceSettings] = useState<PerformanceSettings>(
    DEFAULT_PERFORMANCE_SETTINGS
  );

  const handleUpdatePerformanceSettings = useCallback(
    (newSettings: Partial<PerformanceSettings>) => {
      setPerformanceSettings((prev) => ({
        ...prev,
        ...newSettings,
      }));
    },
    []
  );

  // Modals
  const [isDetectorModalOpen, setIsDetectorModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isIpMirrorModalOpen, setIsIpMirrorModalOpen] = useState(false);

  // Device Detector Hook
  const {
    videoDevices,
    audioDevices,
    selectedVideoDeviceId,
    setSelectedVideoDeviceId,
    selectedAudioDeviceId,
    setSelectedAudioDeviceId,
    isScanning,
    scanDevices,
    lastHotplugEvent,
    clearHotplugEvent,
    permissionError,
  } = useDeviceDetector(selectedConsole);

  // Web Audio Monitor Hook
  const {
    isAudioMuted,
    toggleMute,
    audioVolume,
    setAudioVolume,
    audioDelayMs,
    setAudioDelayMs,
    vuLevels,
    isAudioActive,
    attachAudioStream,
  } = useAudioMonitor();

  // Video & Stream Capture Hook
  const {
    stream,
    sourceMode,
    isActive,
    isLoading,
    error,
    telemetry,
    recordingState,
    videoElementRef,
    startDeviceCapture,
    startRemotePlayCapture,
    startNetworkIpCapture,
    stopStream,
    captureSnapshot,
    startRecording,
    stopRecording,
  } = useCaptureStream({
    selectedConsole,
    selectedDeviceId: selectedVideoDeviceId,
    selectedAudioDeviceId: selectedAudioDeviceId,
    selectedPreset,
    onAudioStreamReady: attachAudioStream,
  });

  // Handle Console Selection & Auto-select recommended preset and filter
  const handleSelectConsole = useCallback(
    (cType: ConsoleType) => {
      setSelectedConsole(cType);
      const profile = CONSOLE_PROFILES[cType];
      if (profile) {
        setSelectedPreset(profile.defaultPreset);
        setActiveFilter(profile.recommendedFilter);
      }
    },
    []
  );

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'f' || e.key === 'F') {
        const vidElem = videoElementRef.current?.parentElement;
        if (vidElem) {
          if (!document.fullscreenElement) {
            vidElem.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
        }
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      } else if (e.key === 's' || e.key === 'S') {
        if (isActive) captureSnapshot('png');
      } else if (e.key === 'd' || e.key === 'D') {
        handleUpdatePerformanceSettings({
          showLatencyDiagnostic: !performanceSettings.showLatencyDiagnostic,
        });
      } else if (e.key === 'r' || e.key === 'R') {
        if (isActive) {
          if (recordingState.isRecording) stopRecording();
          else startRecording(25);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    isActive,
    captureSnapshot,
    recordingState.isRecording,
    startRecording,
    stopRecording,
    toggleMute,
    videoElementRef,
    performanceSettings.showLatencyDiagnostic,
    handleUpdatePerformanceSettings,
  ]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0a0a0a] text-[#e0e0e0] font-sans overflow-hidden select-none">
      {/* Top Header */}
      <Header
        selectedConsole={selectedConsole}
        telemetry={telemetry}
        performanceSettings={performanceSettings}
        onUpdatePerformanceSettings={handleUpdatePerformanceSettings}
        isActive={isActive}
        sourceMode={sourceMode}
        detectedDevicesCount={videoDevices.length}
        onOpenDetectorModal={() => setIsDetectorModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onOpenIpMirrorModal={() => setIsIpMirrorModalOpen(true)}
        onRescan={() => scanDevices(true)}
        isScanning={isScanning}
        activeIpAddress={
          sourceMode === 'network_ip' ? `${networkConfig.ip}:${networkConfig.port}` : undefined
        }
      />

      {/* Main Studio Body (Sidebar + Video Display Area) */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative">
        {/* Left Control Sidebar */}
        <Sidebar
          selectedConsole={selectedConsole}
          onSelectConsole={handleSelectConsole}
          videoDevices={videoDevices}
          audioDevices={audioDevices}
          selectedVideoDeviceId={selectedVideoDeviceId}
          onSelectVideoDevice={setSelectedVideoDeviceId}
          selectedAudioDeviceId={selectedAudioDeviceId}
          onSelectAudioDevice={setSelectedAudioDeviceId}
          selectedPreset={selectedPreset}
          onSelectPreset={setSelectedPreset}
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
          customFilterSettings={customFilterSettings}
          onChangeCustomFilter={setCustomFilterSettings}
          performanceSettings={performanceSettings}
          onUpdatePerformanceSettings={handleUpdatePerformanceSettings}
          isActive={isActive}
          isLoading={isLoading}
          sourceMode={sourceMode}
          networkConfig={networkConfig}
          onChangeNetworkConfig={handleUpdateNetworkConfig}
          onStartNetworkCapture={startNetworkIpCapture}
          onStartDeviceCapture={() => startDeviceCapture()}
          onStartRemotePlayCapture={startRemotePlayCapture}
          onStopStream={stopStream}
          onCaptureSnapshot={() => captureSnapshot('png')}
          recordingState={recordingState}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          isAudioMuted={isAudioMuted}
          onToggleAudioMute={toggleMute}
          audioVolume={audioVolume}
          onChangeAudioVolume={setAudioVolume}
          audioDelayMs={audioDelayMs}
          onChangeAudioDelay={setAudioDelayMs}
          vuLevels={vuLevels}
          isAudioActive={isAudioActive}
          onRescan={() => scanDevices(true)}
          isScanning={isScanning}
          telemetry={telemetry}
        />

        {/* Center / Right High Performance Player Canvas */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-black relative">
          <VideoPlayer
            videoRef={videoElementRef}
            stream={stream}
            isActive={isActive}
            isLoading={isLoading}
            error={error || permissionError}
            selectedConsole={selectedConsole}
            activeFilter={activeFilter}
            customFilterSettings={customFilterSettings}
            telemetry={telemetry}
            recordingState={recordingState}
            performanceSettings={performanceSettings}
            onUpdatePerformanceSettings={handleUpdatePerformanceSettings}
            onStartDeviceCapture={() => startDeviceCapture()}
            onStartRemotePlayCapture={startRemotePlayCapture}
            onOpenIpMirrorModal={() => setIsIpMirrorModalOpen(true)}
            sourceMode={sourceMode}
            onStopStream={stopStream}
            onCaptureSnapshot={() => captureSnapshot('png')}
            onStartRecording={() => startRecording(25)}
            onStopRecording={stopRecording}
            isAudioMuted={isAudioMuted}
            onToggleAudioMute={toggleMute}
          />
        </main>
      </div>

      {/* Hotplug Event Notification Toast */}
      {lastHotplugEvent && (
        <div className="absolute bottom-4 right-4 z-50 bg-[#161616] border border-[#00ffcc] text-white p-3 rounded-xl shadow-[0_0_20px_rgba(0,255,204,0.3)] flex items-center gap-3 font-mono animate-in slide-in-from-bottom duration-200">
          <div className="p-2 rounded-lg bg-[#00ffcc22] text-[#00ffcc]">
            <Usb size={16} />
          </div>
          <div className="text-xs">
            <div className="font-bold text-[#00ffcc]">
              {lastHotplugEvent.action === 'plugged'
                ? 'HARDWARE CAPTURE DEVICE ATTACHED'
                : 'DEVICE DISCONNECTED'}
            </div>
            <div className="text-[10px] text-[#aaa]">{lastHotplugEvent.deviceName}</div>
          </div>
          <button
            onClick={clearHotplugEvent}
            className="p-1 text-[#666] hover:text-white cursor-pointer ml-2"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Device Detector Modal */}
      <DeviceDetectorModal
        isOpen={isDetectorModalOpen}
        onClose={() => setIsDetectorModalOpen(false)}
        videoDevices={videoDevices}
        audioDevices={audioDevices}
        selectedVideoDeviceId={selectedVideoDeviceId}
        onSelectVideoDevice={setSelectedVideoDeviceId}
        onRescan={() => scanDevices(true)}
        isScanning={isScanning}
      />

      {/* Remote Play & Screen Mirror Setup Guide Modal */}
      <RemotePlayGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        selectedConsole={selectedConsole}
        onSelectConsole={handleSelectConsole}
        onStartRemotePlayCapture={startRemotePlayCapture}
      />

      {/* IP & Port Screen Mirror Configuration Modal */}
      <IpMirrorModal
        isOpen={isIpMirrorModalOpen}
        onClose={() => setIsIpMirrorModalOpen(false)}
        config={networkConfig}
        onChangeConfig={handleUpdateNetworkConfig}
        onStartStream={(cfg) => {
          startNetworkIpCapture(cfg);
        }}
        onStopStream={stopStream}
        isActive={isActive && sourceMode === 'network_ip'}
        isLoading={isLoading}
      />
    </div>
  );
}
