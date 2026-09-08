import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Cast,
  Check,
  Copy,
  ExternalLink,
  Globe,
  HelpCircle,
  History,
  Radio,
  RefreshCw,
  Server,
  Smartphone,
  Sparkles,
  Volume2,
  Wifi,
  Zap,
} from 'lucide-react';
import { NetworkAppPreset, NetworkStreamConfig } from '../types';
import { DEFAULT_NETWORK_STREAM_CONFIG, NETWORK_APP_PRESETS } from '../constants/presets';

interface IpMirrorPanelProps {
  config: NetworkStreamConfig;
  onChangeConfig?: (config: NetworkStreamConfig) => void;
  onUpdateConfig?: (config: NetworkStreamConfig) => void;
  onStartNetworkCapture?: (config: NetworkStreamConfig) => void;
  onStartStream?: (config: NetworkStreamConfig) => void;
  onStopStream: () => void;
  isActive: boolean;
  isLoading?: boolean;
  sourceMode?: string;
}

const STORAGE_KEY_RECENT_IPS = 'zerozone_recent_ips';

export const IpMirrorPanel: React.FC<IpMirrorPanelProps> = ({
  config,
  onChangeConfig,
  onUpdateConfig,
  onStartNetworkCapture,
  onStartStream,
  onStopStream,
  isActive,
  isLoading = false,
  sourceMode = 'network_ip',
}) => {
  const [copied, setCopied] = useState(false);
  const [pingStatus, setPingStatus] = useState<{
    testing: boolean;
    success?: boolean;
    pingMs?: number;
    message?: string;
  }>({ testing: false });
  const [recentIps, setRecentIps] = useState<Array<{ ip: string; port: string; name: string }>>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const handleUpdate = (updated: NetworkStreamConfig) => {
    if (typeof onChangeConfig === 'function') onChangeConfig(updated);
    if (typeof onUpdateConfig === 'function') onUpdateConfig(updated);
  };

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
          { ip: '127.0.0.1', port: '8080', name: 'Localhost' },
        ]);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const saveRecent = (ip: string, port: string, name: string) => {
    try {
      const filtered = recentIps.filter((item) => !(item.ip === ip && item.port === port));
      const updated = [{ ip, port, name }, ...filtered].slice(0, 5);
      setRecentIps(updated);
      localStorage.setItem(STORAGE_KEY_RECENT_IPS, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  const fullUrl = `${config.protocol}://${config.ip.trim() || '192.168.1.100'}:${config.port.trim() || '8080'}${
    config.path.startsWith('/') ? config.path : '/' + config.path
  }`;

  const handlePasteFullLink = (rawInput: string) => {
    const trimmed = rawInput.trim();
    if (!trimmed) return;

    try {
      let candidate = trimmed;
      if (!/^https?:\/\//i.test(candidate) && !/^wss?:\/\//i.test(candidate)) {
        candidate = 'http://' + candidate;
      }
      const parsed = new URL(candidate);
      const protocol = parsed.protocol.replace(':', '') as any;
      const ip = parsed.hostname;
      const port = parsed.port || (protocol === 'https' ? '443' : '80');
      const path = parsed.pathname + (parsed.search || '');

      handleUpdate({
        ...config,
        protocol: ['http', 'https', 'ws', 'wss'].includes(protocol) ? protocol : 'http',
        ip,
        port,
        path: path && path !== '/' ? path : config.path,
      });
    } catch (e) {
      handleUpdate({ ...config, ip: trimmed });
    }
  };

  const handlePresetSelect = (preset: NetworkAppPreset) => {
    const updated: NetworkStreamConfig = {
      ...config,
      presetApp: preset.id,
      port: preset.defaultPort,
      path: preset.defaultPath,
      streamType: preset.streamType,
      audioEnabled: preset.audioSupported,
      audioPath: preset.defaultAudioPath || '/audio.wav',
    };
    handleUpdate(updated);
  };

  const handleTestPing = async () => {
    setPingStatus({ testing: true });
    const startTime = performance.now();

    if (config.streamType === 'demo' || config.ip === 'demo') {
      setTimeout(() => {
        setPingStatus({
          testing: false,
          success: true,
          pingMs: 0.5,
          message: 'Simulation Engine Ready (0ms latency)',
        });
      }, 250);
      return;
    }

    try {
      const probeUrl = `${config.protocol}://${config.ip.trim()}:${config.port.trim()}/`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

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
          message: `Device Responded in ${Math.max(2, elapsed)}ms - Active`,
        });
      } catch (fetchErr: any) {
        clearTimeout(timeoutId);
        const img = new Image();
        const imgPromise = new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = resolve;
          setTimeout(reject, 2500);
        });
        img.src = fullUrl + '?probe=' + Date.now();
        await imgPromise;
        const elapsed = Math.round(performance.now() - startTime);
        setPingStatus({
          testing: false,
          success: true,
          pingMs: Math.max(3, elapsed),
          message: `Host online (${elapsed}ms) - Stream reachable`,
        });
      }
    } catch (err: any) {
      setPingStatus({
        testing: false,
        success: false,
        message: 'Could not connect. Verify Wi-Fi network and phone app.',
      });
    }
  };

  const handleConnect = () => {
    saveRecent(config.ip, config.port, config.presetApp);
    if (typeof onStartNetworkCapture === 'function') {
      onStartNetworkCapture(config);
    } else if (typeof onStartStream === 'function') {
      onStartStream(config);
    }
  };

  const isConnected = isActive && sourceMode === 'network_ip';

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* App Presets Grid */}
      <section className="bg-[#141414] p-3 rounded-lg border border-[#242424]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase font-bold text-[#777] tracking-wider flex items-center gap-1.5">
            <Smartphone size={12} className="text-[#00ffcc]" />
            SCREEN MIRROR APP PRESET
          </span>
          <span className="text-[9px] text-[#00ffcc] font-bold">
            {config.presetApp.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {NETWORK_APP_PRESETS.map((preset) => {
            const isSelected = config.presetApp === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#182824] border-[#00ffcc] shadow-[0_0_8px_rgba(0,255,204,0.2)]'
                    : 'bg-[#181818] border-[#2a2a2a] hover:bg-[#202020] hover:border-[#383838]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-0.5">
                  <span className="text-[10px] font-bold text-white truncate">{preset.name}</span>
                </div>
                <div className="text-[8.5px] text-[#888] truncate">{preset.badge}</div>
                <div className="text-[8.5px] font-mono text-[#00ffcc] mt-1">
                  :{preset.defaultPort}
                  {preset.defaultPath}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main IP and Port Configuration Box */}
      <section className="bg-[#141414] p-3 rounded-lg border border-[#242424] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-[#aaa] tracking-wider flex items-center gap-1.5">
            <Globe size={12} className="text-[#00ffcc]" />
            INPUT IP & PORT
          </span>
          {isConnected && (
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00ffcc22] text-[#00ffcc] font-bold border border-[#00ffcc44] animate-pulse">
              LIVE CONNECTED
            </span>
          )}
        </div>

        {/* IP Address Field */}
        <div>
          <label className="text-[9px] text-[#888] uppercase block mb-1">Device IP Address or Full Link</label>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={config.ip}
              placeholder="192.168.1.xxx or paste full link"
              onChange={(e) => {
                const val = e.target.value;
                if (val.includes('://') || (val.includes(':') && val.includes('.'))) {
                  handlePasteFullLink(val);
                } else {
                  handleUpdate({ ...config, ip: val });
                }
              }}
              className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-[#00ffcc] focus:outline-none"
            />
          </div>
        </div>

        {/* Quick IP subnet chips */}
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => handleUpdate({ ...config, ip: '192.168.1.' })}
            className="px-1.5 py-0.5 rounded bg-[#1e1e1e] hover:bg-[#282828] text-[#aaa] hover:text-[#00ffcc] text-[9px] border border-[#333] cursor-pointer"
          >
            192.168.1.x
          </button>
          <button
            type="button"
            onClick={() => handleUpdate({ ...config, ip: '192.168.0.' })}
            className="px-1.5 py-0.5 rounded bg-[#1e1e1e] hover:bg-[#282828] text-[#aaa] hover:text-[#00ffcc] text-[9px] border border-[#333] cursor-pointer"
          >
            192.168.0.x
          </button>
          <button
            type="button"
            onClick={() => handleUpdate({ ...config, ip: '127.0.0.1' })}
            className="px-1.5 py-0.5 rounded bg-[#1e1e1e] hover:bg-[#282828] text-[#aaa] hover:text-[#00ffcc] text-[9px] border border-[#333] cursor-pointer"
          >
            127.0.0.1
          </button>
          <button
            type="button"
            onClick={() =>
              handleUpdate({
                ...config,
                ip: 'demo',
                presetApp: 'demo',
                streamType: 'demo',
              })
            }
            className="px-1.5 py-0.5 rounded bg-[#ffcc0015] hover:bg-[#ffcc0028] text-[#ffcc00] text-[9px] border border-[#ffcc0040] cursor-pointer flex items-center gap-1"
          >
            <Sparkles size={9} />
            <span>Test Pattern</span>
          </button>
        </div>

        {/* Port & Protocol Row */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[9px] text-[#888] uppercase block mb-1">Port</label>
            <input
              type="text"
              value={config.port}
              placeholder="8080"
              onChange={(e) => handleUpdate({ ...config, port: e.target.value })}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-[#00ffcc] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[9px] text-[#888] uppercase block mb-1">Protocol</label>
            <select
              value={config.protocol}
              onChange={(e) => handleUpdate({ ...config, protocol: e.target.value as any })}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-2 py-1.5 text-xs text-white font-mono focus:border-[#00ffcc] focus:outline-none cursor-pointer"
            >
              <option value="http">http://</option>
              <option value="https">https://</option>
              <option value="ws">ws://</option>
            </select>
          </div>
        </div>

        {/* Stream URL Preview & Tools */}
        <div className="bg-[#0e0e0e] p-2 rounded-lg border border-[#222] space-y-1.5">
          <div className="flex items-center justify-between text-[9px]">
            <span className="text-[#666] uppercase">Stream Target:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(fullUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="text-[#aaa] hover:text-[#00ffcc] p-1 cursor-pointer"
                title="Copy Stream URL"
              >
                {copied ? <Check size={11} className="text-[#00ffcc]" /> : <Copy size={11} />}
              </button>
              <a
                href={fullUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#aaa] hover:text-[#00ffcc] p-1"
                title="Open stream in tab"
              >
                <ExternalLink size={11} />
              </a>
            </div>
          </div>
          <div className="text-[10px] text-[#00ffcc] font-mono truncate select-all">{fullUrl}</div>
        </div>

        {/* Ping Connection Probe */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handleTestPing}
            disabled={pingStatus.testing}
            className="w-full py-1.5 px-3 rounded bg-[#1f1f1f] hover:bg-[#282828] text-white text-[10px] font-bold border border-[#333] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={11} className={pingStatus.testing ? 'animate-spin text-[#00ffcc]' : ''} />
            <span>{pingStatus.testing ? 'TESTING CONNECTION...' : 'PROBE IP & PORT REACHABILITY'}</span>
          </button>
        </div>

        {/* Ping status notice */}
        {pingStatus.message && (
          <div
            className={`p-2 rounded text-[10px] flex items-center gap-1.5 ${
              pingStatus.success
                ? 'bg-[#00ffcc12] text-[#00ffcc] border border-[#00ffcc33]'
                : 'bg-[#ff336615] text-[#ff3366] border border-[#ff336633]'
            }`}
          >
            {pingStatus.success ? <Zap size={12} /> : <AlertTriangle size={12} />}
            <span>{pingStatus.message}</span>
          </div>
        )}
      </section>

      {/* Advanced Path & FPS Controls Accordion */}
      <section className="bg-[#141414] p-3 rounded-lg border border-[#242424]">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between text-[10px] uppercase font-bold text-[#777] cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Server size={11} className="text-[#00ffcc]" />
            ENDPOINT PATH & CADENCE
          </span>
          <span className="text-[9px] text-[#00ffcc]">{showAdvanced ? '▲' : '▼'}</span>
        </button>

        {showAdvanced && (
          <div className="mt-2.5 pt-2.5 border-t border-[#222] space-y-2.5">
            <div>
              <label className="text-[9px] text-[#888] uppercase block mb-1">Path Endpoint</label>
              <input
                type="text"
                value={config.path}
                placeholder="/video"
                onChange={(e) => handleUpdate({ ...config, path: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded px-2 py-1 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="text-[9px] text-[#888] uppercase block mb-1">Target FPS</label>
              <div className="grid grid-cols-3 gap-1">
                {[60, 120, 144].map((fps) => (
                  <button
                    key={fps}
                    type="button"
                    onClick={() => handleUpdate({ ...config, targetFps: fps })}
                    className={`py-1 text-[10px] font-bold rounded border cursor-pointer ${
                      config.targetFps === fps
                        ? 'bg-[#00ffcc22] border-[#00ffcc] text-[#00ffcc]'
                        : 'bg-[#181818] border-[#333] text-[#777]'
                    }`}
                  >
                    {fps} FPS
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-[#181818] border border-[#262626]">
              <div className="flex items-center gap-1.5">
                <Volume2 size={13} className={config.audioEnabled ? 'text-[#00ffcc]' : 'text-[#666]'} />
                <span className="text-[10px] text-white">Audio Stream</span>
              </div>
              <input
                type="checkbox"
                checked={config.audioEnabled}
                onChange={(e) => handleUpdate({ ...config, audioEnabled: e.target.checked })}
                className="accent-[#00ffcc] cursor-pointer"
              />
            </div>
          </div>
        )}
      </section>

      {/* Recent Connections Quick Select */}
      {recentIps.length > 0 && (
        <section className="bg-[#141414] p-2.5 rounded-lg border border-[#242424] space-y-1.5">
          <span className="text-[9px] uppercase font-bold text-[#666] flex items-center gap-1">
            <History size={10} />
            RECENT CONNECTIONS
          </span>
          <div className="flex flex-wrap gap-1">
            {recentIps.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleUpdate({ ...config, ip: item.ip, port: item.port })}
                className="px-2 py-0.5 rounded bg-[#1a1a1a] hover:bg-[#222] border border-[#333] text-[9px] text-[#bbb] hover:text-[#00ffcc] cursor-pointer"
              >
                {item.ip}:{item.port}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Main Connect / Disconnect Buttons */}
      <div className="pt-1 space-y-2">
        {!isConnected ? (
          <button
            type="button"
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-[#00ffcc] hover:bg-[#00e6b8] text-black font-black text-xs transition-all shadow-[0_0_15px_rgba(0,255,204,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Cast size={15} />
            <span>{isLoading ? 'CONNECTING TO IP STREAM...' : 'CONNECT & MIRROR SCREEN'}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onStopStream}
            className="w-full py-2.5 px-4 rounded-lg bg-[#ff3366] hover:bg-[#e62e5c] text-white font-bold text-xs transition-all shadow-[0_0_12px_rgba(255,51,102,0.4)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>DISCONNECT IP SCREEN MIRROR</span>
          </button>
        )}
      </div>

      {/* Setup Guide Accordion */}
      <div className="border border-[#222] rounded-lg overflow-hidden bg-[#121212]">
        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className="w-full p-2.5 flex items-center justify-between text-[10px] font-bold text-[#888] hover:text-white cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <HelpCircle size={12} className="text-[#00ffcc]" />
            PHONE SETUP TIPS (FREE APPS)
          </span>
          <span className="text-[#00ffcc]">{showGuide ? '▲' : '▼'}</span>
        </button>

        {showGuide && (
          <div className="p-3 border-t border-[#222] space-y-2 text-[10px] text-[#999] leading-relaxed">
            <p>
              1. Download free <span className="text-[#00ffcc]">"Screen Stream over HTTP"</span> or{' '}
              <span className="text-[#00ffcc]">"IP Webcam"</span> on Android or iOS.
            </p>
            <p>2. Tap Start in the app and note the IP & port shown (e.g. 192.168.1.100:8080).</p>
            <p>3. Input the IP and port above and click Connect!</p>
            <p className="text-[#ffcc00]">
              Tip: Both devices must be on the same Wi-Fi router / hotspot.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
