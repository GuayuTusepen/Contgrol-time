/**
 * Sound Engine for Control Time
 * Supports both high-fidelity Web Audio synthesis for built-in school bells/sirens
 * and custom uploaded MP3 audio playback.
 */

import { SoundType } from '../types';

let audioCtx: AudioContext | null = null;
let currentCustomAudio: HTMLAudioElement | null = null;
let activeOscillators: { stop: () => void }[] = [];
let emergencyInterval: number | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function unlockAudioContext(): void {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  } catch (e) {
    console.error('Audio unlock error:', e);
  }
}

export function stopAllSounds(): void {
  // Stop any playing custom audio
  if (currentCustomAudio) {
    try {
      currentCustomAudio.pause();
      currentCustomAudio.currentTime = 0;
    } catch {
      // ignore
    }
    currentCustomAudio = null;
  }

  // Stop emergency loop if active
  if (emergencyInterval !== null) {
    clearInterval(emergencyInterval);
    emergencyInterval = null;
  }

  // Stop active oscillators
  activeOscillators.forEach((item) => {
    try {
      item.stop();
    } catch {
      // ignore
    }
  });
  activeOscillators = [];
}

/**
 * Synthesizes a resonant bell / chime note
 */
function playBellTone(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'sine'
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Overtone oscillator for metallic bell timbre
  const overtone = ctx.createOscillator();
  const overtoneGain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  overtone.type = 'sine';
  overtone.frequency.setValueAtTime(freq * 2.76, startTime); // Inharmonic bell partial

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  overtoneGain.gain.setValueAtTime(0.0001, startTime);
  overtoneGain.gain.linearRampToValueAtTime(volume * 0.4, startTime + 0.015);
  overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.6);

  osc.connect(gain);
  overtone.connect(overtoneGain);
  gain.connect(ctx.destination);
  overtoneGain.connect(ctx.destination);

  osc.start(startTime);
  overtone.start(startTime);
  osc.stop(startTime + duration + 0.1);
  overtone.stop(startTime + duration + 0.1);

  activeOscillators.push({
    stop: () => {
      try {
        osc.stop();
        overtone.stop();
      } catch {
        // already stopped
      }
    },
  });
}

/**
 * Electric school clapper bell (classic school alarm / timbrado rápido)
 */
function playElectricSchoolBell(ctx: AudioContext, startTime: number, duration: number, volume: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const modOsc = ctx.createOscillator();
  const modGain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(880, startTime); // Bell pitch A5

  // Tremolo / striker rate (25 Hz clapper hammer strikes)
  modOsc.type = 'sawtooth';
  modOsc.frequency.setValueAtTime(24, startTime);

  modGain.gain.setValueAtTime(volume * 0.8, startTime);

  modOsc.connect(gain.gain);
  osc.connect(gain);
  gain.connect(ctx.destination);

  modOsc.start(startTime);
  osc.start(startTime);

  const stopTime = startTime + duration;
  gain.gain.setValueAtTime(volume, stopTime - 0.1);
  gain.gain.linearRampToValueAtTime(0.0001, stopTime);

  modOsc.stop(stopTime + 0.1);
  osc.stop(stopTime + 0.1);

  activeOscillators.push({
    stop: () => {
      try {
        osc.stop();
        modOsc.stop();
      } catch {
        // ignore
      }
    },
  });
}

/**
 * Brass fanfare trumpet tone for school formation
 */
function playTrumpetTone(ctx: AudioContext, freq: number, startTime: number, duration: number, volume: number) {
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, startTime);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(freq * 3.5, startTime);
  filter.Q.setValueAtTime(3, startTime);

  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.04);
  gain.gain.setValueAtTime(volume * 0.9, startTime + duration - 0.05);
  gain.gain.linearRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);

  activeOscillators.push({
    stop: () => {
      try {
        osc.stop();
      } catch {
        // ignore
      }
    },
  });
}

/**
 * High-urgency emergency siren (dual modulated swept oscillators)
 */
