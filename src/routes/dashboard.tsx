import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  completionPct,
  getStreak,
  getWeekDays,
  loadLogs,
  totalGayatri,
} from "@/lib/storage";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Journey — Trikaala" },
      { name: "description", content: "Your weekly Sandhyavandhanam progress, streak, and Gayatri totals." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [logs, setLogs] = useState<ReturnType<typeof loadLogs>>({});
  useEffect(() => setLogs(loadLogs()), []);

  const week = getWeekDays();
  const streak = getStreak(logs);
  const weekly = totalGayatri(logs, week);
  const today = totalGayatri(logs, [week[week.length - 1]]);
  const pct = completionPct(logs, week);

  return (
    <div className="px-5 pt-12">
      <p className="text-xs uppercase tracking-[0.2em] text-ink-soft/70">Your Journey</p>
      <h1 className="mt-1 font-display text-3xl text-ink">A quiet record.</h1>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Stat label="Current streak" value={`${streak}`} suffix={streak === 1 ? "day" : "days"} accent />
        <Stat label="This week" value={`${pct}%`} suffix="completed" />
        <Stat label="Today's Gayatri" value={`${today}`} />
        <Stat label="Weekly Gayatri" value={`${weekly}`} />
      </div>

      <h2 className="mt-8 mb-3 font-display text-xl text-ink">Last 7 days</h2>
      <div className="rounded-3xl border border-border bg-card p-4 shadow-soft">
        <div className="grid grid-cols-7 gap-2">
          {week.map((dKey, i) => {
            const day = logs[dKey];
            const sessions = day ? Object.values(day.sessions) : [];
            const count = sessions.filter((s) => s?.status === "completed").length;
            const ack = sessions.filter((s) => s?.status === "acknowledged").length;
            const total = count + ack * 0.4;
            const intensity = Math.min(total / 3, 1);
            const date = new Date(dKey);
            return (
              <motion.div
                key={dKey}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className="flex h-12 w-full items-center justify-center rounded-xl border border-border text-xs font-medium text-ink"
                  style={{
                    background: `color-mix(in oklab, var(--saffron) ${intensity * 80}%, var(--card))`,
                  }}
                >
                  {count > 0 ? count : ack > 0 ? "·" : ""}
                </div>
                <span className="text-[10px] text-ink-soft">
                  {date.toLocaleDateString(undefined, { weekday: "narrow" })}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-border bg-secondary/60 p-5 text-sm text-ink-soft">
        <p className="font-display text-base text-ink">Gentle reminder</p>
        <p className="mt-1">
          Consistency is a kindness, not a discipline. A missed Sandhya, acknowledged with awareness,
          keeps your thread of practice unbroken.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value, suffix, accent }: { label: string; value: string; suffix?: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-3xl border border-border p-4 shadow-soft ${
        accent ? "bg-dawn" : "bg-card"
      }`}
    >
      <p className="text-[11px] uppercase tracking-widest text-ink-soft/80">{label}</p>
      <p className="mt-2 font-display text-3xl text-ink">{value}</p>
      {suffix && <p className="text-xs text-ink-soft">{suffix}</p>}
    </div>
  );
}
