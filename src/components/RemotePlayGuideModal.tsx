import React from 'react';
import {
  Cast,
  Gamepad2,
  HelpCircle,
  Smartphone,
  Sparkles,
  Tv,
  Usb,
  X,
} from 'lucide-react';
import { ConsoleType } from '../types';

interface RemotePlayGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedConsole: ConsoleType;
  onSelectConsole: (type: ConsoleType) => void;
  onStartRemotePlayCapture: () => void;
}

export const RemotePlayGuideModal: React.FC<RemotePlayGuideModalProps> = ({
  isOpen,
  onClose,
  selectedConsole,
  onSelectConsole,
  onStartRemotePlayCapture,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none font-mono">
      <div className="bg-[#111] border border-[#333] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#161616] border-b border-[#242424]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#00ffcc15] border border-[#00ffcc33] text-[#00ffcc]">
              <HelpCircle size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Console & Mobile 144Hz Mirroring Guide
              </h2>
              <p className="text-[10px] text-[#888]">
                Setup instructions for iOS, Android 144Hz, PS5, Xbox, Switch & OTG
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-[#ccc]">
          {/* Direct Wired Mode (THE ONLY WAY FOR PERFECT LOW LATENCY) */}
          <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#00ffcc]/30">
            <div className="flex items-center gap-2 text-[#00ffcc] font-bold text-xs uppercase mb-2">
              <Usb size={16} />
              <span>DIRECT WIRED OTG (PERFECT LATENCY / RTX ENABLED)</span>
            </div>
            <p className="text-[11px] text-[#aaa] mb-2">
              For competitive gaming, always use a USB-C OTG cable to a capture card. This provides a raw UVC feed, enabling RTX Zero-Latency and Frame Generation natively.
            </p>
          </div>

          {/* WebRTC Low-Latency Stream (The requested encoding/transport pipeline) */}
          <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#00ffcc]/30">
            <div className="flex items-center gap-2 text-[#00ffcc] font-bold text-xs uppercase mb-2">
              <Zap size={16} />
              <span>NATIVE WEBRTC LOW-LATENCY STREAM (ENCODING/TRANSPORT/DECODE)</span>
            </div>
            <p className="text-[11px] text-[#aaa] mb-2">
              Browsers cannot natively handshake AirPlay/Chromecast. For the requested 0–50ms latency chain, use a tool that streams <strong>native WebRTC</strong>:
            </p>
            <ul className="space-y-2 text-[11px] text-[#aaa] list-disc list-inside">
              <li>
                <strong className="text-white">The Pipeline:</strong> Your bridge tool encodes, performs H.264 network transport, and the browser handles hardware-accelerated decoding/buffering natively.
              </li>
              <li>
                <strong className="text-white">How to Stream:</strong> Configure your bridge (e.g., <span className="text-[#00ffcc]">Scrcpy</span>, <span className="text-[#00ffcc]">OBS</span>, or <span className="text-[#00ffcc]">Monocle</span>) to output an H.264 WebRTC stream.
              </li>
              <li>
                <strong className="text-white">Capture:</strong> Click "CAPTURE SCREEN MIRROR" and the browser will natively ingest the WebRTC stream with the absolute minimum possible lag.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#141414] border-t border-[#242424] flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={() => {
              onClose();
              onStartRemotePlayCapture();
            }}
            className="bg-[#00ffcc] hover:bg-[#00e6b8] text-black text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(0,255,204,0.3)]"
          >
            <Cast size={14} />
            <span>START SCREEN MIRROR CAPTURE</span>
          </button>
          <button
            onClick={onClose}
            className="bg-[#222] hover:bg-[#333] text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
