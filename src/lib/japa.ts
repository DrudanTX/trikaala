// Local-first Japa counter storage. Kept in its own keys so Sandhya logs are untouched.
import { todayKey } from "./storage";

const ACTIVE_KEY = "trikaala:japa:active:v1";
const HISTORY_KEY = "trikaala:japa:history:v1";

export const JAPA_PRESETS = [27, 54, 108, 1008] as const;
export const DEFAULT_TARGET = 108;

export interface ActiveJapa {
  count: number;
  target: number;
  startedAt: string; // ISO
}

export interface JapaSession {
  id: string;
  date: string; // YYYY-MM-DD
  target: number;
  count: number;
  startedAt: string;
  completedAt: string;
}

export const emptyActive: ActiveJapa = {
  count: 0,
  target: DEFAULT_TARGET,
  startedAt: "",
};

function isClient() {
  return typeof window !== "undefined";
}

export function loadActive(): ActiveJapa {
  if (!isClient()) return emptyActive;
  try {
    const raw = localStorage.getItem(ACTIVE_KEY);
    if (!raw) return emptyActive;
    const parsed = JSON.parse(raw) as Partial<ActiveJapa>;
    const target =
      typeof parsed.target === "number" && parsed.target > 0
        ? Math.floor(parsed.target)
        : DEFAULT_TARGET;
    const count =
      typeof parsed.count === "number" && parsed.count >= 0 ? Math.floor(parsed.count) : 0;
    return { count, target, startedAt: parsed.startedAt || "" };
  } catch {
    return emptyActive;
  }
}

export function saveActive(a: ActiveJapa) {
  if (!isClient()) return;
  try {
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(a));
  } catch {
    /* storage full / blocked */
  }
}

export function clearActive() {
  if (!isClient()) return;
  try {
    localStorage.removeItem(ACTIVE_KEY);
  } catch {
    /* no-op */
  }
}

export function loadHistory(): JapaSession[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as JapaSession[]) : [];
  } catch {
    return [];
  }
}

// Append-only: never overwrites earlier sessions.
export function appendSession(s: Omit<JapaSession, "id" | "date" | "completedAt">): JapaSession {
  const completedAt = new Date().toISOString();
  const entry: JapaSession = {
    ...s,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: todayKey(),
    completedAt,
  };
  if (!isClient()) return entry;
  try {
    const all = loadHistory();
    all.push(entry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(all));
  } catch {
    /* no-op */
  }
  return entry;
}

export function japaTotalFor(history: JapaSession[], dateKeys: string[]): number {
  const set = new Set(dateKeys);
  return history.reduce((sum, s) => (set.has(s.date) ? sum + (s.count || 0) : sum), 0);
}

export function recentSessions(history: JapaSession[], n = 5): JapaSession[] {
  return [...history].sort((a, b) => b.completedAt.localeCompare(a.completedAt)).slice(0, n);
}
