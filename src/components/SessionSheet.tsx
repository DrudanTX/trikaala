import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { SessionKey } from "@/lib/storage";
import { getSessionMeta } from "@/lib/sessions";

interface Props {
  open: boolean;
  session: SessionKey | null;
  onClose: () => void;
  onConfirm: (status: "completed" | "acknowledged", count: number) => void;
}

const QUICK = [11, 27, 54, 108];

export function SessionSheet({ open, session, onClose, onConfirm }: Props) {
  const [count, setCount] = useState<number | "">("");
  const [custom, setCustom] = useState(false);

  if (!session) return null;
  const meta = getSessionMeta(session);

  function reset() {
    setCount("");
    setCustom(false);
  }

  function handle(status: "completed" | "acknowledged") {
    onConfirm(status, typeof count === "number" ? count : 0);
    reset();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              reset();
              onClose();
            }}
            className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-t-3xl border border-border bg-card p-6 pb-8 shadow-soft"
          >
            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-border" />
            <div className={`relative -mx-2 mb-5 overflow-hidden rounded-2xl ${meta.gradient} p-5`}>
              <div className="text-3xl text-ink/80">{meta.symbol}</div>
              <p className="mt-2 font-display text-2xl text-ink">{meta.name}</p>
              <p className="text-sm text-ink/70">{meta.sanskrit} · {meta.subtitle}</p>
            </div>

            <p className="mb-2 text-sm font-medium text-ink-soft">
              How many Gayatri mantras did you complete?
            </p>
            <p className="mb-3 text-xs text-muted-foreground">Optional — no pressure.</p>

            <div className="mb-3 grid grid-cols-4 gap-2">
              {QUICK.map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    setCount(n);
                    setCustom(false);
                  }}
                  className={`rounded-xl border py-2.5 text-sm font-medium transition ${
                    count === n && !custom
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-secondary text-ink hover:bg-accent"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCustom(true)}
              className={`mb-2 w-full rounded-xl border py-2 text-xs font-medium transition ${
                custom ? "border-primary text-primary" : "border-dashed border-border text-ink-soft"
              }`}
            >
              Custom count
            </button>
            {custom && (
              <input
                autoFocus
                type="number"
                min={1}
                value={count}
                onChange={(e) => setCount(e.target.value ? parseInt(e.target.value) : "")}
                placeholder="Enter count"
                className="mb-4 w-full rounded-xl border border-border bg-background px-4 py-3 text-center text-lg outline-none focus:border-primary"
              />
            )}

            <div className="mt-5 grid grid-cols-1 gap-2">
              <button
                onClick={() => handle("completed")}
                className="rounded-2xl bg-primary py-4 text-sm font-semibold tracking-wide text-primary-foreground shadow-glow transition hover:opacity-95"
              >
                Mark Completed
              </button>
              <button
                onClick={() => handle("acknowledged")}
                className="rounded-2xl border border-border bg-secondary py-3 text-sm font-medium text-ink-soft transition hover:bg-accent"
              >
                Missed — but acknowledged 🙏
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
