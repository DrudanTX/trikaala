import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SESSIONS, currentSession, formatTime, getSessionTimes } from "@/lib/sessions";
import {
  loadLogs,
  loadSettings,
  defaultSettings,
  recordSession,
  todayKey,
  type SessionKey,
} from "@/lib/storage";
import { SessionSheet } from "@/components/SessionSheet";

export const Route = createFileRoute("/")({
  component: Today,
});

function Today() {
  const [logs, setLogs] = useState<ReturnType<typeof loadLogs>>({});
  const [settings, setSettings] = useState(defaultSettings);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState<SessionKey | null>(null);
  const today = todayKey();
  const todayLog = logs[today];

  useEffect(() => {
    setLogs(loadLogs());
    setSettings(loadSettings());
    setMounted(true);
  }, []);

  const times = useMemo(
    () => getSessionTimes(settings.lat, settings.lon),
    [settings.lat, settings.lon],
  );

  const greeting = (() => {
    const c = currentSession();
    return c === "pratah" ? "Good morning" : c === "madhyahnikam" ? "Good afternoon" : "Good evening";
  })();

  const todayCount = todayLog
    ? Object.values(todayLog.sessions).reduce((s, v) => s + (v?.gayatriCount || 0), 0)
    : 0;

  function handleConfirm(status: "completed" | "acknowledged", count: number) {
    if (!open) return;
    recordSession(open, status, count);
    setLogs(loadLogs());
    setOpen(null);
  }

  return (
    <div className="px-5 pt-12">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-7"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-ink-soft/70">Trikaala</p>
        <h1 className="mt-1 font-display text-3xl text-ink">{greeting}{settings.name ? `, ${settings.name}` : ""}.</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </motion.header>

      {/* Breath / today summary */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft"
      >
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-saffron/30 blur-3xl animate-breathe" />
        <p className="text-xs uppercase tracking-widest text-ink-soft/70">Today's Gayatri</p>
        <p className="mt-1 font-display text-5xl text-ink">{todayCount}</p>
        <p className="mt-2 text-sm text-ink-soft">
          {todayCount === 0 ? "A still mind is the offering." : "Each repetition, a thread of light."}
        </p>
      </motion.div>

      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-soft/70">
        Three Sandhyas
      </p>

      <div className="space-y-3">
        {SESSIONS.map((s, i) => {
          const log = todayLog?.sessions[s.key];
          const time = times?.[s.key];
          return (
            <motion.button
              key={s.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.45 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setOpen(s.key)}
              className={`relative w-full overflow-hidden rounded-3xl border border-border ${s.gradient} p-5 text-left shadow-soft`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-2xl text-ink">{s.name}</p>
                  <p className="text-sm text-ink/70">{s.sanskrit}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl text-ink/70">{s.symbol}</p>
                  {time && <p className="mt-1 text-[11px] text-ink/60">{formatTime(time)}</p>}
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <p className="text-xs text-ink/70">{s.subtitle}</p>
                {log ? (
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                      log.status === "completed"
                        ? "bg-ink text-card"
                        : "bg-card/80 text-ink-soft"
                    }`}
                  >
                    {log.status === "completed" ? `✓ ${log.gayatriCount || ""}` : "🙏 Acknowledged"}
                  </span>
                ) : (
                  <span className="rounded-full bg-card/80 px-3 py-1 text-[11px] text-ink-soft">
                    Tap to mark
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      <SessionSheet
        open={open !== null}
        session={open}
        onClose={() => setOpen(null)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
