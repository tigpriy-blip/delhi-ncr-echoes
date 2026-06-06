import { DRONE_FREQ, DRONE_GAIN, LS } from "./constants";
import { ls } from "./storage";

type AC = AudioContext;

let ctx: AC | null = null;
let droneOsc: OscillatorNode | null = null;
let droneGain: GainNode | null = null;
let muted = false;
const listeners = new Set<(m: boolean) => void>();

if (typeof window !== "undefined") {
  muted = ls.getBool(LS.muted);
}

export function isMuted() {
  return muted;
}

export function setMuted(v: boolean) {
  muted = v;
  ls.setBool(LS.muted, v);
  if (v) stopDrone();
  listeners.forEach((l) => l(v));
}

export function subscribeMute(fn: (m: boolean) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function getCtx(): AC | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const W = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
  const Ctor = W.AudioContext ?? W.webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  return ctx;
}

export function startDrone() {
  if (muted) return;
  const c = getCtx();
  if (!c || droneOsc) return;
  droneOsc = c.createOscillator();
  droneGain = c.createGain();
  droneOsc.type = "sine";
  droneOsc.frequency.value = DRONE_FREQ;
  droneGain.gain.value = DRONE_GAIN;
  droneOsc.connect(droneGain).connect(c.destination);
  droneOsc.start();
}

export function stopDrone() {
  try {
    droneOsc?.stop();
    droneOsc?.disconnect();
    droneGain?.disconnect();
  } catch {
    // ignore
  }
  droneOsc = null;
  droneGain = null;
}

/** Harsh short burst for the transition spike. */
export function spike(durationMs = 180) {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "square";
  osc.frequency.value = 1800;
  gain.gain.setValueAtTime(0.0001, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.25, c.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + durationMs / 1000);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + durationMs / 1000 + 0.02);
}

// ----- SFX cues (synthesized, no asset files) -----

function tone(opts: {
  freq: number;
  freqEnd?: number;
  durationMs: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
}) {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime + (opts.delay ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(opts.freq, t);
  if (opts.freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(opts.freqEnd, t + opts.durationMs / 1000);
  }
  const peak = opts.gain ?? 0.15;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + opts.durationMs / 1000);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + opts.durationMs / 1000 + 0.02);
}

function noise(durationMs: number, gainPeak = 0.18, filterFreq = 2000) {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  const bufferSize = Math.floor((c.sampleRate * durationMs) / 1000);
  const buf = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = filterFreq;
  const g = c.createGain();
  const t = c.currentTime;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gainPeak, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + durationMs / 1000);
  src.connect(filter).connect(g).connect(c.destination);
  src.start(t);
  src.stop(t + durationMs / 1000 + 0.02);
}

export const sfx = {
  /** soft sticker peel */
  pop() {
    tone({ freq: 880, freqEnd: 1320, durationMs: 90, type: "triangle", gain: 0.12 });
  },
  /** ribbon snap */
  snap() {
    noise(80, 0.22, 4500);
  },
  /** paper tear */
  paper() {
    noise(280, 0.16, 1200);
  },
  /** reveal chime — bright two-note */
  chime() {
    tone({ freq: 880, durationMs: 320, type: "sine", gain: 0.16 });
    tone({ freq: 1320, durationMs: 380, type: "sine", gain: 0.13, delay: 0.08 });
  },
  /** puzzle solved — descending stamp + low thud */
  stamp() {
    tone({ freq: 220, freqEnd: 110, durationMs: 240, type: "triangle", gain: 0.22 });
    noise(120, 0.12, 800);
  },
  /** subtle click for hovers / hints */
  tick() {
    tone({ freq: 1400, durationMs: 40, type: "square", gain: 0.05 });
  },
  /** soft camera shutter for snapshots */
  shutter() {
    noise(60, 0.18, 3000);
    tone({ freq: 600, freqEnd: 400, durationMs: 80, type: "triangle", gain: 0.1, delay: 0.05 });
  },
};

// ----- Act 2 horror ambience -----

let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let whisperTimer: ReturnType<typeof setTimeout> | null = null;
let ambienceActive = false;
let ambienceIntensity = 1;

function heartbeatThump() {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  // low thump
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(70, t);
  osc.frequency.exponentialRampToValueAtTime(38, t + 0.25);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.32, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.35);
  // soft echo thump
  const osc2 = c.createOscillator();
  const g2 = c.createGain();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(60, t + 0.18);
  osc2.frequency.exponentialRampToValueAtTime(34, t + 0.4);
  g2.gain.setValueAtTime(0.0001, t + 0.18);
  g2.gain.exponentialRampToValueAtTime(0.22, t + 0.2);
  g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
  osc2.connect(g2).connect(c.destination);
  osc2.start(t + 0.18);
  osc2.stop(t + 0.5);
}

