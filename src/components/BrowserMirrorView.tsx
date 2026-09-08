import React, { useState, useRef, useEffect } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Cast,
  Check,
  Copy,
  ExternalLink,
  Globe,
  Maximize,
  Minimize,
  Radio,
  RefreshCw,
  RotateCw,
  Sliders,
  Smartphone,
  Sparkles,
  StopCircle,
  Tv,
  Wifi,
  Zap,
} from 'lucide-react';
import { FilterPresetKey } from '../types';
import { buildFilterCss } from '../constants/presets';

interface BrowserMirrorViewProps {
  url: string;
  activeFilter: FilterPresetKey;
  customFilterSettings: any;
  onStop: () => void;
  onOpenModal?: () => void;
  onSwitchToCanvasStream?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const BrowserMirrorView: React.FC<BrowserMirrorViewProps> = ({
  url,
  activeFilter,
  customFilterSettings,
  onStop,
  onOpenModal,
  onSwitchToCanvasStream,
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  const [aspectMode, setAspectMode] = useState<'contain' | 'cover' | '9:16' | '16:9'>('contain');
  const [rotationDeg, setRotationDeg] = useState<number>(0);
  const [iframeKey, setIframeKey] = useState<number>(Date.now());
  const [isCopied, setIsCopied] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const hideTimerRef = useRef<number | null>(null);

  const isDemo = url.toLowerCase().includes('demo') || url.includes('demo:8080');

  // Auto-hide toolbar in fullscreen when idle
  const handleUserActivity = () => {
    setShowToolbar(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (isFullscreen) {
      hideTimerRef.current = window.setTimeout(() => {
        setShowToolbar(false);
      }, 3500);
    }
  };

  const handleCopyUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleOpenExternal = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const computedFilterStyle = buildFilterCss(activeFilter, customFilterSettings);

  const getContainerAspectClass = () => {
    switch (aspectMode) {
      case '9:16':
        return 'aspect-[9/16] max-w-sm h-full max-h-[92vh]';
      case '16:9':
        return 'aspect-video w-full max-h-full';
      case 'cover':
        return 'w-full h-full';
      case 'contain':
      default:
        return 'max-w-full max-h-full w-full h-full';
    }
  };

  return (
    <div
      onMouseMove={handleUserActivity}
      onClick={handleUserActivity}
      className="relative w-full h-full flex flex-col items-center justify-center bg-[#070707] select-none overflow-hidden font-mono"
    >
      {/* Top Floating Control Bar */}
      <div
        className={`absolute top-3 left-1/2 -translate-x-1/2 z-30 transition-all duration-300 w-auto max-w-[95%] ${
          showToolbar ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-[#121212]/95 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs text-white">
          {/* Live Status Pill */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#00ffcc15] border border-[#00ffcc33] text-[#00ffcc] font-bold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#00ffcc] animate-pulse" />
            <span>LINK MIRROR</span>
          </div>

          {/* URL Pill with Copy */}
          <div
            onClick={handleCopyUrl}
            title="Click to copy mirror URL"
            className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] rounded-lg text-[10.5px] text-[#ccc] hover:text-white cursor-pointer transition-colors max-w-xs sm:max-w-sm truncate"
          >
            <Globe size={11} className="text-[#00ffcc] shrink-0" />
            <span className="truncate">{url}</span>
            {isCopied ? (
              <Check size={11} className="text-[#00ffcc] shrink-0" />
            ) : (
              <Copy size={11} className="text-[#888] shrink-0" />
            )}
          </div>

          <div className="h-4 w-[1px] bg-[#333] mx-0.5" />

          {/* Aspect Ratio Switcher */}
          <div className="flex items-center gap-1 bg-[#1a1a1a] p-0.5 rounded-lg border border-[#2a2a2a] text-[10px]">
            <button
              type="button"
              onClick={() => setAspectMode('contain')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                aspectMode === 'contain' ? 'bg-[#00ffcc22] text-[#00ffcc] font-bold' : 'text-[#888] hover:text-white'
              }`}
              title="Fit Full Window (Preserve Ratio)"
            >
              FIT
            </button>
            <button
              type="button"
              onClick={() => setAspectMode('9:16')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                aspectMode === '9:16' ? 'bg-[#00ffcc22] text-[#00ffcc] font-bold' : 'text-[#888] hover:text-white'
              }`}
              title="Mobile Phone Vertical (9:16)"
            >
              PHONE
            </button>
            <button
              type="button"
              onClick={() => setAspectMode('16:9')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                aspectMode === '16:9' ? 'bg-[#00ffcc22] text-[#00ffcc] font-bold' : 'text-[#888] hover:text-white'
              }`}
              title="Widescreen (16:9)"
            >
              16:9
            </button>
          </div>

          {/* Rotate */}
          <button
            type="button"
            onClick={() => setRotationDeg((prev) => (prev + 90) % 360)}
            title="Rotate Screen (0 / 90 / 180 / 270)"
            className="p-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] text-[#aaa] hover:text-white transition-colors cursor-pointer"
          >
            <RotateCw size={13} />
          </button>

          {/* Refresh Frame */}
          <button
            type="button"
            onClick={() => {
              setIframeKey(Date.now());
              setIframeError(false);
            }}
            title="Reload Screen Mirror"
            className="p-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] text-[#aaa] hover:text-[#00ffcc] transition-colors cursor-pointer"
          >
            <RefreshCw size={13} />
          </button>

          {/* Open in Separate Tab (Popout) */}
          <button
            type="button"
            onClick={handleOpenExternal}
            title="Open mirror in separate tab / popout"
            className="p-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] text-[#aaa] hover:text-[#00ffcc] transition-colors cursor-pointer flex items-center gap-1"
          >
            <ExternalLink size={13} />
          </button>

          {/* Fullscreen */}
          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              className="p-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] text-[#aaa] hover:text-white transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
            </button>
          )}

          {/* Change Link */}
          {onOpenModal && (
            <button
              type="button"
              onClick={onOpenModal}
              title="Change Screen Mirror Link"
              className="px-2 py-1 rounded-lg bg-[#222] hover:bg-[#333] text-[#00ffcc] hover:text-[#33ffdd] border border-[#00ffcc44] text-[10px] font-bold cursor-pointer transition-colors"
            >
              CHANGE LINK
            </button>
          )}

          {/* Stop Button */}
          <button
            type="button"
            onClick={onStop}
            title="Disconnect Mirror"
            className="p-1.5 rounded-lg bg-[#ff3366]/20 hover:bg-[#ff3366]/40 text-[#ff3366] border border-[#ff3366]/40 transition-colors cursor-pointer"
          >
            <StopCircle size={13} />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div
        className={`relative flex items-center justify-center transition-all duration-200 ${getContainerAspectClass()}`}
        style={{
          transform: `rotate(${rotationDeg}deg)`,
          filter: computedFilterStyle,
        }}
      >
        {isDemo ? (
          /* Interactive Demo Phone Screen Mirror */
          <div className="w-full max-w-sm h-full max-h-[88vh] aspect-[9/16] bg-[#111] border-4 border-[#2b2b2b] rounded-[36px] p-3 shadow-2xl flex flex-col justify-between overflow-hidden relative">
            {/* Phone Notch / Dynamic Island */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-20 flex items-center justify-end px-3">
              <span className="w-2 h-2 rounded-full bg-[#00ffcc] animate-ping" />
            </div>

            {/* Mobile Status Bar */}
            <div className="flex items-center justify-between text-[10px] text-[#aaa] pt-2 px-3 z-10">
              <span className="font-bold text-white">9:41</span>
              <div className="flex items-center gap-1.5 text-[10px]">
                <Wifi size={11} className="text-[#00ffcc]" />
                <span className="font-bold text-[#00ffcc]">5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* Simulated Active Screen Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center my-auto">
              <div className="p-4 rounded-2xl bg-[#1a1a1a] border border-[#333] shadow-lg mb-3">
                <Smartphone size={48} className="text-[#00ffcc]" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                SCREEN MIRROR ACTIVE
              </h3>
              <p className="text-[11px] text-[#888] mt-1 max-w-[200px]">
                Interactive Mobile Display Mirroring via Browser URL
              </p>
              <div className="mt-4 px-3 py-1 bg-[#222] rounded-lg border border-[#333] text-[10px] text-[#00ffcc]">
                120 FPS ULTRA LOW LATENCY
              </div>
            </div>

            {/* Phone Navigation Bar */}
            <div className="w-28 h-1 bg-white/40 rounded-full mx-auto mb-1" />
          </div>
        ) : (
          /* Live Iframe Screen Mirror */
          <div className="relative w-full h-full flex items-center justify-center">
            <iframe
              key={iframeKey}
              src={url}
              title="Browser Screen Mirror"
              allow="autoplay; camera; microphone; display-capture; fullscreen; geolocation; clipboard-read; clipboard-write"
              sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
              className="w-full h-full border-0 bg-black rounded-lg shadow-2xl"
              onError={() => setIframeError(true)}
            />

            {/* Mixed-Content / Embed Fallback Notice Card */}
            {iframeError && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-black/90 text-center">
                <AlertTriangle size={36} className="text-[#ffaa00] mb-3" />
                <h4 className="text-sm font-bold text-white mb-1">
                  Cross-Origin or Mixed Content Notice
                </h4>
                <p className="text-xs text-[#aaa] max-w-md mb-4 leading-relaxed">
                  Your browser may restrict displaying HTTP mirror addresses inside an HTTPS container. You can open the mirror stream directly in a separate popout window or switch to direct canvas decoding.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleOpenExternal}
                    className="px-4 py-2 rounded-xl bg-[#00ffcc] hover:bg-[#00e6b8] text-black text-xs font-black flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,255,204,0.4)]"
                  >
                    <ExternalLink size={14} />
                    <span>OPEN IN POPOUT WINDOW</span>
                  </button>
                  {onSwitchToCanvasStream && (
                    <button
                      type="button"
                      onClick={onSwitchToCanvasStream}
                      className="px-4 py-2 rounded-xl bg-[#222] hover:bg-[#333] text-white border border-[#444] text-xs font-bold flex items-center gap-2 cursor-pointer"
                    >
                      <Zap size={14} className="text-[#00ffcc]" />
                      <span>TRY CANVAS STREAM</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
