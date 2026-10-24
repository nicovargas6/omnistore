// Web Audio API & HTML5 Audio Synthesizer for Store Order Alerts
// Supports iOS Safari, Android Chrome, and Desktop with silent-switch resilience

let cachedBlobUrl = null;

// Dynamically creates a crisp, pleasant dual-bell WAV chime in memory
function getChimeAudioUrl() {
  if (cachedBlobUrl) return cachedBlobUrl;
  try {
    const sampleRate = 22050;
    const duration = 0.9;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    const writeString = (offset, str) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    // RIFF WAV Header
    writeString(0, "RIFF");
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // 1 Channel (Mono)
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, numSamples * 2, true);

    // Generate dual-bell harmonious chime: E5 (659.25Hz) + A5 (880Hz)
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let sample = 0;
      // Note 1: E5
      if (t < 0.6) {
        const env1 = Math.exp(-t * 7);
        sample += Math.sin(2 * Math.PI * 659.25 * t) * env1 * 0.45;
      }
      // Note 2: A5 (chime cadence after 140ms)
      if (t >= 0.14) {
        const t2 = t - 0.14;
        const env2 = Math.exp(-t2 * 6);
        sample += Math.sin(2 * Math.PI * 880 * t) * env2 * 0.55;
      }
      const intSample = Math.max(-1, Math.min(1, sample)) * 32767;
      view.setInt16(44 + i * 2, intSample, true);
    }

    const blob = new Blob([buffer], { type: "audio/wav" });
    cachedBlobUrl = URL.createObjectURL(blob);
    return cachedBlobUrl;
  } catch (err) {
    console.warn("WAV synthesis fallback failed:", err);
    return null;
  }
}

// Global AudioContext singleton
let globalAudioCtx = null;

export function playOrderChime() {
  // 1. Mobile Haptic feedback (where supported)
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate([150, 80, 200]);
    } catch {
      // ignore
    }
  }

  // 2. HTML5 Audio (Bypasses Web Audio suspension on iOS / Mobile devices)
  try {
    const audioUrl = getChimeAudioUrl();
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.volume = 1.0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.log("HTML5 audio playback intercepted:", err);
        });
      }
    }
  } catch (err) {
    console.log("HTML5 Audio failed, relying on Web Audio API:", err);
  }

  // 3. Web Audio API synthesizer (Runs concurrently for maximum fidelity)
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    if (!globalAudioCtx || globalAudioCtx.state === "closed") {
      globalAudioCtx = new AudioCtx();
    }

    const ctx = globalAudioCtx;

    // Critical for iOS Safari: resume suspended context
    const startOscillators = () => {
      try {
        const now = ctx.currentTime;
        // First bell note: E5 (659.25 Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(659.25, now);
        gain1.gain.setValueAtTime(0.3, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.6);

        // Second bell note: A5 (880 Hz)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(880, now + 0.15);
        gain2.gain.setValueAtTime(0.35, now + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.15);
        osc2.stop(now + 1.1);
      } catch (err) {
        console.warn("Oscillator scheduling warning:", err);
      }
    };

    if (ctx.state === "suspended") {
      ctx.resume().then(startOscillators).catch(() => startOscillators());
    } else {
      startOscillators();
    }
  } catch (e) {
    console.log("Web Audio chime muted by browser policy:", e);
  }
}
