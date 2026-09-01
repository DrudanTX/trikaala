import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SESSIONS } from "@/lib/sessions";
import type { SessionKey } from "@/lib/storage";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "Guide — Trikaala" },
      { name: "description", content: "Step-by-step guide to performing Sandhyavandhanam." },
    ],
  }),
  component: Guide,
});

const STEPS: { title: string; body: string }[] = [
  { title: "Achamanam", body: "Sip water thrice with the names of Keshava, Narayana, Madhava — purifying body and intent." },
  { title: "Pranayama", body: "Steady the breath. Inhale through the left, retain, exhale through the right — calming the channels of awareness." },
  { title: "Sankalpa", body: "Set the intention: place, time, and the quiet purpose of this Sandhya." },
  { title: "Marjanam", body: "Sprinkle water with mantras — the symbolic cleansing of the inner field." },
  { title: "Arghyam", body: "Offer water to the Sun at the meeting of two times — the Sandhi." },
  { title: "Gayatri Japa", body: "Repeat the Gayatri mantra with awareness. 11, 27, 54, 108 — or whatever the moment allows." },
  { title: "Upasthanam", body: "Stand in salutation. Offer the practice back to the Light." },
];

function Guide() {
  const [session, setSession] = useState<SessionKey>("pratah");
  const [step, setStep] = useState(0);

  return (
    <div className="px-5 pt-12">
      <p className="text-xs uppercase tracking-[0.2em] text-ink-soft/70">Guided Practice</p>
      <h1 className="mt-1 font-display text-3xl text-ink">Step by step.</h1>
      <p className="mt-1 text-sm text-ink-soft">
        A simple outline. Your tradition's specifics may vary — follow your acharya.
      </p>

      <div className="mt-5 flex gap-2">
        {SESSIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => {
              setSession(s.key);
              setStep(0);
            }}
            className={`flex-1 rounded-2xl border px-3 py-2 text-xs font-medium transition ${
              session === s.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-ink-soft"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-soft min-h-[260px]">
        <p className="text-xs text-ink-soft">
          Step {step + 1} of {STEPS.length}
        </p>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="mt-1 font-display text-2xl text-ink">{STEPS[step].title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{STEPS[step].body}</p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition ${
                i <= step ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex-1 rounded-2xl border border-border bg-secondary py-3 text-sm text-ink disabled:opacity-40"
          >
            Back
          </button>
          <button
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            disabled={step === STEPS.length - 1}
            className="flex-1 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      <p className="mt-6 rounded-2xl bg-secondary/60 p-4 text-xs text-ink-soft">
        🎧 Audio guidance coming soon.
      </p>
    </div>
  );
}
