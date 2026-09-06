import React from 'react';
import {
  CheckCircle2,
  HardDrive,
  RefreshCw,
  Sparkles,
  Usb,
  Video,
  X,
  Zap,
  Radio,
  Cpu,
  Tv,
} from 'lucide-react';
import { DetectedDevice } from '../types';

interface DeviceDetectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoDevices: DetectedDevice[];
  audioDevices: DetectedDevice[];
  selectedVideoDeviceId: string;
  onSelectVideoDevice: (id: string) => void;
  onRescan: () => void;
  isScanning: boolean;
}

export const DeviceDetectorModal: React.FC<DeviceDetectorModalProps> = ({
  isOpen,
  onClose,
  videoDevices,
  audioDevices,
  selectedVideoDeviceId,
  onSelectVideoDevice,
  onRescan,
  isScanning,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="bg-[#111] border border-[#333] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#161616] border-b border-[#242424]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#00ffcc15] border border-[#00ffcc33] text-[#00ffcc]">
              <HardDrive size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white font-mono">
                Hardware Device Detector & Inspector
              </h2>
              <p className="text-[10px] text-[#888] font-mono">
                Scans connected USB-C OTG, HDMI Capture Cards, and Video Inputs
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 font-mono">
          {/* Hardware Engine Diagnostic Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-[#161616] p-2.5 rounded-lg border border-[#262626]">
              <span className="text-[9px] uppercase text-[#666] block">UVC DRIVER</span>
              <span className="text-xs font-bold text-[#00ffcc] flex items-center gap-1 mt-0.5">
                <CheckCircle2 size={12} /> NATIVE PLUG
              </span>
            </div>
            <div className="bg-[#161616] p-2.5 rounded-lg border border-[#262626]">
              <span className="text-[9px] uppercase text-[#666] block">HW ENCODER</span>
              <span className="text-xs font-bold text-[#00ffcc] flex items-center gap-1 mt-0.5">
                <CheckCircle2 size={12} /> H.264 / VP9
              </span>
            </div>
            <div className="bg-[#161616] p-2.5 rounded-lg border border-[#262626]">
              <span className="text-[9px] uppercase text-[#666] block">MAX FRAME RATE</span>
              <span className="text-xs font-bold text-[#00ffcc] mt-0.5">UP TO 144 FPS</span>
            </div>
            <div className="bg-[#161616] p-2.5 rounded-lg border border-[#262626]">
              <span className="text-[9px] uppercase text-[#666] block">MAX RESOLUTION</span>
              <span className="text-xs font-bold text-[#00ffcc] mt-0.5">3840x2160 (4K)</span>
            </div>
          </div>

          {/* Detected Video Capture Devices List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase text-[#888] tracking-wider flex items-center gap-1.5">
                <Video size={14} className="text-[#00ffcc]" />
                DETECTED VIDEO CAPTURE DEVICES ({videoDevices.length})
              </h3>
              <button
                onClick={onRescan}
                disabled={isScanning}
                className="text-[10px] text-[#00ffcc] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={11} className={isScanning ? 'animate-spin' : ''} />
                RESCAN BUS
              </button>
            </div>

            {videoDevices.length === 0 ? (
              <div className="p-6 bg-[#161616] rounded-xl border border-[#262626] text-center text-[#777] text-xs">
                No video capture cards found. Plug in your USB-C OTG or HDMI capture card and click Rescan.
              </div>
            ) : (
              <div className="space-y-2">
                {videoDevices.map((dev) => {
                  const isSelected = selectedVideoDeviceId === dev.deviceId;
                  return (
                    <div
                      key={dev.deviceId}
                      onClick={() => onSelectVideoDevice(dev.deviceId)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#00ffcc12] border-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.15)]'
                          : 'bg-[#161616] border-[#282828] hover:bg-[#1d1d1d]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            dev.isLikelyCaptureCard || dev.isTypeCOTG
                              ? 'bg-[#00ffcc22] text-[#00ffcc]'
                              : 'bg-[#222] text-[#888]'
                          }`}
                        >
                          {dev.isTypeCOTG ? <Usb size={16} /> : <Video size={16} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">
                              {dev.label}
                            </span>
                            {dev.isLikelyCaptureCard && (
                              <span className="text-[8px] bg-[#00ffcc22] text-[#00ffcc] px-1.5 py-0.5 rounded font-bold border border-[#00ffcc33]">
                                CAPTURE CARD
                              </span>
                            )}
                            {dev.isTypeCOTG && (
                              <span className="text-[8px] bg-[#ff990022] text-[#ff9900] px-1.5 py-0.5 rounded font-bold border border-[#ff990033]">
                                TYPE-C OTG
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#777] mt-0.5 flex items-center gap-2">
                            <span>ID: {dev.deviceId.slice(0, 14)}...</span>
                            <span>•</span>
                            <span>BRAND: {dev.detectedBrand}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <span className="text-[10px] bg-[#00ffcc] text-black font-bold px-2 py-1 rounded">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#666] hover:text-[#00ffcc]">
                            SELECT
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detected Audio In List */}
          <div>
            <h3 className="text-xs font-bold uppercase text-[#888] tracking-wider mb-2">
              HDMI & USB DIGITAL AUDIO INPUTS ({audioDevices.length})
            </h3>
            <div className="space-y-1.5">
              {audioDevices.map((a) => (
                <div
                  key={a.deviceId}
                  className="p-2.5 rounded-lg bg-[#141414] border border-[#242424] text-[11px] text-[#aaa] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ffcc]" />
                    <span>{a.label}</span>
                  </div>
                  <span className="text-[9px] text-[#666]">48kHz PCM</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#141414] border-t border-[#242424] flex items-center justify-between">
          <span className="text-[10px] text-[#666] font-mono">
            Hotplug listener active • Auto-detects OTG plug/unplug
          </span>
          <button
            onClick={onClose}
            className="bg-[#00ffcc] hover:bg-[#00e6b8] text-black text-xs font-bold font-mono px-4 py-2 rounded-lg cursor-pointer transition-colors"
          >
            APPLY & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
