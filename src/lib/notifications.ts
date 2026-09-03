// Native (Capacitor) local notifications for Trikaala's Sandhya reminders.
// Reuses the app's existing astronomical calculations (src/lib/sessions.ts)
// and the existing local settings store (src/lib/storage.ts).
import { Capacitor } from "@capacitor/core";
import { getSessionTimes } from "./sessions";
import { loadSettings, saveSettings, type SessionKey, type Settings } from "./storage";

export const SESSION_LABELS: Record<SessionKey, { title: string; body: string }> = {
  pratah: {
    title: "☀️ Prātaḥ Sandhyā",
    body: "A moment for your morning Sandhyāvandanam.",
  },
  madhyahnikam: {
    title: "☀️ Mādhyāhnika",
    body: "A moment for your midday Sandhyāvandanam.",
  },
  sayam: {
    title: "🌙 Sāyam Sandhyā",
    body: "A moment for your evening Sandhyāvandanam.",
  },
};

const SESSION_ORDER: SessionKey[] = ["pratah", "madhyahnikam", "sayam"];
const DAYS_AHEAD = 14;
const CHANNEL_ID = "trikaala-sandhya";
const NATIVE_CALL_TIMEOUT_MS = 15_000;

export type NotificationPermission = "granted" | "denied" | "prompt";

export function isNative() {
  return typeof window !== "undefined" && Capacitor.isNativePlatform();
}

async function plugin() {
  if (!Capacitor.isPluginAvailable("LocalNotifications")) {
    throw new Error("The native Local Notifications plugin is unavailable. Re-sync and rebuild the iOS app.");
  }
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  return LocalNotifications;
}

