import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  DEFAULT_TARGET,
  JAPA_PRESETS,
  appendSession,
  clearActive,
  emptyActive,
  loadActive,
  saveActive,
} from "@/lib/japa";
import { hapticLight, hapticStrong } from "@/lib/haptics";
import { playMalaBell } from "@/lib/audio";

export const Route = createFileRoute("/japa")({
  head: () => ({
    meta: [
      { title: "Japa Counter — Trikaala" },
      {
        name: "description",
        content:
          "A calm, distraction-free japa counter for mantra repetition — 27, 54, 108 or 1008 — with haptics, undo, and saved practice history.",
      },
      { property: "og:title", content: "Japa Counter — Trikaala" },
      {
        property: "og:description",
        content:
          "Count your mala quietly. Tap to advance, undo mistakes, and keep a gentle record of every completed japa session.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Japa Counter — Trikaala" },
      {
        name: "twitter:description",
        content:
          "Count your mala quietly. Tap to advance, undo mistakes, and keep a gentle record of every completed japa session.",
      },
    ],
  }),
  component: JapaCounter,
});

const TAP_DEBOUNCE_MS = 120;
const RING = 2 * Math.PI * 46;

function JapaCounter() {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(DEFAULT_TARGET);
  const [startedAt, setStartedAt] = useState("");
  const [mounted, setMounted] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pulse, setPulse] = useState(0);

  const lastTap = useRef(0);
  const reachedRef = useRef(false);

  // Restore any in-progress session after hydration.
  useEffect(() => {
    const a = loadActive();
    setCount(a.count);
    setTarget(a.target);
    setStartedAt(a.startedAt);
    reachedRef.current = a.count >= a.target;
    setMounted(true);
  }, []);

  // Persist continuously so navigating away never loses progress.
  useEffect(() => {
    if (!mounted) return;
    if (count === 0 && !startedAt && target === DEFAULT_TARGET) {
      clearActive();
      return;
    }
    saveActive({ count, target, startedAt });
  }, [mounted, count, target, startedAt]);

  const completed = count >= target;
  const pct = target > 0 ? Math.min((count / target) * 100, 100) : 0;

  const bump = useCallback(
    (delta: number, viaTap: boolean) => {
      if (viaTap) {
        const now = Date.now();
        if (now - lastTap.current < TAP_DEBOUNCE_MS) return;
        lastTap.current = now;
      }
      setSaved(false);
      setStartedAt((s) => s || new Date().toISOString());
      setCount((c) => {
        const next = Math.max(0, c + delta);
        if (delta > 0) {
          if (next >= target && !reachedRef.current) {
            reachedRef.current = true;
            hapticStrong();
            playMalaBell(); // once only — reachedRef guards repeats
          } else if (next < target) {
            reachedRef.current = false;
            hapticLight();
          } else {
            hapticLight();
          }
          setPulse((p) => p + 1);
        } else if (next < target) {
          reachedRef.current = false;
        }
        return next;
      });
    },
    [target],
  );

  function doReset() {
    setCount(0);
    setStartedAt("");
    setSaved(false);
    reachedRef.current = false;
    setConfirmReset(false);
    clearActive();
  }

  function completeSession() {
    if (count <= 0) return;
    appendSession({ target, count, startedAt: startedAt || new Date().toISOString() });
    setSaved(true);
    setCount(0);
    setStartedAt("");
    reachedRef.current = false;
    clearActive();
    hapticStrong();
  }

  function chooseTarget(n: number) {
    setTarget(n);
    setCustomOpen(false);
    reachedRef.current = count >= n;
  }

  return (
    <div className="px-5 pb-6 pt-12">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-soft/70">Japa Counter</p>
        <h1 className="mt-1 font-display text-3xl text-ink">{target} Japa</h1>
        <p className="mt-1 text-sm text-ink-soft">One breath, one name. No hurry.</p>
      </header>

      {/* Presets */}
      <div className="mb-6 grid grid-cols-5 gap-2">
        {JAPA_PRESETS.map((n) => (
          <button
            key={n}
            onClick={() => chooseTarget(n)}
            className={`rounded-xl border py-2 text-xs font-medium transition ${
              target === n && !customOpen
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-secondary text-ink hover:bg-accent"
            }`}
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => {
            setCustomOpen(true);
            setCustomValue(String(target));
          }}
          className={`rounded-xl border py-2 text-xs font-medium transition ${
            customOpen
              ? "border-primary text-primary"
              : "border-dashed border-border text-ink-soft hover:bg-accent"
          }`}
        >
          Custom
        </button>
      </div>

      <AnimatePresence initial={false}>
        {customOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="flex gap-2">
              <input
                autoFocus
                type="number"
                min={1}
                inputMode="numeric"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder="Target count"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-center text-base text-ink outline-none focus:border-primary"
              />
              <button
                onClick={() => {
                  const n = parseInt(customValue, 10);
                  if (Number.isFinite(n) && n > 0) {
                    setTarget(n);
                    reachedRef.current = count >= n;
                    setCustomOpen(false);
                  }
                }}
                className="shrink-0 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
              >
                Set
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tap area */}
      <button
        onClick={() => bump(1, true)}
        aria-label={`Advance japa count. Currently ${count} of ${target}`}
        className="relative mx-auto flex aspect-square w-full max-w-[19rem] select-none items-center justify-center rounded-full border border-border bg-card shadow-soft transition active:scale-[0.985]"
        style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
      >
        {completed && (
          <span className="pointer-events-none absolute inset-6 animate-breathe rounded-full bg-saffron/25 blur-2xl" />
        )}

        <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full -rotate-90">
          <circle cx="50" cy="50" r="46" fill="none" stroke="var(--border)" strokeWidth="2.5" />
          <motion.circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="var(--saffron)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={RING}
            animate={{ strokeDashoffset: RING - (RING * pct) / 100 }}
            transition={{ type: "spring", stiffness: 140, damping: 24 }}
          />
        </svg>

        <div className="relative flex flex-col items-center">
          <motion.span
            key={pulse}
            initial={{ scale: 0.94, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }}
            className="font-display text-7xl leading-none text-ink tabular-nums"
          >
            {mounted ? count : 0}
          </motion.span>
          <span className="mt-2 text-sm text-ink-soft">/ {target}</span>
          {completed && (
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 rounded-full bg-primary px-4 py-1 text-[11px] font-medium tracking-wide text-primary-foreground"
            >
              Completed
            </motion.span>
          )}
        </div>
      </button>

      <p className="mt-5 text-center text-xs text-ink-soft">
        Tap anywhere in the circle · Progress: {pct.toFixed(1)}%
      </p>

      {/* Fine adjust */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={() => bump(-1, false)}
          disabled={count === 0}
          aria-label="Decrease count"
          className="min-h-14 rounded-2xl border border-border bg-secondary text-2xl text-ink transition hover:bg-accent disabled:opacity-40"
        >
          —
        </button>
        <button
          onClick={() => bump(1, false)}
          aria-label="Increase count"
          className="min-h-14 rounded-2xl border border-border bg-secondary text-2xl text-ink transition hover:bg-accent"
        >
          +
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <button
          onClick={() => bump(-1, false)}
          disabled={count === 0}
          className="min-h-12 rounded-2xl border border-border bg-card text-sm font-medium text-ink-soft transition hover:bg-accent disabled:opacity-40"
        >
          Undo
        </button>
        <button
          onClick={() => setConfirmReset(true)}
          disabled={count === 0}
          className="min-h-12 rounded-2xl border border-border bg-card text-sm font-medium text-ink-soft transition hover:bg-accent disabled:opacity-40"
        >
          Reset
        </button>
      </div>

      <button
        onClick={completeSession}
        disabled={count <= 0}
        className={`mt-4 min-h-14 w-full rounded-2xl py-4 text-sm font-semibold tracking-wide transition disabled:opacity-40 ${
          completed
            ? "bg-primary text-primary-foreground shadow-glow"
            : "border border-border bg-secondary text-ink"
        }`}
      >
        Complete Session
      </button>

      <AnimatePresence>
        {saved && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-center text-xs text-ink-soft"
          >
            Saved to your journey. 🙏
          </motion.p>
        )}
      </AnimatePresence>

      {/* Reset confirmation */}
      <AnimatePresence>
        {confirmReset && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmReset(false)}
              className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-t-3xl border border-border bg-card p-6 pb-8 shadow-soft"
            >
              <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-border" />
              <p className="font-display text-2xl text-ink">Reset the count?</p>
              <p className="mt-2 text-sm text-ink-soft">
                This clears the current japa of {count}. Nothing already saved to your journey is
                affected.
              </p>
              <div className="mt-6 grid gap-2">
                <button
                  onClick={doReset}
                  className="min-h-12 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
                >
                  Yes, reset
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="min-h-12 rounded-2xl border border-border bg-secondary py-3 text-sm font-medium text-ink-soft"
                >
                  Keep counting
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
