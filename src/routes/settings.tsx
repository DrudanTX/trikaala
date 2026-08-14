import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { defaultSettings, loadSettings, saveSettings, type Settings } from "@/lib/storage";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "You — Trikaala" },
      { name: "description", content: "Personalize Trikaala: name, location for sun-aware reminders, and preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [s, setS] = useState<Settings>(defaultSettings);
  const [status, setStatus] = useState<string>("");

  useEffect(() => setS(loadSettings()), []);

  function update(next: Partial<Settings>) {
    const merged = { ...s, ...next };
    setS(merged);
    saveSettings(merged);
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      setStatus("Geolocation not available.");
      return;
    }
    setStatus("Locating…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setStatus("Location saved.");
      },
      () => setStatus("Couldn't get location."),
    );
  }

  return (
    <div className="px-5 pt-12">
      <p className="text-xs uppercase tracking-[0.2em] text-ink-soft/70">Your Space</p>
      <h1 className="mt-1 font-display text-3xl text-ink">Settings</h1>

      <section className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-soft">
        <p className="text-xs uppercase tracking-widest text-ink-soft/70">Name</p>
        <input
          value={s.name || ""}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="What should we call you?"
          className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary"
        />
      </section>

      <section className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
        <p className="text-xs uppercase tracking-widest text-ink-soft/70">Location</p>
        <p className="mt-2 text-sm text-ink-soft">
          Used to compute sunrise, midday, and sunset times for your Sandhyas.
        </p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="text-sm text-ink">
            {s.lat != null ? (
              <>
                <span className="font-medium">{s.lat.toFixed(2)}, {s.lon!.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-ink-soft">Not set</span>
            )}
          </div>
          <button
            onClick={detectLocation}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Detect
          </button>
        </div>
        {status && <p className="mt-2 text-xs text-ink-soft">{status}</p>}
      </section>

      <section className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
        <p className="text-xs uppercase tracking-widest text-ink-soft/70">Reminders</p>
        <p className="mt-2 text-sm text-ink-soft">
          Gentle nudges around the Sandhi times. Browser notifications are best-effort.
        </p>
        <div className="mt-3 space-y-2">
          {(["pratah", "madhyahnikam", "sayam"] as const).map((k) => (
            <label key={k} className="flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-3">
              <span className="text-sm capitalize text-ink">{k}</span>
              <input
                type="checkbox"
                checked={s.reminders[k]}
                onChange={(e) => update({ reminders: { ...s.reminders, [k]: e.target.checked } })}
                className="h-5 w-5 accent-[var(--primary)]"
              />
            </label>
          ))}
        </div>
        <button
          onClick={async () => {
            if (!("Notification" in window)) return setStatus("Notifications not supported.");
            const r = await Notification.requestPermission();
            setStatus(r === "granted" ? "Notifications enabled." : "Notifications declined.");
          }}
          className="mt-3 w-full rounded-xl border border-border bg-background py-2.5 text-sm text-ink"
        >
          Enable browser notifications
        </button>
      </section>

      <section className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
        <p className="text-xs uppercase tracking-widest text-ink-soft/70">Privacy & Legal</p>
        <Link
          to="/privacy"
          className="mt-3 flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-3 text-sm text-ink transition-colors hover:bg-secondary"
        >
          <span>Privacy Policy</span>
          <span aria-hidden="true" className="text-ink-soft">›</span>
        </Link>
      </section>

      <section className="mt-4 rounded-3xl border border-dashed border-border bg-card/40 p-5">
        <p className="text-xs uppercase tracking-widest text-ink-soft/70">Coming Soon</p>
        <ul className="mt-2 space-y-1 text-sm text-ink-soft">
          <li>· Optional sign-in & sync across devices</li>
          <li>· Multi-language (Sanskrit, Tamil, Telugu, Kannada, Hindi)</li>
          <li>· Audio guided Sandhyavandhanam</li>
          <li>· Deeper analytics & monthly reflections</li>
        </ul>
      </section>

      <p className="mt-8 text-center text-[11px] text-ink-soft/70">
        Trikaala · ॐ
      </p>
    </div>
  );
}