async function withNativeTimeout<T>(operation: string, promise: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${operation} did not respond. Close and reopen Trikaala, then try again.`)),
          NATIVE_CALL_TIMEOUT_MS,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** Stable id per session per day-offset so rescheduling replaces, never duplicates. */
function notifId(session: SessionKey, dayOffset: number) {
  return (SESSION_ORDER.indexOf(session) + 1) * 1000 + dayOffset;
}

function parseHHMM(v: string | undefined, date: Date): Date | null {
  if (!v) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(v.trim());
  if (!m) return null;
  const d = new Date(date);
  d.setHours(Number(m[1]), Number(m[2]), 0, 0);
  return d;
}

/**
 * Resolve the reminder instant for one session on a given date, honouring the
 * Calculated/Custom mode and the reminder offset. Returns null when unavailable.
 */
export function resolveReminderTime(
  session: SessionKey,
  settings: Settings,
  date: Date,
): Date | null {
  let base: Date | null = null;
  if (settings.reminderMode === "custom") {
    base = parseHHMM(settings.manualTimes?.[session], date);
  } else {
    const times = getSessionTimes(settings.lat, settings.lon, date);
    if (times) {
      const t = times[session];
      base = t instanceof Date && !isNaN(t.getTime()) ? new Date(t) : null;
    }
  }
  if (!base) return null;
  const offset = settings.reminderOffset ?? 0;
  return new Date(base.getTime() - offset * 60_000);
}

async function cancelAll() {
  const LN = await plugin();
  const ids: { id: number }[] = [];
  for (const s of SESSION_ORDER) {
    for (let d = 0; d < DAYS_AHEAD; d++) ids.push({ id: notifId(s, d) });
  }
  try {
    await LN.cancel({ notifications: ids });
  } catch {
    /* nothing scheduled */
  }
}

export async function ensurePermission(request = false): Promise<NotificationPermission> {
  if (!isNative()) {
    console.info("[Notifications] Environment: web");
    if (typeof Notification === "undefined") return "denied";
    if (Notification.permission === "granted") return "granted";
    if (Notification.permission === "denied") return "denied";
    if (!request) return "prompt";
    return (await Notification.requestPermission()) === "granted" ? "granted" : "denied";
  }

  const platform = Capacitor.getPlatform();
  console.info(`[Notifications] Environment: native ${platform}`);
  const LN = await plugin();

  console.info("[Notifications] Checking permission");
  let status = await withNativeTimeout("Checking notification permission", LN.checkPermissions());
  console.info("[Notifications] Permission state:", status.display);

  if (status.display !== "granted" && request) {
    console.info("[Notifications] Requesting permission");
    try {
      await withNativeTimeout("Requesting notification permission", LN.requestPermissions());
    } catch (error) {
      console.error("[Notifications] Permission request failed:", error);
      // iOS can update authorization even if the bridge callback is interrupted.
      // Re-read the OS state once before reporting the native call as failed.
    }

    status = await withNativeTimeout("Reading notification permission", LN.checkPermissions());
    console.info("[Notifications] Permission result:", status.display);
  }

  if (status.display === "granted") return "granted";
  if (status.display === "denied") return "denied";
  return "prompt";
}

async function ensureChannel() {
  if (Capacitor.getPlatform() !== "android") return;
  const LN = await plugin();
  try {
    await LN.createChannel({
      id: CHANNEL_ID,
      name: "Sandhyā Reminders",
      description: "Gentle daily reminders for Prātaḥ, Mādhyāhnika and Sāyam Sandhyā.",
      importance: 4,
      visibility: 1,
      vibration: true,
      sound: undefined,
    });
  } catch {
    /* channel already exists */
  }
}

export interface SyncResult {
  scheduled: number;
  reason?: string;
}

/**
 * Cancel and re-create the full reminder schedule from current settings.
 * Safe to call on every app start, settings change, or date change.
 */
export async function syncNotifications(settings: Settings = loadSettings()): Promise<SyncResult> {
  if (!isNative()) return { scheduled: 0, reason: "Native reminders only run in the installed app." };
  try {
    const LN = await plugin();
    await ensureChannel();
    await cancelAll();

    if (settings.notificationsEnabled === false) return { scheduled: 0, reason: "Reminders are off." };
    const perm = await ensurePermission(false);
    if (perm !== "granted") return { scheduled: 0, reason: "Notification permission not granted." };

    if ((settings.reminderMode ?? "calculated") === "calculated" && settings.lat == null) {
      return { scheduled: 0, reason: "Set your location to compute Sandhyā times." };
    }

    const now = Date.now();
    const notifications: Parameters<typeof LN.schedule>[0]["notifications"] = [];
    const isAndroid = Capacitor.getPlatform() === "android";

    for (let d = 0; d < DAYS_AHEAD; d++) {
      const date = new Date();
      date.setDate(date.getDate() + d);
      date.setHours(12, 0, 0, 0);
      for (const s of SESSION_ORDER) {
        if (!settings.reminders[s]) continue;
        const at = resolveReminderTime(s, settings, date);
        if (!at || at.getTime() <= now + 30_000) continue;
        notifications.push({
          id: notifId(s, d),
          title: SESSION_LABELS[s].title,
          body: SESSION_LABELS[s].body,
          ...(isAndroid ? { channelId: CHANNEL_ID, smallIcon: "ic_launcher_foreground" } : {}),
          schedule: { at, allowWhileIdle: isAndroid },
        });
      }
    }

    if (notifications.length) {
      await withNativeTimeout("Scheduling notifications", LN.schedule({ notifications }));
    }
    const updated = { ...settings, lastScheduledOn: new Date().toDateString() };
    saveSettings(updated);
    console.info("[Notifications] Scheduled reminders:", notifications.length);
    return {
      scheduled: notifications.length,
      reason: notifications.length ? undefined : "No upcoming reminder times to schedule.",
    };
  } catch (error) {
    console.error("[Notifications] Scheduling failed:", error);
    const message = error instanceof Error ? error.message : String(error);
    return { scheduled: 0, reason: `Scheduling failed: ${message}` };
  }
}

export async function cancelAllNotifications() {
  if (!isNative()) return;
  await cancelAll();
}

