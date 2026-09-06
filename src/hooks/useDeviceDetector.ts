import { useState, useEffect, useCallback, useRef } from 'react';
import { DetectedDevice, ConsoleType } from '../types';
import { CAPTURE_CARD_KEYWORDS } from '../constants/presets';

export function useDeviceDetector(selectedConsole: ConsoleType) {
  const [videoDevices, setVideoDevices] = useState<DetectedDevice[]>([]);
  const [audioDevices, setAudioDevices] = useState<DetectedDevice[]>([]);
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState<string>('');
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [lastHotplugEvent, setLastHotplugEvent] = useState<{
    time: Date;
    action: 'plugged' | 'unplugged';
    deviceName: string;
  } | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const prevDeviceCountRef = useRef<number>(0);

  const classifyDevice = useCallback((d: MediaDeviceInfo): DetectedDevice => {
    const labelLower = (d.label || '').toLowerCase();
    const isLikelyCapture = CAPTURE_CARD_KEYWORDS.some((kw) =>
      labelLower.includes(kw)
    );
    const isTypeC =
      labelLower.includes('otg') ||
      labelLower.includes('type-c') ||
      labelLower.includes('usb-c') ||
      labelLower.includes('shadowcast') ||
      labelLower.includes('cam link');
    const isHDMI =
      labelLower.includes('hdmi') ||
      labelLower.includes('elgato') ||
      labelLower.includes('avermedia') ||
      labelLower.includes('magewell') ||
      labelLower.includes('decklink') ||
      labelLower.includes('capture');

    let brand = 'Generic Video';
    if (labelLower.includes('elgato')) brand = 'Elgato Gaming';
    else if (labelLower.includes('cam link')) brand = 'Elgato Cam Link';
    else if (labelLower.includes('shadowcast') || labelLower.includes('genki'))
      brand = 'Genki ShadowCast (OTG)';
    else if (labelLower.includes('avermedia')) brand = 'AVerMedia Live Gamer';
    else if (labelLower.includes('magewell')) brand = 'Magewell Pro Capture';
    else if (labelLower.includes('blackmagic') || labelLower.includes('decklink'))
      brand = 'Blackmagic Design';
    else if (labelLower.includes('ms2109') || labelLower.includes('ms2130'))
      brand = 'MacroSilicon OTG Grabber';
    else if (labelLower.includes('razer')) brand = 'Razer Ripsaw';
    else if (labelLower.includes('obs')) brand = 'OBS Virtual Camera';
    else if (isLikelyCapture) brand = 'HDMI / UVC Capture Card';
    else if (labelLower.includes('facetime') || labelLower.includes('integrated') || labelLower.includes('front'))
      brand = 'Integrated Camera';

    return {
      deviceId: d.deviceId,
      label: d.label || (d.kind === 'videoinput' ? `Video Input (${d.deviceId.slice(0, 6)})` : `Audio Input (${d.deviceId.slice(0, 6)})`),
      kind: d.kind as 'videoinput' | 'audioinput',
      groupId: d.groupId,
      isLikelyCaptureCard: isLikelyCapture,
      isTypeCOTG: isTypeC,
      isHDMI: isHDMI,
      detectedBrand: brand,
      supportedMaxRes: isLikelyCapture ? '4K 60FPS / 1080p 120FPS' : '1080p 60FPS',
    };
  }, []);

  const scanDevices = useCallback(async (requestPrompt = false) => {
    setIsScanning(true);
    try {
      if (requestPrompt || !permissionGranted) {
        try {
          const tempStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          tempStream.getTracks().forEach((t) => t.stop());
          setPermissionGranted(true);
          setPermissionError(null);
        } catch (e: any) {
          // If audio fails, try video only
          try {
            const tempVid = await navigator.mediaDevices.getUserMedia({
              video: true,
            });
            tempVid.getTracks().forEach((t) => t.stop());
            setPermissionGranted(true);
            setPermissionError(null);
          } catch (vidErr: any) {
            console.warn('getUserMedia error during scan:', vidErr);
            setPermissionError('Camera / Capture Device access permission required');
          }
        }
      }

      const devices: MediaDeviceInfo[] = await navigator.mediaDevices.enumerateDevices();
      const vList: DetectedDevice[] = devices
        .filter((d): d is MediaDeviceInfo => d.kind === 'videoinput')
        .map((d) => classifyDevice(d));
      const aList: DetectedDevice[] = devices
        .filter((d): d is MediaDeviceInfo => d.kind === 'audioinput')
        .map((d) => classifyDevice(d));

      setVideoDevices(vList);
      setAudioDevices(aList);

      // Detect hotplug
      if (prevDeviceCountRef.current > 0) {
        if (vList.length > prevDeviceCountRef.current) {
          const newDev = vList[vList.length - 1];
          setLastHotplugEvent({
            time: new Date(),
            action: 'plugged',
            deviceName: newDev?.label || 'New Video Device',
          });
        } else if (vList.length < prevDeviceCountRef.current) {
          setLastHotplugEvent({
            time: new Date(),
            action: 'unplugged',
            deviceName: 'Capture Device disconnected',
          });
        }
      }
      prevDeviceCountRef.current = vList.length;

      // Auto-select best device if nothing is selected or previous is gone
      setSelectedVideoDeviceId((prev) => {
        const stillExists = vList.some((d) => d.deviceId === prev && prev !== '');
        if (stillExists) return prev;

        // Auto-select priority:
        // 1. Capture card matching console
        const captureCard = vList.find((d) => d.isLikelyCaptureCard || d.isHDMI || d.isTypeCOTG);
        if (captureCard) return captureCard.deviceId;

        // 2. First non-virtual video device
        const nonVirtual = vList.find((d) => !d.label.toLowerCase().includes('obs virtual'));
        if (nonVirtual) return nonVirtual.deviceId;

        return vList[0]?.deviceId || '';
      });

      // Auto-select matching audio device (e.g. HDMI audio)
      setSelectedAudioDeviceId((prev) => {
        const stillExists = aList.some((d) => d.deviceId === prev && prev !== '');
        if (stillExists) return prev;
        const captureAudio = aList.find((d) => d.isLikelyCaptureCard || d.isHDMI || d.label.toLowerCase().includes('digital audio') || d.label.toLowerCase().includes('capture'));
        return captureAudio?.deviceId || aList[0]?.deviceId || '';
      });
    } catch (err: any) {
      console.error('Failed to scan devices:', err);
    } finally {
      setIsScanning(false);
    }
  }, [classifyDevice, permissionGranted]);

  // Initial scan and listener for device change (hotplug detection)
  useEffect(() => {
    scanDevices(false);

    const handleDeviceChange = () => {
      scanDevices(false);
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [scanDevices]);

  // When console profile changes, suggest best device if available
  useEffect(() => {
    if (videoDevices.length === 0) return;

    if (selectedConsole === 'type_c_otg') {
      const otgDev = videoDevices.find((d) => d.isTypeCOTG || d.isLikelyCaptureCard);
      if (otgDev) setSelectedVideoDeviceId(otgDev.deviceId);
    } else if (selectedConsole === 'hdmi_grabber' || selectedConsole === 'ps5' || selectedConsole === 'xbox_series') {
      const hdmiDev = videoDevices.find((d) => d.isHDMI || d.isLikelyCaptureCard);
      if (hdmiDev) setSelectedVideoDeviceId(hdmiDev.deviceId);
    }
  }, [selectedConsole, videoDevices]);

  return {
    videoDevices,
    audioDevices,
    selectedVideoDeviceId,
    setSelectedVideoDeviceId,
    selectedAudioDeviceId,
    setSelectedAudioDeviceId,
    isScanning,
    scanDevices,
    lastHotplugEvent,
    clearHotplugEvent: () => setLastHotplugEvent(null),
    permissionGranted,
    permissionError,
  };
}