function playEmergencySiren(ctx: AudioContext, durationSeconds: number = 8) {
  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  const compressor = ctx.createDynamicsCompressor();

  // Compress for maximum punch and loudness
  compressor.threshold.setValueAtTime(-10, now);
  compressor.knee.setValueAtTime(40, now);
  compressor.ratio.setValueAtTime(12, now);
  compressor.attack.setValueAtTime(0.003, now);
  compressor.release.setValueAtTime(0.25, now);

  osc1.type = 'sawtooth';
  osc2.type = 'square';

  // Urgency sweep between 550Hz and 1100Hz
  const cycleTime = 1.2; // 1.2s per sweep
  const numCycles = Math.ceil(durationSeconds / cycleTime);

  for (let i = 0; i < numCycles; i++) {
    const sweepStart = now + i * cycleTime;
    const sweepPeak = sweepStart + cycleTime * 0.5;
    const sweepEnd = sweepStart + cycleTime;

    osc1.frequency.setValueAtTime(550, sweepStart);
    osc1.frequency.linearRampToValueAtTime(1150, sweepPeak);
    osc1.frequency.linearRampToValueAtTime(550, sweepEnd);

    osc2.frequency.setValueAtTime(555, sweepStart);
    osc2.frequency.linearRampToValueAtTime(1160, sweepPeak);
    osc2.frequency.linearRampToValueAtTime(555, sweepEnd);
  }

  // Full blast volume 1.0 (Emergency override)
  gain.gain.setValueAtTime(0.95, now);
  gain.gain.setValueAtTime(0.95, now + durationSeconds - 0.2);
  gain.gain.linearRampToValueAtTime(0.0001, now + durationSeconds);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(compressor);
  compressor.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + durationSeconds + 0.1);
  osc2.stop(now + durationSeconds + 0.1);

  activeOscillators.push({
    stop: () => {
      try {
        osc1.stop();
        osc2.stop();
      } catch {
        // ignore
      }
    },
  });
}

/**
 * Play built-in sound by SoundType
 */
