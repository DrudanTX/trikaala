import SunCalc from "suncalc";
import type { SessionKey } from "./storage";

export interface SessionMeta {
  key: SessionKey;
  name: string;
  sanskrit: string;
  subtitle: string;
  gradient: string; // utility class
  symbol: string;
}

export const SESSIONS: SessionMeta[] = [
  {
    key: "pratah",
    name: "Pratah",
    sanskrit: "प्रातः",
    subtitle: "Morning · at sunrise",
    gradient: "bg-dawn",
    symbol: "☀",
  },
  {
    key: "madhyahnikam",
    name: "Madhyahnikam",
    sanskrit: "माध्याह्निकम्",
    subtitle: "Noon · at midday",
    gradient: "bg-noon",
    symbol: "✺",
  },
  {
    key: "sayam",
    name: "Sayam",
    sanskrit: "सायम्",
    subtitle: "Evening · at sunset",
    gradient: "bg-dusk",
    symbol: "☾",
  },
];

export function getSessionMeta(k: SessionKey): SessionMeta {
  return SESSIONS.find((s) => s.key === k)!;
}

export function getSessionTimes(lat?: number, lon?: number, date = new Date()) {
  if (lat == null || lon == null) return null;
  const t = SunCalc.getTimes(date, lat, lon);
  return {
    pratah: t.sunrise,
    madhyahnikam: t.solarNoon,
    sayam: t.sunset,
  };
}

export function currentSession(): SessionKey {
  const h = new Date().getHours();
  if (h < 11) return "pratah";
  if (h < 16) return "madhyahnikam";
  return "sayam";
}

export function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
