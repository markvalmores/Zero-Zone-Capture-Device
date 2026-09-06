import React from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Flame,
  Gauge,
  Layers,
  Sparkles,
  Tv,
  X,
  Zap,
} from 'lucide-react';
import { LatencyDiagnosticData, PerformanceSettings } from '../types';

interface LatencyDiagnosticOverlayProps {
  data: LatencyDiagnosticData;
  targetFps: number;
  actualFps: number;
  performanceSettings: PerformanceSettings;
  onToggleRtxLowLatency: () => void;
  onToggleFrameGen: () => void;
  onToggleAutoSmooth: () => void;
  onClose: () => void;
}

export const LatencyDiagnosticOverlay: React.FC<LatencyDiagnosticOverlayProps> = ({
  data,
  targetFps,
  actualFps,
  performanceSettings,
  onToggleRtxLowLatency,
  onToggleFrameGen,
  onToggleAutoSmooth,
  onClose,
}) => {
  const getGradeColor = (grade: LatencyDiagnosticData['latencyGrade']) => {
    switch (grade) {
      case 'EXCELLENT (E-SPORTS)':
        return 'text-[#00ffcc] border-[#00ffcc33] bg-[#00ffcc15]';
      case 'OPTIMAL':
        return 'text-[#3ddc84] border-[#3ddc8433] bg-[#3ddc8415]';
      case 'MODERATE':
        return 'text-[#ffcc00] border-[#ffcc0033] bg-[#ffcc0015]';
      case 'BUFFERING':
      default:
        return 'text-[#ff3366] border-[#ff336633] bg-[#ff336615]';
    }
  };

  const vSyncIntervalMs = Math.round((1000 / Math.max(actualFps || targetFps, 60)) * 10) / 10;
  const maxBarHeight = 36;
  const maxScaleMs = 20; // 20ms ceiling for the visual graph

  return (
    <div className="absolute top-16 right-4 z-40 w-80 sm:w-96 bg-[#0c0c0c]/95 backdrop-blur-xl border border-[#00ffcc]/40 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden font-mono select-none text-white animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#141414] border-b border-[#222]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#00ffcc20] text-[#00ffcc] border border-[#00ffcc40]">
            <Gauge size={15} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <span>LATENCY DIAGNOSTIC</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ffcc] animate-pulse" />
            </h3>
            <span className="text-[9px] text-[#888]">Frame-to-Display Telemetry</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-md bg-[#222] hover:bg-[#333] text-[#aaa] hover:text-white cursor-pointer transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Main Metric Hero */}
      <div className="p-4 space-y-3.5">
        <div className="flex items-end justify-between bg-[#141414] p-3.5 rounded-xl border border-[#222]">
          <div>
            <span className="text-[9px] text-[#777] uppercase font-bold tracking-wider block mb-0.5">
              END-TO-END INPUT DELAY
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[#00ffcc] tracking-tight">
                {data.frameToDisplayDelayMs.toFixed(1)}
              </span>
              <span className="text-sm font-bold text-[#888]">ms</span>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-md border ${getGradeColor(
                data.latencyGrade
              )}`}
            >
              {data.latencyGrade}
            </span>
            <span className="block text-[9px] text-[#666] mt-1">
              Jitter: ±{data.jitterMs.toFixed(1)}ms
            </span>
          </div>
        </div>

        {/* Real-time Oscilloscope Waveform */}
        <div className="bg-[#111] p-3 rounded-xl border border-[#222]">
          <div className="flex items-center justify-between text-[9px] text-[#777] mb-2 font-bold uppercase">
            <span className="flex items-center gap-1">
              <Activity size={10} className="text-[#00ffcc]" />
              FRAME DELAY OSCILLOSCOPE (LAST 24 FRAMES)
            </span>
            <span className="text-[#00ffcc]">{data.fpsStabilityPct}% STABLE</span>
          </div>

          <div className="h-10 flex items-end gap-1 px-1 bg-[#090909] rounded-lg border border-[#1a1a1a] pt-1">
            {data.latencyHistory.map((val, idx) => {
              const heightPct = Math.min(100, Math.max(15, (val / maxScaleMs) * 100));
              const isLatest = idx === data.latencyHistory.length - 1;
              return (
                <div
                  key={idx}
                  className="flex-1 rounded-t flex flex-col justify-end group relative"
                >
                  <div
                    className={`w-full rounded-t transition-all duration-75 ${
                      isLatest
                        ? 'bg-[#00ffcc] shadow-[0_0_8px_#00ffcc]'
                        : val < 6
                        ? 'bg-[#00ffcc]/70'
                        : val < 12
                        ? 'bg-[#3ddc84]/70'
                        : 'bg-[#ffcc00]/80'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Pipeline Stage Breakdown */}
        <div className="space-y-1.5 text-[10px]">
          <span className="text-[9px] text-[#777] uppercase font-bold tracking-wider block">
            STAGE BREAKDOWN:
          </span>

          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-[#141414] p-2 rounded-lg border border-[#222]">
              <span className="text-[#777] text-[8px] block">1. CAPTURE BUFFER</span>
              <span className="text-white font-bold">{data.captureBufferDelayMs.toFixed(1)} ms</span>
            </div>
            <div className="bg-[#141414] p-2 rounded-lg border border-[#222]">
              <span className="text-[#777] text-[8px] block">2. HW DECODER (H.264/VP9)</span>
              <span className="text-white font-bold">{data.decodeDelayMs.toFixed(1)} ms</span>
            </div>
            <div className="bg-[#141414] p-2 rounded-lg border border-[#222]">
              <span className="text-[#777] text-[8px] block">3. GPU COMPOSITE</span>
              <span className="text-white font-bold">{data.renderDelayMs.toFixed(1)} ms</span>
            </div>
            <div className="bg-[#141414] p-2 rounded-lg border border-[#222]">
              <span className="text-[#777] text-[8px] block">4. V-SYNC FRAME CADENCE</span>
              <span className="text-[#00ffcc] font-bold">{vSyncIntervalMs} ms ({actualFps || targetFps}Hz)</span>
            </div>
          </div>
        </div>

        {/* RTX & Performance Switches */}
        <div className="pt-2 border-t border-[#222] space-y-1.5">
          <span className="text-[9px] text-[#777] uppercase font-bold tracking-wider block">
            REAL-TIME OPTIMIZATION ENGINE:
          </span>

          {/* RTX Low Latency */}
          <div className="flex items-center justify-between bg-[#141414] p-2 rounded-lg border border-[#222]">
            <div className="flex items-center gap-1.5">
              <Zap size={12} className={performanceSettings.rtxLowLatency ? 'text-[#00ffcc]' : 'text-[#666]'} />
              <div>
                <span className="text-[10px] font-bold text-white block">RTX Zero-Latency Mode</span>
                <span className="text-[8px] text-[#777]">Queue=0 • Direct GPU Pass</span>
              </div>
            </div>
            <button
              onClick={onToggleRtxLowLatency}
              className={`px-2 py-1 rounded text-[9px] font-bold cursor-pointer transition-colors ${
                performanceSettings.rtxLowLatency
                  ? 'bg-[#00ffcc] text-black'
                  : 'bg-[#222] text-[#888]'
              }`}
            >
              {performanceSettings.rtxLowLatency ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          {/* Frame Generation & Motion Smoother */}
          <div className="flex items-center justify-between bg-[#141414] p-2 rounded-lg border border-[#222]">
            <div className="flex items-center gap-1.5">
              <Sparkles size={12} className={performanceSettings.frameGeneration ? 'text-[#ff9900]' : 'text-[#666]'} />
              <div>
                <span className="text-[10px] font-bold text-white block">Frame Generation (Smooth 144)</span>
                <span className="text-[8px] text-[#777]">Motion Flow Interpolation</span>
              </div>
            </div>
            <button
              onClick={onToggleFrameGen}
              className={`px-2 py-1 rounded text-[9px] font-bold cursor-pointer transition-colors ${
                performanceSettings.frameGeneration
                  ? 'bg-[#ff9900] text-black font-black'
                  : 'bg-[#222] text-[#888]'
              }`}
            >
              {performanceSettings.frameGeneration ? 'ON (144FPS)' : 'OFF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
