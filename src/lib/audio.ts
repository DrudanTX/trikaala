// Soft temple-bell chime synthesized with the Web Audio API — no assets, no
// dependencies, and it plays inside the user gesture so iOS/Android allow it.
import { loadSettings } from "./storage";

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

export function completionSoundEnabled(): boolean {
  return loadSettings().completionSound !== false; // default On
}

// One short, calm strike: a fundamental with two gentle inharmonic partials,
// each decaying exponentially — a quiet bell, not an alarm.
export function playMalaBell() {
  if (!completionSoundEnabled()) return;
  const ac = getContext();
  if (!ac) return;
  try {
    const t0 = ac.currentTime;
    const master = ac.createGain();
    master.gain.setValueAtTime(0.0001, t0);
    master.gain.exponentialRampToValueAtTime(0.22, t0 + 0.012);
    master.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.4);
    master.connect(ac.destination);

    const partials: Array<[number, number, number]> = [
      // [frequency Hz, relative gain, decay seconds]
      [660, 1.0, 2.2], // soft fundamental (~E5)
      [1320, 0.35, 1.4], // octave shimmer
      [1975, 0.12, 0.8], // faint bell-like inharmonic
    ];
    for (const [freq, gain, decay] of partials) {
      const osc = ac.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + decay);
      osc.connect(g);
      g.connect(master);
      osc.start(t0);
      osc.stop(t0 + decay + 0.1);
    }
  } catch {
    /* audio unavailable — stay silent */
  }
}
