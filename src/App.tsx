/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Camera, Video, Settings, AlertCircle } from 'lucide-react';

interface ResolutionConfig {
  label: string;
  width: number;
  height: number;
  frameRate: number;
}

const configs: Record<string, ResolutionConfig> = {
  '4k60': { label: '4K @ 60fps', width: 3840, height: 2160, frameRate: 60 },
  '1080p120': { label: '1080p @ 120fps', width: 1920, height: 1080, frameRate: 120 },
  '720p144': { label: '720p @ 144fps', width: 1280, height: 720, frameRate: 144 },
};

export default function App() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [selectedConfig, setSelectedConfig] = useState<string>('1080p120');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function getDevices() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        setDevices(allDevices.filter(d => d.kind === 'videoinput'));
      } catch (err) {
        setError('Failed to access camera. Please allow permissions.');
      }
    }
    getDevices();
  }, []);

  const startStream = async () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    
    const config = configs[selectedConfig];
    const constraints = {
      video: {
        deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
        width: { ideal: config.width },
        height: { ideal: config.height },
        frameRate: { ideal: config.frameRate },
      },
    };

    try {
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setError(null);
    } catch (err) {
      setError('Failed to start stream with selected settings.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 text-[#e0e0e0] font-sans">
      <header className="flex items-center justify-between px-6 py-3 bg-[#111] border-b border-[#222] mb-6">
        <h1 className="text-sm font-bold tracking-widest uppercase text-white">zerozonecapturedevice</h1>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-[#0f0f0f] p-4 rounded border border-[#222]">
            <label className="text-[10px] uppercase font-bold text-[#666] mb-2 tracking-widest block">Device</label>
            <select 
              className="bg-[#1a1a1a] text-xs font-medium focus:outline-none cursor-pointer text-[#00ffcc] w-full p-2 rounded border border-[#333]"
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
            >
              <option value="">Select a device</option>
              {devices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0,5)}`}</option>)}
            </select>
          </div>
          
          <div className="bg-[#0f0f0f] p-4 rounded border border-[#222]">
            <label className="text-[10px] uppercase font-bold text-[#666] mb-2 tracking-widest block">Resolution/FPS</label>
            <select 
              className="bg-[#1a1a1a] text-xs font-medium focus:outline-none cursor-pointer text-[#00ffcc] w-full p-2 rounded border border-[#333]"
              value={selectedConfig}
              onChange={(e) => setSelectedConfig(e.target.value)}
            >
              {Object.entries(configs).map(([key, config]) => <option key={key} value={key}>{config.label}</option>)}
            </select>
          </div>
          
          <button 
            onClick={startStream}
            className="w-full bg-[#00ffcc] text-black text-xs font-bold py-2 rounded shadow-[0_0_10px_rgba(0,255,204,0.3)] hover:bg-[#00e6b8] transition-colors"
          >
            Start Capture
          </button>
        </div>
        
        <div className="md:col-span-3 bg-black rounded border border-[#222] aspect-video flex items-center justify-center relative overflow-hidden">
          {error ? (
            <div className="text-red-500 flex items-center gap-2">
              <AlertCircle /> {error}
            </div>
          ) : stream ? (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
          ) : (
            <div className="text-[#555] flex flex-col items-center">
              <Video size={48} className="mb-2" />
              <p className="text-xs uppercase tracking-widest">No stream active</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