function whisperGust() {
  if (muted) return;
  // pick one of three creepy textures
  const which = Math.floor(Math.random() * 3);
  if (which === 0) {
    // breathy whisper — band-passed noise sweep
    const c = getCtx();
    if (!c) return;
    const dur = 900 + Math.random() * 700;
    const bufferSize = Math.floor((c.sampleRate * dur) / 1000);
    const buf = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const filter = c.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 8;
    const t = c.currentTime;
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(2400, t + dur / 1000);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.06, t + 0.2);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur / 1000);
    src.connect(filter).connect(g).connect(c.destination);
    src.start(t);
    src.stop(t + dur / 1000 + 0.02);
  } else if (which === 1) {
    // metal scrape
    tone({ freq: 320, freqEnd: 90, durationMs: 600, type: "sawtooth", gain: 0.04 });
    noise(400, 0.05, 2200);
  } else {
    // high shimmer
    tone({ freq: 2200 + Math.random() * 800, durationMs: 500, type: "sine", gain: 0.04 });
  }
}

/** Start the Act 2 ambient bed (drone + heartbeat + random whispers). */
export function startAct2Ambience(intensity = 1) {
  ambienceIntensity = Math.max(1, intensity);
  if (ambienceActive) {
    // just update intensity
    return;
  }
  ambienceActive = true;
  startDrone();

  const beatMs = () => Math.max(700, 1300 - (ambienceIntensity - 1) * 120);
  heartbeatThump();
  heartbeatTimer = setInterval(() => heartbeatThump(), beatMs());

  const scheduleWhisper = () => {
    const wait = 8000 + Math.random() * 17000;
    whisperTimer = setTimeout(() => {
      if (!ambienceActive) return;
      whisperGust();
      scheduleWhisper();
    }, wait);
  };
  scheduleWhisper();
}

export function stopAct2Ambience() {
  ambienceActive = false;
  stopDrone();
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = null;
  if (whisperTimer) clearTimeout(whisperTimer);
  whisperTimer = null;
}

/** Sharp dissonant cluster — use for puzzle solves, observer joins. */
export function stinger() {
  if (muted) return;
  tone({ freq: 180, freqEnd: 90, durationMs: 350, type: "sawtooth", gain: 0.18 });
  tone({ freq: 187, freqEnd: 95, durationMs: 350, type: "sawtooth", gain: 0.14, delay: 0.005 });
  noise(180, 0.1, 1600);
}

/** Rising filtered-noise swell — use before big reveals. */
export function swell(durationMs = 1800) {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  const bufferSize = Math.floor((c.sampleRate * durationMs) / 1000);
  const buf = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 3;
  const t = c.currentTime;
  filter.frequency.setValueAtTime(300, t);
  filter.frequency.exponentialRampToValueAtTime(4000, t + durationMs / 1000);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.22, t + durationMs / 1000 - 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, t + durationMs / 1000);
  src.connect(filter).connect(g).connect(c.destination);
  src.start(t);
  src.stop(t + durationMs / 1000 + 0.02);
}

// ----- Morse code synth (used by Puzzle 2) -----

const MORSE_MAP: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",
  G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",
  M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
  S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--",
  "4": "....-", "5": ".....", "6": "-....", "7": "--...",
  "8": "---..", "9": "----.",
};

const UNIT_MS = 110; // dot length

export type MorseHandle = { stop: () => void };

export type MorseOpts = {
  loop?: boolean;
  onLetter?: (index: number) => void;
  onEnd?: () => void;
  freq?: number;
};

/**
 * Synthesize a morse-code transmission. Returns a handle with stop().
 * Respects the global mute flag (silent but still fires onLetter/onEnd callbacks).
 */
export function playMorse(word: string, opts: MorseOpts = {}): MorseHandle {
  const { loop = false, onLetter, onEnd, freq = 600 } = opts;
  const letters = word.toUpperCase().split("");
  let cancelled = false;
  const timers: ReturnType<typeof setTimeout>[] = [];
  const c = getCtx();
  const activeNodes: { osc: OscillatorNode; g: GainNode }[] = [];

  const at = (ms: number, fn: () => void) => {
    timers.push(setTimeout(() => { if (!cancelled) fn(); }, ms));
  };

  const beep = (startMs: number, durMs: number) => {
    if (muted || !c) return;
    const t = c.currentTime + startMs / 1000;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18, t + 0.005);
    g.gain.setValueAtTime(0.18, t + durMs / 1000 - 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + durMs / 1000);
    osc.connect(g).connect(c.destination);
    osc.start(t);
    osc.stop(t + durMs / 1000 + 0.02);
    activeNodes.push({ osc, g });
  };

  const runOnce = (offsetMs: number): number => {
    let cursor = offsetMs;
    letters.forEach((letter, i) => {
      const code = MORSE_MAP[letter];
      if (!code) return;
      const letterStart = cursor;
      at(letterStart, () => onLetter?.(i));
      code.split("").forEach((sym) => {
        const dur = sym === "." ? UNIT_MS : UNIT_MS * 3;
        beep(cursor, dur);
        cursor += dur + UNIT_MS; // intra-letter gap
      });
      cursor += UNIT_MS * 2; // inter-letter gap (total ~3 units)
    });
    return cursor;
  };

  const schedule = (offsetMs: number) => {
    const end = runOnce(offsetMs);
    if (loop) {
      at(end + 1500, () => schedule(0));
    } else {
      at(end, () => onEnd?.());
    }
  };

  schedule(0);

  return {
    stop() {
      cancelled = true;
      timers.forEach(clearTimeout);
      activeNodes.forEach(({ osc, g }) => {
        try { osc.stop(); osc.disconnect(); g.disconnect(); } catch { /* noop */ }
      });
    },
  };
}
