// Local-first storage for Trikaala. Each session log is keyed by date+session.
export type SessionKey = "pratah" | "madhyahnikam" | "sayam";

export type SessionStatus = "completed" | "acknowledged"; // acknowledged = missed but noted

export interface SessionLog {
  status: SessionStatus;
  gayatriCount: number;
  at: string; // ISO timestamp
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  sessions: Partial<Record<SessionKey, SessionLog>>;
}

const KEY = "sandhyaflow:logs:v1";
const SETTINGS_KEY = "sandhyaflow:settings:v1";

export interface Settings {
  lat?: number;
  lon?: number;
  reminders: { pratah: boolean; madhyahnikam: boolean; sayam: boolean };
  manualTimes?: { pratah?: string; madhyahnikam?: string; sayam?: string };
  name?: string;
}

export const defaultSettings: Settings = {
  reminders: { pratah: true, madhyahnikam: true, sayam: true },
};

function isClient() {
  return typeof window !== "undefined";
}

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function loadLogs(): Record<string, DayLog> {
  if (!isClient()) return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveLogs(logs: Record<string, DayLog>) {
  if (!isClient()) return;
  localStorage.setItem(KEY, JSON.stringify(logs));
}

export function recordSession(
  session: SessionKey,
  status: SessionStatus,
  gayatriCount = 0,
  date = todayKey(),
) {
  const logs = loadLogs();
  const day = logs[date] || { date, sessions: {} };
  day.sessions[session] = { status, gayatriCount, at: new Date().toISOString() };
  logs[date] = day;
  saveLogs(logs);
  return day;
}

export function clearSession(session: SessionKey, date = todayKey()) {
  const logs = loadLogs();
  if (logs[date]) {
    delete logs[date].sessions[session];
    saveLogs(logs);
  }
}

export function loadSettings(): Settings {
  if (!isClient()) return defaultSettings;
  try {
    return { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(s: Settings) {
  if (!isClient()) return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

// Stats
export function getStreak(logs: Record<string, DayLog>): number {
  let streak = 0;
  const d = new Date();
  // grace: a day counts if at least one session completed OR acknowledged
  while (true) {
    const key = todayKey(d);
    const day = logs[key];
    const any = day && Object.values(day.sessions).some((s) => s);
    if (any) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      // allow today to be empty without breaking streak
      if (streak === 0 && key === todayKey()) {
        d.setDate(d.getDate() - 1);
        continue;
      }
      break;
    }
  }
  return streak;
}

export function getWeekDays(): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 6; i >= 0; i--) {
    const c = new Date(d);
    c.setDate(d.getDate() - i);
    out.push(todayKey(c));
  }
  return out;
}

export function totalGayatri(logs: Record<string, DayLog>, dateKeys: string[]): number {
  return dateKeys.reduce((sum, k) => {
    const day = logs[k];
    if (!day) return sum;
    return sum + Object.values(day.sessions).reduce((a, s) => a + (s?.gayatriCount || 0), 0);
  }, 0);
}

export function completionPct(logs: Record<string, DayLog>, dateKeys: string[]): number {
  const total = dateKeys.length * 3;
  let done = 0;
  for (const k of dateKeys) {
    const day = logs[k];
    if (!day) continue;
    done += Object.values(day.sessions).filter((s) => s?.status === "completed").length;
  }
  return Math.round((done / total) * 100);
}
