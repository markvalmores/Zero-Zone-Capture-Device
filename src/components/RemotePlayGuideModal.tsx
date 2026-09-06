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
          {/* iOS Screen Mirroring */}
          <div className="bg-[#151515] p-4 rounded-xl border border-[#262626]">
            <div className="flex items-center gap-2 text-[#00aaff] font-bold text-xs uppercase mb-2">
              <Smartphone size={16} />
              <span>iOS Screen Mirroring (iPhone / iPad Pro 120-144Hz)</span>
            </div>
            <ul className="space-y-2 text-[11px] text-[#aaa] list-disc list-inside">
              <li>
                <strong className="text-white">Direct USB-C DisplayPort Cable:</strong> Connect iPhone 15/16/17 Pro or iPad Pro directly to your USB-C OTG grabber or HDMI capture card for zero-latency 120Hz uncompressed HDR.
              </li>
              <li>
                <strong className="text-white">AirPlay Screen Share:</strong> Open your Mac/PC AirPlay receiver window (or UXPlay / Reflector) with audio loopback enabled, then click <span className="text-[#00ffcc]">"CAPTURE SCREEN MIRROR"</span>.
              </li>
              <li>
                <strong className="text-white">Audio Capture:</strong> Check "Share System Audio" when selecting the mirroring window for lossless stereo sound.
              </li>
            </ul>
          </div>

          {/* Android Screen Mirroring */}
          <div className="bg-[#151515] p-4 rounded-xl border border-[#262626]">
            <div className="flex items-center gap-2 text-[#3ddc84] font-bold text-xs uppercase mb-2">
              <Smartphone size={16} />
              <span>Android 144Hz Screen Mirror (Scrcpy / Samsung DeX / OTG)</span>
            </div>
            <ul className="space-y-2 text-[11px] text-[#aaa] list-disc list-inside">
              <li>
                <strong className="text-white">Scrcpy 144 FPS Engine:</strong> Run <code className="bg-[#222] text-[#00ffcc] px-1 py-0.5 rounded">scrcpy --max-fps=144 --video-codec=h265 --audio-codec=raw</code> for ultra-low latency mobile gaming mirroring with synchronized audio.
              </li>
              <li>
                <strong className="text-white">USB-C OTG Video Grabber:</strong> Connect Android phone USB-C to capture card. Android outputs full native 120Hz/144Hz DP Alt Mode.
              </li>
            </ul>
          </div>

          {/* PlayStation 4 & 5 */}
          <div className="bg-[#151515] p-4 rounded-xl border border-[#262626]">
            <div className="flex items-center gap-2 text-[#0070d1] font-bold text-xs uppercase mb-2">
              <Gamepad2 size={16} />
              <span>PlayStation 5 & PlayStation 4 Setup</span>
            </div>
            <ul className="space-y-2 text-[11px] text-[#aaa] list-disc list-inside">
              <li>
                <strong className="text-white">Direct HDMI / OTG Grabber:</strong> Disable HDCP in PS4/PS5 settings (Settings → System → HDMI → Enable HDCP = OFF), then connect HDMI OUT to your capture card.
              </li>
              <li>
                <strong className="text-white">Official PS Remote Play:</strong> Launch the "PS Remote Play" app on your computer, connect to your console, then click <span className="text-[#00ffcc]">"CAPTURE REMOTE PLAY"</span> in zerozone to stream the window at 1080p/4K 60-120fps with full audio.
              </li>
            </ul>
          </div>

          {/* Xbox One S/X & Series X|S */}
          <div className="bg-[#151515] p-4 rounded-xl border border-[#262626]">
            <div className="flex items-center gap-2 text-[#107c10] font-bold text-xs uppercase mb-2">
              <Tv size={16} />
              <span>Xbox One S/X & Xbox Series X | S Setup</span>
            </div>
            <ul className="space-y-2 text-[11px] text-[#aaa] list-disc list-inside">
              <li>
                <strong className="text-white">Direct HDMI Grabber:</strong> Connect Xbox HDMI OUT to capture card. Xbox supports 1080p 120Hz and 4K 60Hz RGB Full Range.
              </li>
              <li>
                <strong className="text-white">Xbox App Remote Play:</strong> Open the official Xbox App on Windows/Mac, click the Console icon, select Remote Play, and capture that window directly.
              </li>
            </ul>
          </div>

          {/* Nintendo Switch & Switch 2 */}
          <div className="bg-[#151515] p-4 rounded-xl border border-[#262626]">
            <div className="flex items-center gap-2 text-[#e60012] font-bold text-xs uppercase mb-2">
              <Sparkles size={16} />
              <span>Nintendo Switch & Nintendo Switch 2 Setup</span>
            </div>
            <ul className="space-y-2 text-[11px] text-[#aaa] list-disc list-inside">
              <li>
                <strong className="text-white">Nintendo Switch Docked:</strong> Place Switch in dock, connect HDMI cable to your Type-C OTG grabber or HDMI capture card. Set RGB Range to "Full Range" in Switch TV Settings.
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
