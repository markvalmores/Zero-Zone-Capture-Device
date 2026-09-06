import React from 'react';
import {
  Activity,
  Cpu,
  Layers,
  Radio,
  Sliders,
  Tv,
  Zap,
  HelpCircle,
  HardDrive,
  RefreshCw,
  Gauge,
  Sparkles,
} from 'lucide-react';
import { ConsoleType, PerformanceSettings, StreamTelemetry } from '../types';
import { CONSOLE_PROFILES } from '../constants/presets';

interface HeaderProps {
  selectedConsole: ConsoleType;
  telemetry: StreamTelemetry;
  performanceSettings: PerformanceSettings;
  onUpdatePerformanceSettings: (settings: Partial<PerformanceSettings>) => void;
  isActive: boolean;
  sourceMode: 'device' | 'remote_play_screen';
  detectedDevicesCount: number;
  onOpenDetectorModal: () => void;
  onOpenGuideModal: () => void;
  onRescan: () => void;
  isScanning: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedConsole,
  telemetry,
  performanceSettings,
  onUpdatePerformanceSettings,
  isActive,
  sourceMode,
  detectedDevicesCount,
  onOpenDetectorModal,
  onOpenGuideModal,
  onRescan,
  isScanning,
}) => {
  const currentProfile = CONSOLE_PROFILES[selectedConsole] || CONSOLE_PROFILES['auto'];

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-[#0d0d0d] border-b border-[#222] select-none">
      {/* Brand & Active Console */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              isActive
                ? 'bg-[#00ffcc] shadow-[0_0_10px_#00ffcc]'
                : 'bg-[#ff3366] shadow-[0_0_8px_#ff3366]'
            }`}
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-widest uppercase text-white font-mono">
                zerozone
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-[#1a1a1a] text-[#00ffcc] border border-[#333] rounded">
                capturedevice
              </span>
              <span className="text-[9px] font-mono text-[#666] hidden sm:inline">
                PRO STUDIO
              </span>
            </div>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-[#2a2a2a] hidden sm:block" />

        {/* Selected Profile Badge */}
        <div className="flex items-center gap-1.5 bg-[#141414] px-2.5 py-1 rounded border border-[#2a2a2a]">
          <span className="text-[9px] uppercase font-bold text-[#777] tracking-wider">
            PROFILE:
          </span>
          <span
            className="text-[11px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded font-mono"
            style={{
              color: currentProfile.badgeColor || '#00ffcc',
              backgroundColor: `${currentProfile.badgeColor}18`,
              borderColor: `${currentProfile.badgeColor}40`,
              borderWidth: 1,
            }}
          >
            {currentProfile.shortName}
          </span>
        </div>

        {/* Source Mode Tag */}
        <div className="flex items-center gap-1 bg-[#141414] px-2 py-1 rounded border border-[#262626] text-[10px] text-[#aaa]">
          <span className="text-[#666] font-mono">SOURCE:</span>
          <span className="font-semibold text-white uppercase font-mono">
            {sourceMode === 'device' ? 'HARDWARE UVC / OTG' : 'SCREEN MIRROR 144Hz'}
          </span>
        </div>
      </div>

      {/* Live Stream Telemetry & Quick Action Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Latency Diagnostic Overlay Trigger Button */}
        <button
          onClick={() =>
            onUpdatePerformanceSettings({
              showLatencyDiagnostic: !performanceSettings.showLatencyDiagnostic,
            })
          }
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all text-[10px] font-mono font-bold cursor-pointer ${
            performanceSettings.showLatencyDiagnostic
              ? 'bg-[#00ffcc] text-black border-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.4)]'
              : 'bg-[#171717] hover:bg-[#222] text-[#ccc] border-[#333] hover:text-[#00ffcc]'
          }`}
          title="Toggle Real-Time Latency Diagnostic Overlay"
        >
          <Gauge size={13} className={performanceSettings.showLatencyDiagnostic ? 'text-black' : 'text-[#00ffcc]'} />
          <span>LATENCY: {telemetry.latencyDiagnostic.frameToDisplayDelayMs.toFixed(1)}ms</span>
        </button>

        {/* FPS Toggle Button (Default OFF) */}
        <button
          onClick={() =>
            onUpdatePerformanceSettings({
              showFpsOverlay: !performanceSettings.showFpsOverlay,
            })
          }
          className={`flex items-center gap-1 px-2 py-1 rounded border transition-all text-[10px] font-mono font-bold cursor-pointer ${
            performanceSettings.showFpsOverlay
              ? 'bg-[#ffcc0022] text-[#ffcc00] border-[#ffcc0066]'
              : 'bg-[#171717] hover:bg-[#222] text-[#777] border-[#333] hover:text-white'
          }`}
          title="Toggle FPS Display (Default OFF)"
        >
          <span>FPS: {performanceSettings.showFpsOverlay ? 'ON' : 'OFF'}</span>
        </button>

        {/* RTX Low Latency Badge */}
        {performanceSettings.rtxLowLatency && (
          <div className="hidden xl:flex items-center gap-1 bg-[#00ffcc12] px-2 py-1 rounded border border-[#00ffcc33] text-[9px] font-mono text-[#00ffcc] font-bold">
            <Zap size={10} />
            <span>RTX LOW-LAG</span>
          </div>
        )}

        {/* Hardware Detector Status Button */}
        <button
          onClick={onOpenDetectorModal}
          title="Open Device Detector & Hardware Diagnostic"
          className="flex items-center gap-1.5 bg-[#171717] hover:bg-[#222] text-[#ddd] hover:text-[#00ffcc] px-2.5 py-1 rounded border border-[#333] transition-colors text-[10px] font-mono font-bold cursor-pointer"
        >
          <HardDrive size={12} className="text-[#00ffcc]" />
          <span>DETECTOR ({detectedDevicesCount})</span>
        </button>

        {/* Quick Rescan */}
        <button
          onClick={onRescan}
          disabled={isScanning}
          title="Rescan USB/OTG capture devices"
          className="bg-[#171717] hover:bg-[#222] text-[#888] hover:text-white p-1.5 rounded border border-[#333] transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={12} className={isScanning ? 'animate-spin text-[#00ffcc]' : ''} />
        </button>

        {/* Setup & Remote Play Guide Button */}
        <button
          onClick={onOpenGuideModal}
          title="Console Setup & Screen Mirroring Quick Guide"
          className="flex items-center gap-1 bg-[#171717] hover:bg-[#222] text-[#aaa] hover:text-white px-2.5 py-1 rounded border border-[#333] transition-colors text-[10px] font-mono cursor-pointer"
        >
          <HelpCircle size={12} />
          <span className="hidden sm:inline">GUIDE</span>
        </button>
      </div>
    </header>
  );
};
