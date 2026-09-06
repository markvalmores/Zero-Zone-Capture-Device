import { useState, useEffect, useRef, useCallback } from 'react';

export function useAudioMonitor() {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [audioVolume, setAudioVolume] = useState(1.0);
  const [audioDelayMs, setAudioDelayMs] = useState(0); // sync offset in ms
  const [vuLevels, setVuLevels] = useState<{ left: number; right: number }>({ left: 0, right: 0 });
  const [isAudioActive, setIsAudioActive] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const analyserLRef = useRef<AnalyserNode | null>(null);
  const analyserRRef = useRef<AnalyserNode | null>(null);
  const splitterRef = useRef<ChannelSplitterNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const attachAudioStream = useCallback((stream: MediaStream | null) => {
    // Clean up previous
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
      } catch (e) {
        // ignore
      }
      sourceNodeRef.current = null;
    }

    const audioTracks = stream?.getAudioTracks() || [];
    if (!stream || audioTracks.length === 0) {
      setIsAudioActive(false);
      setVuLevels({ left: 0, right: 0 });
      return;
    }

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtxClass({ latencyHint: 'interactive' });
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Build Audio Graph:
      // MediaStreamSource -> DelayNode -> GainNode -> Splitter -> Analysers (L/R) -> Destination (Speakers)
      const source = ctx.createMediaStreamSource(stream);
      sourceNodeRef.current = source;

      const delay = ctx.createDelay(1.0); // max 1.0 sec
      delay.delayTime.value = Math.max(0, audioDelayMs / 1000);
      delayNodeRef.current = delay;

      const gain = ctx.createGain();
      gain.gain.value = isAudioMuted ? 0 : audioVolume;
      gainNodeRef.current = gain;

      const splitter = ctx.createChannelSplitter(2);
      splitterRef.current = splitter;

      const analyserL = ctx.createAnalyser();
      analyserL.fftSize = 256;
      analyserLRef.current = analyserL;

      const analyserR = ctx.createAnalyser();
      analyserR.fftSize = 256;
      analyserRRef.current = analyserR;

      source.connect(delay);
      delay.connect(gain);
      gain.connect(splitter);

      splitter.connect(analyserL, 0);
      splitter.connect(analyserR, 1);

      // Connect to speakers for real-time monitoring
      gain.connect(ctx.destination);

      setIsAudioActive(true);

      // VU Meter loop
      const bufL = new Uint8Array(analyserL.frequencyBinCount);
      const bufR = new Uint8Array(analyserR.frequencyBinCount);

      const updateVU = () => {
        if (!analyserLRef.current || !analyserRRef.current) return;
        analyserLRef.current.getByteTimeDomainData(bufL);
        analyserRRef.current.getByteTimeDomainData(bufR);

        let sumL = 0;
        let sumR = 0;
        for (let i = 0; i < bufL.length; i++) {
          const valL = (bufL[i] - 128) / 128;
          const valR = (bufR[i] - 128) / 128;
          sumL += valL * valL;
          sumR += valR * valR;
        }

        const rmsL = Math.min(1, Math.sqrt(sumL / bufL.length) * 3.5);
        const rmsR = Math.min(1, Math.sqrt(sumR / bufR.length) * 3.5);

        setVuLevels({
          left: isAudioMuted ? 0 : rmsL,
          right: isAudioMuted ? 0 : rmsR,
        });

        animationFrameRef.current = requestAnimationFrame(updateVU);
      };

      updateVU();
    } catch (err) {
      console.error('Failed to initialize Web Audio monitor:', err);
      setIsAudioActive(false);
    }
  }, [audioDelayMs, audioVolume, isAudioMuted]);

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isAudioMuted ? 0 : audioVolume;
    }
  }, [audioVolume, isAudioMuted]);

  // Update delay
  useEffect(() => {
    if (delayNodeRef.current) {
      delayNodeRef.current.delayTime.value = Math.max(0, audioDelayMs / 1000);
    }
  }, [audioDelayMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const toggleMute = () => {
    setIsAudioMuted((prev) => !prev);
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  return {
    isAudioMuted,
    toggleMute,
    audioVolume,
    setAudioVolume,
    audioDelayMs,
    setAudioDelayMs,
    vuLevels,
    isAudioActive,
    attachAudioStream,
  };
}
