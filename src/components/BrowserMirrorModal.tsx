import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Cast,
  Check,
  Clipboard,
  ExternalLink,
  Globe,
  HelpCircle,
  History,
  Info,
  Layers,
  Link,
  Play,
  Radio,
  RefreshCw,
  Smartphone,
  Sparkles,
  StopCircle,
  Tv,
  Wifi,
  X,
  Zap,
} from 'lucide-react';
import { BROWSER_MIRROR_PRESETS, DEFAULT_BROWSER_MIRROR_CONFIG } from '../constants/presets';
import { BrowserMirrorPreset } from '../types';

interface BrowserMirrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl?: string;
  onStartBrowserMirror: (url: string, renderMode: 'auto' | 'webview' | 'stream') => void;
  onStopStream: () => void;
  isActive: boolean;
  isLoading?: boolean;
  sourceMode?: string;
}

const STORAGE_KEY_RECENT_LINKS = 'zerozone_recent_mirror_links';

export const BrowserMirrorModal: React.FC<BrowserMirrorModalProps> = ({
  isOpen,
  onClose,
  currentUrl = '',
  onStartBrowserMirror,
  onStopStream,
  isActive,
  isLoading = false,
  sourceMode = 'browser_mirror_url',
}) => {
  const [url, setUrl] = useState<string>(currentUrl || DEFAULT_BROWSER_MIRROR_CONFIG.url);
  const [renderMode, setRenderMode] = useState<'auto' | 'webview' | 'stream'>('auto');
  const [copied, setCopied] = useState(false);
  const [recentLinks, setRecentLinks] = useState<string[]>([]);
  const [clipboardError, setClipboardError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  // Sync with currentUrl prop
  useEffect(() => {
    if (currentUrl) {
      setUrl(currentUrl);
    }
  }, [currentUrl]);

  // Load recent links from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECENT_LINKS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentLinks(parsed.filter((item) => typeof item === 'string'));
        }
      }
    } catch (e) {
      console.warn('Failed to load recent mirror links:', e);
    }
  }, []);

  const saveRecentLink = (linkToSave: string) => {
    const trimmed = linkToSave.trim();
    if (!trimmed || trimmed.toLowerCase() === 'demo') return;
    try {
      const next = [trimmed, ...recentLinks.filter((item) => item !== trimmed)].slice(0, 8);
      setRecentLinks(next);
      localStorage.setItem(STORAGE_KEY_RECENT_LINKS, JSON.stringify(next));
    } catch (e) {
      // ignore
    }
  };

  const handlePasteFromClipboard = async () => {
    setClipboardError(null);
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setUrl(text.trim());
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          return;
        }
      }
      setClipboardError('Clipboard is empty or permissions were not granted.');
    } catch (err: any) {
      setClipboardError('Clipboard access denied. Please paste directly (Ctrl+V / Cmd+V).');
    }
  };

  const handleConnect = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    saveRecentLink(trimmed);
    onStartBrowserMirror(trimmed, renderMode);
    onClose();
  };

  const handleSelectPreset = (preset: BrowserMirrorPreset) => {
    setUrl(preset.defaultUrl);
    setRenderMode(preset.recommendedMode);
  };

  const isCurrentActive = isActive && (sourceMode === 'browser_mirror_url' || sourceMode === 'network_ip');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#121212] border border-[#2a2a2a] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden font-mono">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222] bg-[#161616]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#00ffcc15] border border-[#00ffcc33] text-[#00ffcc]">
              <Globe size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white uppercase tracking-wider">
                  Browser Screen Mirror
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00ffcc22] text-[#00ffcc] border border-[#00ffcc44]">
                  URL / LINK
                </span>
              </div>
              <p className="text-xs text-[#888] mt-0.5">
                Paste any screen mirror link to view your mobile or computer screen in the browser
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#1e1e1e] hover:bg-[#2a2a2a] text-[#aaa] hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Main URL Input Card */}
          <div className="bg-[#181818] border border-[#2f2f2f] rounded-xl p-4.5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <Link size={14} className="text-[#00ffcc]" />
                <span>SCREEN MIRROR LINK / URL</span>
              </label>

              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="px-2.5 py-1 rounded bg-[#222] hover:bg-[#2c2c2c] border border-[#3a3a3a] text-[11px] text-[#00ffcc] hover:text-[#33ffdd] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check size={13} className="text-[#00ffcc]" /> : <Clipboard size={13} />}
                <span>{copied ? 'PASTED!' : 'PASTE FROM CLIPBOARD'}</span>
              </button>
            </div>

            {/* Input Row */}
            <div className="relative flex items-center">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="e.g. http://192.168.1.100:8080 or https://vdo.ninja/?view=..."
                className="w-full bg-[#111] border border-[#383838] focus:border-[#00ffcc] rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-[#555] outline-none shadow-inner pr-24"
                autoFocus
              />

              {url && (
                <button
                  type="button"
                  onClick={() => setUrl('')}
                  className="absolute right-3 p-1 rounded-md text-[#666] hover:text-white hover:bg-[#222] cursor-pointer text-xs"
                >
                  CLEAR
                </button>
              )}
            </div>

            {clipboardError && (
              <p className="text-[11px] text-[#ffaa00] flex items-center gap-1.5">
                <Info size={12} />
                <span>{clipboardError}</span>
              </p>
            )}

            {/* Quick URL Helpers */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] text-[#777]">
              <span>Quick Prefixes:</span>
              <button
                type="button"
                onClick={() => setUrl('http://192.168.1.')}
                className="px-2 py-0.5 rounded bg-[#222] hover:bg-[#2c2c2c] text-[#bbb] hover:text-[#00ffcc] border border-[#333] cursor-pointer"
              >
                http://192.168.1.
              </button>
              <button
                type="button"
                onClick={() => setUrl('http://192.168.0.')}
                className="px-2 py-0.5 rounded bg-[#222] hover:bg-[#2c2c2c] text-[#bbb] hover:text-[#00ffcc] border border-[#333] cursor-pointer"
              >
                http://192.168.0.
              </button>
              <button
                type="button"
                onClick={() => setUrl('http://localhost:8080')}
                className="px-2 py-0.5 rounded bg-[#222] hover:bg-[#2c2c2c] text-[#bbb] hover:text-[#00ffcc] border border-[#333] cursor-pointer"
              >
                http://localhost:8080
              </button>
              <button
                type="button"
                onClick={() => {
                  setUrl('http://demo:8080/screen-mirror');
                  setRenderMode('auto');
                }}
                className="px-2 py-0.5 rounded bg-[#ffcc0015] hover:bg-[#ffcc0028] text-[#ffcc00] border border-[#ffcc0044] cursor-pointer flex items-center gap-1"
              >
                <Sparkles size={10} />
                <span>Test Demo Link</span>
              </button>
            </div>
          </div>

          {/* Render Mode Selector */}
          <div className="bg-[#181818] border border-[#2f2f2f] rounded-xl p-4 space-y-2.5">
            <label className="text-xs font-bold text-[#ccc] block">
              PLAYBACK / MIRROR RENDERING ENGINE
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRenderMode('auto')}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  renderMode === 'auto'
                    ? 'bg-[#00ffcc15] border-[#00ffcc] text-white shadow-[0_0_12px_rgba(0,255,204,0.15)]'
                    : 'bg-[#131313] border-[#2c2c2c] text-[#888] hover:text-[#ccc] hover:border-[#3a3a3a]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#00ffcc]">Smart Auto</span>
                  <Radio size={12} className={renderMode === 'auto' ? 'text-[#00ffcc]' : 'text-[#555]'} />
                </div>
                <p className="text-[10.5px] leading-tight text-[#999]">
                  Auto-detects stream vs web mirror for optimal performance.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRenderMode('webview')}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  renderMode === 'webview'
                    ? 'bg-[#00ffcc15] border-[#00ffcc] text-white shadow-[0_0_12px_rgba(0,255,204,0.15)]'
                    : 'bg-[#131313] border-[#2c2c2c] text-[#888] hover:text-[#ccc] hover:border-[#3a3a3a]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">Browser Mirror</span>
                  <Globe size={12} className={renderMode === 'webview' ? 'text-[#00ffcc]' : 'text-[#555]'} />
                </div>
                <p className="text-[10.5px] leading-tight text-[#999]">
                  Embedded interactive web mirror with aspect controls & filters.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRenderMode('stream')}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  renderMode === 'stream'
                    ? 'bg-[#00ffcc15] border-[#00ffcc] text-white shadow-[0_0_12px_rgba(0,255,204,0.15)]'
                    : 'bg-[#131313] border-[#2c2c2c] text-[#888] hover:text-[#ccc] hover:border-[#3a3a3a]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">Direct Canvas Stream</span>
                  <Zap size={12} className={renderMode === 'stream' ? 'text-[#00ffcc]' : 'text-[#555]'} />
                </div>
                <p className="text-[10.5px] leading-tight text-[#999]">
                  Ultra-low latency canvas pipeline with RTX post-processing.
                </p>
              </button>
            </div>
          </div>

          {/* Preset Screen Mirror Apps */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#aaa] uppercase tracking-wider">
                Popular Screen Mirror Presets
              </span>
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-[11px] text-[#00ffcc] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle size={12} />
                <span>{showGuide ? 'Hide App Guide' : 'How to get a link?'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BROWSER_MIRROR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    url === preset.defaultUrl
                      ? 'bg-[#00ffcc10] border-[#00ffcc] text-white'
                      : 'bg-[#161616] hover:bg-[#1f1f1f] border-[#292929] hover:border-[#3f3f3f] text-[#bbb]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Smartphone size={13} className="text-[#00ffcc]" />
                      <span>{preset.name}</span>
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#262626] text-[#00ffcc] border border-[#3a3a3a]">
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-[#777] leading-relaxed mb-2">
                    {preset.description}
                  </p>
                  <span className="text-[10px] font-mono text-[#00ffcc] truncate block bg-[#111] px-2 py-1 rounded border border-[#222]">
                    {preset.defaultUrl}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Setup Guide Accordion */}
          {showGuide && (
            <div className="p-4 bg-[#151a18] border border-[#00ffcc33] rounded-xl text-xs space-y-2.5 text-[#ddd] animate-fadeIn">
              <div className="flex items-center gap-2 font-bold text-[#00ffcc]">
                <Info size={15} />
                <span>How to broadcast your screen and copy the link:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-[#bbb] leading-relaxed pl-1">
                <li>
                  <strong className="text-white">Android / iPhone (Screen Stream App):</strong> Download "Screen Stream over HTTP" from Google Play / App Store, tap <strong className="text-white">START</strong>, and copy the IP link displayed on your phone screen (e.g. <code className="text-[#00ffcc]">http://192.168.1.100:8080</code>).
                </li>
                <li>
                  <strong className="text-white">VDO.Ninja (Zero Install WebRTC):</strong> Open <a href="https://vdo.ninja" target="_blank" rel="noreferrer" className="text-[#00ffcc] underline">vdo.ninja</a> on your phone, select <strong className="text-white">Share your screen</strong>, and copy the Viewer Link into this input.
                </li>
                <li>
                  <strong className="text-white">Same Wi-Fi Connection:</strong> Ensure both your phone and this computer are connected to the same local Wi-Fi router.
                </li>
                <li>
                  <strong className="text-white">Direct Stream Link:</strong> If using IP Webcam or OBS, you can paste the direct stream link (<code className="text-[#00ffcc]">/video</code> or <code className="text-[#00ffcc]">/live</code>).
                </li>
              </ol>
            </div>
          )}

          {/* Recent Links History */}
          {recentLinks.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-[#777]">
                <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                  <History size={12} />
                  <span>Recently Used Mirror Links</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setRecentLinks([]);
                    localStorage.removeItem(STORAGE_KEY_RECENT_LINKS);
                  }}
                  className="hover:text-[#ff3366] text-[10px] cursor-pointer"
                >
                  Clear History
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentLinks.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setUrl(item)}
                    className="px-2.5 py-1 rounded-lg bg-[#181818] hover:bg-[#222] border border-[#2e2e2e] hover:border-[#00ffcc] text-[10.5px] font-mono text-[#ccc] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Link size={10} className="text-[#00ffcc]" />
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#222] bg-[#161616]">
          {isCurrentActive ? (
            <button
              type="button"
              onClick={() => {
                onStopStream();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl bg-[#ff3366]/20 hover:bg-[#ff3366]/30 text-[#ff3366] border border-[#ff3366]/40 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <StopCircle size={15} />
              <span>DISCONNECT MIRROR</span>
            </button>
          ) : (
            <div className="text-[11px] text-[#666] flex items-center gap-1.5">
              <Wifi size={13} className="text-[#00ffcc]" />
              <span>Zero-lag direct browser mirror</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#222] hover:bg-[#2c2c2c] text-[#ccc] hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              CANCEL
            </button>

            <button
              type="button"
              onClick={handleConnect}
              disabled={!url.trim() || isLoading}
              className="px-5 py-2.5 rounded-xl bg-[#00ffcc] hover:bg-[#00e6b8] text-black text-xs font-black tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,204,0.4)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>CONNECTING...</span>
                </>
              ) : (
                <>
                  <Play size={15} className="fill-current" />
                  <span>CONNECT & MIRROR</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