export function playBuiltInSound(type: SoundType, volume: number = 0.8): number {
  stopAllSounds();
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const vol = Math.max(0.1, Math.min(1.0, volume));

  switch (type) {
    case 'inicio_jornada': {
      // Westminster Chimes melody + resonant chime chord
      // E4, G#4, F#4, B3 / B3, F#4, G#4, E4
      const notes = [
        { f: 329.63, d: 0.6, delay: 0.0 }, // E4
        { f: 415.30, d: 0.6, delay: 0.6 }, // G#4
        { f: 369.99, d: 0.6, delay: 1.2 }, // F#4
        { f: 246.94, d: 1.2, delay: 1.8 }, // B3
        { f: 329.63, d: 0.6, delay: 3.2 }, // E4
        { f: 369.99, d: 0.6, delay: 3.8 }, // F#4
        { f: 415.30, d: 0.6, delay: 4.4 }, // G#4
        { f: 329.63, d: 1.8, delay: 5.0 }, // E4 long ring
      ];
      notes.forEach((n) => {
        playBellTone(ctx, n.f, now + n.delay, n.d + 0.8, vol);
      });
      return 7.0;
    }

    case 'fin_jornada': {
      // Dismissal Celebratory School Bell + Harmonic Grand Chime
      // 3 ascending chime chords followed by triumphant bell
      const arpeggio = [
        { f: 261.63, d: 0.8, delay: 0.0 }, // C4
        { f: 329.63, d: 0.8, delay: 0.4 }, // E4
        { f: 392.00, d: 0.8, delay: 0.8 }, // G4
        { f: 523.25, d: 2.2, delay: 1.2 }, // C5
        { f: 392.00, d: 0.5, delay: 3.2 }, // G4
        { f: 523.25, d: 0.5, delay: 3.6 }, // C5
        { f: 659.25, d: 2.5, delay: 4.0 }, // E5 grand finish
      ];
      arpeggio.forEach((n) => {
        playBellTone(ctx, n.f, now + n.delay, n.d + 1.0, vol);
      });
      return 6.5;
    }

    case 'salida_recreo': {
      // Dynamic Electric School Clapper Bell - 2 bursts of rapid ringing (4 seconds)
      playElectricSchoolBell(ctx, now, 1.8, vol);
      playElectricSchoolBell(ctx, now + 2.2, 2.0, vol);
      return 4.5;
    }

    case 'entrada_recreo': {
      // Return from break notice: Bright two-stage warning bell chime
      // Noticeable double chime ding-dong + bell pulse
      const breakReturnNotes = [
        { f: 587.33, d: 0.8, delay: 0.0 }, // D5
        { f: 739.99, d: 1.2, delay: 0.5 }, // F#5
        { f: 880.00, d: 1.8, delay: 1.1 }, // A5
        { f: 587.33, d: 0.6, delay: 2.5 }, // D5
        { f: 739.99, d: 0.6, delay: 3.0 }, // F#5
        { f: 880.00, d: 2.0, delay: 3.5 }, // A5
      ];
      breakReturnNotes.forEach((n) => {
        playBellTone(ctx, n.f, now + n.delay, n.d + 0.6, vol);
      });
      return 5.5;
    }

    case 'cambio_clases': {
      // Class switch chime: 3 harmonious descending/ascending distinct tones
      // e.g. E5 (659.25) -> C#5 (554.37) -> A4 (440.0) -> E5 (659.25)
      const periodNotes = [
        { f: 659.25, d: 0.8, delay: 0.0 }, // E5
        { f: 554.37, d: 0.8, delay: 0.5 }, // C#5
        { f: 440.00, d: 1.0, delay: 1.0 }, // A4
        { f: 659.25, d: 1.8, delay: 1.7 }, // E5 high final chime
      ];
      periodNotes.forEach((n) => {
        playBellTone(ctx, n.f, now + n.delay, n.d + 0.8, vol);
      });
      return 4.0;
    }

    case 'formacion_escolar': {
      // School formation bugle call (To the Colors / Assembly Fanfare)
      // C4 -> E4 -> G4 -> C5 rhythmic call
      const bugleCall = [
        { f: 261.63, d: 0.3, delay: 0.0 }, // C4
        { f: 329.63, d: 0.3, delay: 0.35 }, // E4
        { f: 392.00, d: 0.5, delay: 0.7 }, // G4
        { f: 261.63, d: 0.25, delay: 1.3 }, // C4
        { f: 329.63, d: 0.25, delay: 1.6 }, // E4
        { f: 392.00, d: 0.5, delay: 1.9 }, // G4
        { f: 523.25, d: 1.2, delay: 2.5 }, // C5
        { f: 392.00, d: 0.3, delay: 3.8 }, // G4
        { f: 523.25, d: 1.5, delay: 4.2 }, // C5 final held note
      ];
      bugleCall.forEach((n) => {
        playTrumpetTone(ctx, n.f, now + n.delay, n.d, vol);
      });
      return 6.0;
    }

    case 'emergencia': {
      // Highest volume emergency siren (volume = 1.0 override)
      playEmergencySiren(ctx, 10.0);
      return 10.0;
    }

    default:
      playElectricSchoolBell(ctx, now, 2.5, vol);
      return 3.0;
  }
}

/**
 * Play a custom MP3 audio from a Data URL (base64)
 */
export function playCustomAudio(dataUrl: string, volume: number = 0.8): Promise<void> {
  stopAllSounds();
  unlockAudioContext();

  return new Promise((resolve, reject) => {
    try {
      const audio = new Audio(dataUrl);
      currentCustomAudio = audio;
      audio.volume = Math.max(0.1, Math.min(1.0, volume));

      audio.onended = () => {
        currentCustomAudio = null;
        resolve();
      };

      audio.onerror = (e) => {
        currentCustomAudio = null;
        reject(e);
      };

      audio.play().catch((err) => {
        console.warn('Playback failed:', err);
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Play any sound (either built-in or custom MP3)
 */
export async function playSound(
  soundType: SoundType,
  customDataUrl?: string,
  volume: number = 0.8,
  isEmergency: boolean = false
): Promise<number> {
  const actualVolume = isEmergency ? 1.0 : volume;

  if (isEmergency) {
    // For emergency, always play the emergency siren at max 1.0
    return playBuiltInSound('emergencia', 1.0);
  }

  if (customDataUrl) {
    await playCustomAudio(customDataUrl, actualVolume);
    return 5.0;
  }

  return playBuiltInSound(soundType, actualVolume);
}
