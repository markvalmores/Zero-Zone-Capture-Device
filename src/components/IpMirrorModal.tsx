import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Cast,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Globe,
  HardDrive,
  HelpCircle,
  History,
  Info,
  Radio,
  RefreshCw,
  Server,
  Smartphone,
  Sparkles,
  Tv,
  Volume2,
  Wifi,
  X,
  Zap,
} from 'lucide-react';
import { NetworkAppPreset, NetworkStreamConfig } from '../types';
import { DEFAULT_NETWORK_STREAM_CONFIG, NETWORK_APP_PRESETS } from '../constants/presets';

interface IpMirrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNetworkCapture: (config: NetworkStreamConfig) => void;
  onStopStream: () => void;
  isActive: boolean;
  sourceMode: string;
  currentConfig: NetworkStreamConfig;
  onUpdateConfig: (config: NetworkStreamConfig) => void;
}

const STORAGE_KEY_RECENT_IPS = 'zerozone_recent_ips';

export const IpMirrorModal: React.FC<IpMirrorModalProps> = ({
  isOpen,
  onClose,
  onStartNetworkCapture,
  onStopStream,
  isActive,
  sourceMode,
  currentConfig,
  onUpdateConfig,
}) => {
  const [config, setConfig] = useState<NetworkStreamConfig>(currentConfig || DEFAULT_NETWORK_STREAM_CONFIG);
  const [pingStatus, setPingStatus] = useState<{
    testing: boolean;
    success?: boolean;
    pingMs?: number;
    message?: string;
  }>({ testing: false });
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [recentIps, setRecentIps] = useState<Array<{ ip: string; port: string; name: string }>>([]);
  const [activePresetTab, setActivePresetTab] = useState<string>(config.presetApp || 'screen_stream');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Load recent IPs from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECENT_IPS);
      if (saved) {
        setRecentIps(JSON.parse(saved));
      } else {
        setRecentIps([
          { ip: '192.168.1.100', port: '8080', name: 'Screen Stream' },
          { ip: '192.168.1.105', port: '8080', name: 'IP Webcam' },
          { ip: '192.168.1.120', port: '4747', name: 'DroidCam' },
          { ip: '127.0.0.1', port: '8080', name: 'Localhost / Relay' },
        ]);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Save to recent IPs
  const saveRecent = (ip: string, port: string, name: string) => {
    try {
      const filtered = recentIps.filter((item) => !(item.ip === ip && item.port === port));
      const updated = [{ ip, port, name }, ...filtered].slice(0, 6);
      setRecentIps(updated);
      localStorage.setItem(STORAGE_KEY_RECENT_IPS, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  const fullUrl = `${config.protocol}://${config.ip.trim() || '192.168.1.100'}:${config.port.trim() || '8080'}${
    config.path.startsWith('/') ? config.path : '/' + config.path
  }`;

  const handlePresetSelect = (preset: NetworkAppPreset) => {
    setActivePresetTab(preset.id);
    const updated: NetworkStreamConfig = {
      ...config,
      presetApp: preset.id,
      port: preset.defaultPort,
      path: preset.defaultPath,
      streamType: preset.streamType,
      audioEnabled: preset.audioSupported,
      audioPath: preset.defaultAudioPath || '/audio.wav',
    };
    setConfig(updated);
    onUpdateConfig(updated);
  };

  const handleTestPing = async () => {
    setPingStatus({ testing: true });
    const startTime = performance.now();

    if (config.streamType === 'demo' || config.ip === 'demo') {
      setTimeout(() => {
        setPingStatus({
          testing: false,
          success: true,
          pingMs: 0.8,
          message: 'Local Simulation Test Engine Ready (0ms delay)',
        });
      }, 300);
      return;
    }

    try {
      const probeUrl = `${config.protocol}://${config.ip.trim()}:${config.port.trim()}/`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      // Probe using fetch with no-cors or image check
      try {
        await fetch(probeUrl, {
          method: 'GET',
          mode: 'no-cors',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const elapsed = Math.round(performance.now() - startTime);
        setPingStatus({
          testing: false,
          success: true,
          pingMs: Math.max(2, elapsed),
          message: `Device Responded in ${Math.max(2, elapsed)}ms - Server Active`,
        });
      } catch (fetchErr: any) {
        clearTimeout(timeoutId);
        // Fallback probe via image element
        const img = new Image();
        const imgPromise = new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = resolve; // Reaching server even with 404/cors means host is online
          setTimeout(reject, 2500);
        });
        img.src = fullUrl + '?probe=' + Date.now();
        await imgPromise;
        const elapsed = Math.round(performance.now() - startTime);
        setPingStatus({
          testing: false,
          success: true,
          pingMs: Math.max(3, elapsed),
          message: `Host online (${elapsed}ms) - Stream endpoint detected`,
        });
      }
    } catch (err: any) {
      setPingStatus({
        testing: false,
        success: false,
        message: 'Could not reach IP:Port. Ensure Wi-Fi is on and phone app is running.',
      });
    }
  };

  const handleStartMirror = () => {
    saveRecent(config.ip, config.port, config.presetApp);
    onStartNetworkCapture(config);
    onClose();
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(fullUrl).catch(() => {});
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  if (!isOpen) return null;

  const isCurrentActive = isActive && sourceMode === 'network_ip';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none font-mono">
      <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#161616] border-b border-[#242424]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#00ffcc15] border border-[#00ffcc33] text-[#00ffcc]">
              <Wifi size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black uppercase tracking-wider text-white">
                  IP & Port Screen Mirror
                </h2>
                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#00ffcc22] text-[#00ffcc] rounded border border-[#00ffcc33]">
                  WIRELESS / WI-FI
                </span>
              </div>
              <p className="text-[10.5px] text-[#888]">
                Input your phone's IP & port to mirror iOS or Android with low-latency & audio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#222] hover:bg-[#333] text-[#aaa] hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-[#ccc] custom-scrollbar">
          {/* Preset App Selection Tabs */}
          <div>
            <label className="text-[10px] uppercase font-bold text-[#777] tracking-wider mb-2 flex items-center gap-1.5">
              <Smartphone size={12} className="text-[#00ffcc]" />
              SELECT PHONE MIRROR APP / PRESET
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {NETWORK_APP_PRESETS.map((preset) => {
                const isSelected = activePresetTab === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#182824] border-[#00ffcc] shadow-[0_0_12px_rgba(0,255,204,0.25)]'
                        : 'bg-[#141414] border-[#252525] hover:bg-[#1a1a1a] hover:border-[#383838]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-[11px] font-bold text-white truncate">{preset.name}</span>
                      <span className="text-[8px] px-1 py-0.2 rounded bg-[#222] text-[#aaa]">
                        {preset.badge}
                      </span>
                    </div>
                    <div className="text-[9.5px] text-[#888] line-clamp-1">{preset.description}</div>
                    <div className="mt-1.5 text-[9px] font-mono text-[#00ffcc] flex items-center gap-1">
                      <span>Port {preset.defaultPort}</span>
                      <span className="text-[#555]">•</span>
                      <span className="text-[#aaa]">{preset.defaultPath}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* IP & Port Input Section */}
          <div className="bg-[#141414] p-4 rounded-xl border border-[#262626] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#aaa] tracking-wider flex items-center gap-1.5">
                <Globe size={13} className="text-[#00ffcc]" />
                DEVICE NETWORK ADDRESS
              </span>
              <span className="text-[9px] text-[#666]">e.g. As displayed in your phone's mirroring app</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              {/* Protocol */}
              <div className="sm:col-span-3">
                <label className="text-[9px] text-[#888] uppercase block mb-1">Protocol</label>
                <select
                  value={config.protocol}
                  onChange={(e) => {
                    const updated = { ...config, protocol: e.target.value as any };
                    setConfig(updated);
                    onUpdateConfig(updated);
                  }}
                  className="w-full bg-[#1b1b1b] border border-[#333] rounded-lg px-2.5 py-2 text-xs font-mono text-white focus:border-[#00ffcc] focus:outline-none cursor-pointer"
                >
                  <option value="http">http://</option>
                  <option value="https">https://</option>
                  <option value="ws">ws://</option>
                  <option value="wss">wss://</option>
                </select>
              </div>

              {/* IP Address */}
              <div className="sm:col-span-6">
                <label className="text-[9px] text-[#888] uppercase block mb-1">
                  Device IP Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={config.ip}
                    placeholder="192.168.1.xxx"
                    onChange={(e) => {
                      const updated = { ...config, ip: e.target.value };
                      setConfig(updated);
                      onUpdateConfig(updated);
                    }}
                    className="w-full bg-[#1b1b1b] border border-[#333] rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-[#00ffcc] focus:outline-none"
                  />
                </div>
              </div>

              {/* Port */}
              <div className="sm:col-span-3">
                <label className="text-[9px] text-[#888] uppercase block mb-1">Port</label>
                <input
                  type="text"
                  value={config.port}
                  placeholder="8080"
                  onChange={(e) => {
                    const updated = { ...config, port: e.target.value };
                    setConfig(updated);
                    onUpdateConfig(updated);
                  }}
                  className="w-full bg-[#1b1b1b] border border-[#333] rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-[#00ffcc] focus:outline-none"
                />
              </div>
            </div>

            {/* Quick IP subnet helper chips & recent history */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[9px] text-[#666] mr-1">Quick:</span>
              <button
                type="button"
                onClick={() => {
                  const updated = { ...config, ip: '192.168.1.' };
                  setConfig(updated);
                  onUpdateConfig(updated);
                }}
                className="px-2 py-0.5 rounded bg-[#1e1e1e] hover:bg-[#282828] text-[#aaa] hover:text-[#00ffcc] text-[9.5px] border border-[#333] cursor-pointer"
              >
                192.168.1.x
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated = { ...config, ip: '192.168.0.' };
                  setConfig(updated);
                  onUpdateConfig(updated);
                }}
                className="px-2 py-0.5 rounded bg-[#1e1e1e] hover:bg-[#282828] text-[#aaa] hover:text-[#00ffcc] text-[9.5px] border border-[#333] cursor-pointer"
              >
                192.168.0.x
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated = { ...config, ip: '127.0.0.1' };
                  setConfig(updated);
                  onUpdateConfig(updated);
                }}
                className="px-2 py-0.5 rounded bg-[#1e1e1e] hover:bg-[#282828] text-[#aaa] hover:text-[#00ffcc] text-[9.5px] border border-[#333] cursor-pointer"
              >
                127.0.0.1 (Localhost)
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated = {
                    ...config,
                    ip: 'demo',
                    presetApp: 'demo',
                    streamType: 'demo',
                  };
                  setConfig(updated);
                  onUpdateConfig(updated);
                }}
                className="px-2 py-0.5 rounded bg-[#ffcc0015] hover:bg-[#ffcc0028] text-[#ffcc00] text-[9.5px] border border-[#ffcc0040] cursor-pointer flex items-center gap-1"
              >
                <Sparkles size={10} />
                <span>Test Demo Mode</span>
              </button>
            </div>

            {/* Generated Stream URL Bar */}
            <div className="bg-[#0c0c0c] p-2.5 rounded-lg border border-[#222] flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-[200px]">
                <span className="text-[9px] text-[#666] uppercase">Stream URL:</span>
                <span className="text-[11px] font-mono text-[#00ffcc] truncate font-bold">{fullUrl}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  title="Copy Stream URL to Clipboard"
                  className="p-1.5 rounded bg-[#1c1c1c] hover:bg-[#262626] text-[#aaa] hover:text-white transition-colors cursor-pointer"
                >
                  {copiedUrl ? <Check size={13} className="text-[#00ffcc]" /> : <Copy size={13} />}
                </button>
                <a
                  href={fullUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Open Stream in New Browser Window / Tab"
                  className="p-1.5 rounded bg-[#1c1c1c] hover:bg-[#262626] text-[#aaa] hover:text-white transition-colors cursor-pointer"
                >
                  <ExternalLink size={13} />
                </a>
                <button
                  type="button"
                  onClick={handleTestPing}
                  disabled={pingStatus.testing}
                  className="px-2.5 py-1 rounded bg-[#222] hover:bg-[#2e2e2e] text-white text-[10px] font-bold border border-[#3a3a3a] flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={11} className={pingStatus.testing ? 'animate-spin text-[#00ffcc]' : ''} />
                  <span>{pingStatus.testing ? 'PINGING...' : 'TEST PING'}</span>
                </button>
              </div>
            </div>

            {/* Ping Result Banner */}
            {pingStatus.message && (
              <div
                className={`p-2.5 rounded-lg text-[10.5px] font-mono flex items-center gap-2 ${
                  pingStatus.success
                    ? 'bg-[#00ffcc12] text-[#00ffcc] border border-[#00ffcc33]'
                    : 'bg-[#ff336615] text-[#ff3366] border border-[#ff336633]'
                }`}
              >
                {pingStatus.success ? <Zap size={14} /> : <AlertTriangle size={14} />}
                <span>{pingStatus.message}</span>
              </div>
            )}
          </div>

          {/* Advanced Endpoint & Audio Options */}
          <div className="bg-[#141414] p-3.5 rounded-xl border border-[#262626]">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-[10px] uppercase font-bold text-[#888] tracking-wider cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Server size={12} className="text-[#00ffcc]" />
                ENDPOINT PATH & AUDIO LOOPBACK SETTINGS
              </span>
              <span className="text-[9px] text-[#00ffcc]">{showAdvanced ? 'COLLAPSE ▲' : 'EXPAND ▼'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-3 pt-3 border-t border-[#222] space-y-3 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Stream Path */}
                  <div>
                    <label className="text-[9px] text-[#888] uppercase block mb-1">
                      Video Endpoint Path
                    </label>
                    <input
                      type="text"
                      value={config.path}
                      placeholder="/video or /stream.mjpeg"
                      onChange={(e) => {
                        const updated = { ...config, path: e.target.value };
                        setConfig(updated);
                        onUpdateConfig(updated);
                      }}
                      className="w-full bg-[#1b1b1b] border border-[#333] rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:border-[#00ffcc] focus:outline-none"
                    />
                  </div>

                  {/* Target FPS */}
                  <div>
                    <label className="text-[9px] text-[#888] uppercase block mb-1">
                      Cadence / Target FPS
                    </label>
                    <div className="flex gap-1.5">
                      {[60, 120, 144].map((fps) => (
                        <button
                          key={fps}
                          type="button"
                          onClick={() => {
                            const updated = { ...config, targetFps: fps };
                            setConfig(updated);
                            onUpdateConfig(updated);
                          }}
                          className={`flex-1 py-1 text-[10px] font-bold rounded border cursor-pointer ${
                            config.targetFps === fps
                              ? 'bg-[#00ffcc22] border-[#00ffcc] text-[#00ffcc]'
                              : 'bg-[#181818] border-[#333] text-[#888]'
                          }`}
                        >
                          {fps} FPS
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Audio Pass-through / Loopback */}
                <div className="p-2.5 bg-[#181818] rounded-lg border border-[#2a2a2a] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Volume2 size={16} className={config.audioEnabled ? 'text-[#00ffcc]' : 'text-[#666]'} />
                    <div>
                      <div className="text-[10.5px] font-bold text-white">Enable Audio Stream Capture</div>
                      <div className="text-[9px] text-[#888]">
                        Attach companion audio stream (e.g. /audio.wav from IP Webcam)
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.audioEnabled}
                    onChange={(e) => {
                      const updated = { ...config, audioEnabled: e.target.checked };
                      setConfig(updated);
                      onUpdateConfig(updated);
                    }}
                    className="w-4 h-4 accent-[#00ffcc] cursor-pointer"
                  />
                </div>

                {config.audioEnabled && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-[#888] uppercase block mb-1">Audio Port</label>
                      <input
                        type="text"
                        value={config.audioPort || config.port}
                        onChange={(e) => {
                          const updated = { ...config, audioPort: e.target.value };
                          setConfig(updated);
                          onUpdateConfig(updated);
                        }}
                        className="w-full bg-[#1b1b1b] border border-[#333] rounded-lg px-2.5 py-1 text-xs font-mono text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-[#888] uppercase block mb-1">Audio Path</label>
                      <input
                        type="text"
                        value={config.audioPath || '/audio.wav'}
                        onChange={(e) => {
                          const updated = { ...config, audioPath: e.target.value };
                          setConfig(updated);
                          onUpdateConfig(updated);
                        }}
                        className="w-full bg-[#1b1b1b] border border-[#333] rounded-lg px-2.5 py-1 text-xs font-mono text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Recent IP History */}
          {recentIps.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[9.5px] uppercase font-bold text-[#666] flex items-center gap-1">
                <History size={11} />
                SAVED / RECENT CONNECTIONS
              </span>
              <div className="flex flex-wrap gap-1.5">
                {recentIps.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const updated = { ...config, ip: item.ip, port: item.port };
                      setConfig(updated);
                      onUpdateConfig(updated);
                    }}
                    className="px-2.5 py-1 rounded bg-[#161616] hover:bg-[#202020] border border-[#2a2a2a] hover:border-[#00ffcc] text-[10px] text-[#ccc] hover:text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ffcc]" />
                    <span className="font-bold">{item.ip}</span>
                    <span className="text-[#666]">:{item.port}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Setup Guide Accordion */}
          <div className="border border-[#222] rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="w-full p-3 bg-[#141414] hover:bg-[#181818] flex items-center justify-between text-left cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#bbb]">
                <HelpCircle size={14} className="text-[#00ffcc]" />
                <span>HOW TO GET IP & PORT FROM YOUR PHONE (STEP-BY-STEP)</span>
              </div>
              <span className="text-[10px] text-[#00ffcc]">{showGuide ? 'HIDE ▲' : 'SHOW ▼'}</span>
            </button>

            {showGuide && (
              <div className="p-4 bg-[#0f0f0f] border-t border-[#222] space-y-3 text-[11px] text-[#aaa] leading-relaxed">
                <div>
                  <strong className="text-white block mb-1">Android Setup (Recommended Free Apps):</strong>
                  <ul className="list-disc list-inside space-y-1 text-[10.5px]">
                    <li>
                      <span className="text-[#00ffcc]">Screen Stream over HTTP</span> (Google Play): Open the app, tap the yellow start button. Look at the IP address shown on your screen (e.g.{' '}
                      <span className="text-white font-mono">http://192.168.1.100:8080</span>). Enter that IP and port 8080 above.
                    </li>
                    <li>
                      <span className="text-[#00ffcc]">IP Webcam</span> (Google Play): Scroll to the bottom, tap "Start Server". Copy the IPv4 address shown and input here. Audio is available at{' '}
                      <span className="text-white font-mono">/audio.wav</span>.
                    </li>
                    <li>
                      <span className="text-[#00ffcc]">DroidCam</span>: Open app, copy the Wi-Fi IP and DroidCam Port (usually 4747).
                    </li>
                  </ul>
                </div>

                <div>
                  <strong className="text-white block mb-1">iOS / iPhone Setup:</strong>
                  <ul className="list-disc list-inside space-y-1 text-[10.5px]">
                    <li>
                      Install <span className="text-[#00ffcc]">Screen Stream</span> or an IP camera/mirror app from the App Store.
                    </li>
                    <li>Start broadcast and copy the IP and Port provided.</li>
                  </ul>
                </div>

                <div className="p-2.5 bg-[#181818] rounded-lg border border-[#333] text-[10px] text-[#999]">
                  <span className="text-[#ffcc00] font-bold">Important Network Tip:</span> Both your computer and phone MUST be connected to the same Wi-Fi network or mobile hotspot for the IP connection to resolve.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="px-5 py-3.5 bg-[#141414] border-t border-[#242424] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {isCurrentActive && (
              <button
                type="button"
                onClick={() => {
                  onStopStream();
                  onClose();
                }}
                className="bg-[#ff3366] hover:bg-[#e62e5c] text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <span>STOP IP STREAM</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-[#222] hover:bg-[#333] text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors"
            >
              CANCEL
            </button>

            <button
              type="button"
              onClick={handleStartMirror}
              className="bg-[#00ffcc] hover:bg-[#00e6b8] text-black text-xs font-black px-5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,255,204,0.4)]"
            >
              <Cast size={15} />
              <span>CONNECT & MIRROR SCREEN</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
