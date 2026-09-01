import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { defaultSettings, loadSettings, saveSettings, type SessionKey, type Settings } from "@/lib/storage";
import { formatTime, getSessionTimes } from "@/lib/sessions";
import { ensurePermission, isNative, syncNotifications, cancelAllNotifications, sendTestNotification } from "@/lib/notifications";

const SESSION_ROWS: [SessionKey, string][] = [
  ["pratah", "Prātaḥ Sandhyā"],
  ["madhyahnikam", "Mādhyāhnika"],
  ["sayam", "Sāyam Sandhyā"],
];

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
  const [testing, setTesting] = useState(false);

  useEffect(() => setS(loadSettings()), []);

  const calculated = useMemo(() => getSessionTimes(s.lat, s.lon), [s.lat, s.lon]);

  function update(next: Partial<Settings>) {
    const merged = { ...s, ...next };
    setS(merged);
    saveSettings(merged);
    void syncNotifications(merged).then((r) => {
      if (merged.notificationsEnabled && r.reason) setStatus(r.reason);
    });
  }

  async function toggleNotifications(on: boolean) {
    if (!on) {
      update({ notificationsEnabled: false });
      await cancelAllNotifications();
      setStatus("Reminders turned off.");
      return;
    }
    setStatus("Requesting notification permission…");
    const perm = await ensurePermission(true);
    if (perm !== "granted") {
      update({ notificationsEnabled: false, permissionDenied: true });
      setStatus(
        isNative()
          ? "Notifications are blocked. Enable them for Trikaala in your device Settings → Notifications."
          : "Notifications are blocked in your browser settings.",
      );
      return;
    }
    const merged = { ...s, notificationsEnabled: true, permissionDenied: false };
    setS(merged);
    saveSettings(merged);
    const r = await syncNotifications(merged);
    setStatus(r.scheduled ? `Reminders scheduled (${r.scheduled} upcoming).` : (r.reason ?? "Nothing to schedule."));
  }

  async function runTestNotification() {
    setTesting(true);
    setStatus("Testing…");
    try {
      setStatus(await sendTestNotification());
    } catch (e) {
      setStatus(`Test failed: ${(e as Error)?.message ?? String(e)}`);
    } finally {
      setTesting(false);
    }
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
        <p className="text-xs uppercase tracking-widest text-ink-soft/70">Notifications</p>

        <label className="mt-3 flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-3">
          <span className="text-sm text-ink">Daily Sandhyā Reminders</span>
          <input
            type="checkbox"
            checked={s.notificationsEnabled === true}
            onChange={(e) => toggleNotifications(e.target.checked)}
            className="h-5 w-5 accent-[var(--primary)]"
          />
        </label>

        {s.notificationsEnabled && (
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-ink-soft/70">Reminder Times</p>
              <div className="mt-2 flex rounded-xl border border-border p-1">
                {(["calculated", "custom"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => update({ reminderMode: m })}
                    className={`flex-1 rounded-lg py-2 text-sm capitalize transition-colors ${
                      (s.reminderMode ?? "calculated") === m
                        ? "bg-primary text-primary-foreground"
                        : "text-ink-soft"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-ink-soft">
                {(s.reminderMode ?? "calculated") === "calculated"
                  ? "Follows sunrise, midday and sunset for your location — updated each day."
                  : "Your chosen times, used every day until you change them."}
              </p>
            </div>

            {(s.reminderMode ?? "calculated") === "custom" ? (
              <div className="space-y-2">
                {SESSION_ROWS.map(([k, label]) => (
                  <label
                    key={k}
                    className="flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-3"
                  >
                    <span className="text-sm text-ink">{label}</span>
                    <input
                      type="time"
                      value={s.manualTimes?.[k] || ""}
                      onChange={(e) =>
                        update({ manualTimes: { ...s.manualTimes, [k]: e.target.value } })
                      }
                      className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-ink outline-none focus:border-primary"
                    />
                  </label>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {SESSION_ROWS.map(([k, label]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-3"
                  >
                    <span className="text-sm text-ink">{label}</span>
                    <span className="text-sm text-ink-soft">
                      {calculated ? formatTime(calculated[k]) : "Set location"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div>
              <p className="text-xs uppercase tracking-widest text-ink-soft/70">Remind me</p>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {([0, 5, 10, 15] as const).map((o) => (
                  <button
                    key={o}
                    onClick={() => update({ reminderOffset: o })}
                    className={`rounded-xl border py-2 text-xs transition-colors ${
                      (s.reminderOffset ?? 0) === o
                        ? "border-primary bg-primary/10 text-ink"
                        : "border-border text-ink-soft"
                    }`}
                  >
                    {o === 0 ? "At time" : `${o}m before`}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {SESSION_ROWS.map(([k, label]) => (
                <label
                  key={k}
                  className="flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-3"
                >
                  <span className="text-sm text-ink">{label}</span>
                  <input
                    type="checkbox"
                    checked={s.reminders[k]}
                    onChange={(e) =>
                      update({ reminders: { ...s.reminders, [k]: e.target.checked } })
                    }
                    className="h-5 w-5 accent-[var(--primary)]"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 rounded-xl border border-dashed border-border p-4">
          <p className="text-xs uppercase tracking-widest text-ink-soft/70">Developer</p>
          <button
            onClick={runTestNotification}
            disabled={testing}
            className="mt-2 w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {testing ? "Scheduling…" : "Test Notification"}
          </button>
          <p className="mt-2 text-xs text-ink-soft">
            Schedules one notification 60 seconds from now to verify permissions and delivery.
          </p>
        </div>

        {status && <p className="mt-3 text-xs text-ink-soft">{status}</p>}
      </section>



      <section className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
        <p className="text-xs uppercase tracking-widest text-ink-soft/70">Sound</p>
        <p className="mt-2 text-sm text-ink-soft">
          A soft bell chimes once when you complete a mala in the Japa Counter.
        </p>
        <label className="mt-3 flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-3">
          <span className="text-sm text-ink">Completion Sound</span>
          <input
            type="checkbox"
            checked={s.completionSound !== false}
            onChange={(e) => update({ completionSound: e.target.checked })}
            className="h-5 w-5 accent-[var(--primary)]"
          />
        </label>
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
        <Link
          to="/terms"
          className="mt-2 flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-3 text-sm text-ink transition-colors hover:bg-secondary"
        >
          <span>Terms of Service</span>
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
