import { useEffect } from "react";
import { App as CapApp } from "@capacitor/app";
import { isNative, syncNotifications } from "@/lib/notifications";
import { loadSettings } from "@/lib/storage";

/**
 * Keeps the native local-notification schedule in sync with the app's
 * astronomical Sandhya times: on launch, on resume, and when the day rolls over
 * (which also covers timezone, DST and device-clock changes).
 */
export function NotificationScheduler() {
  useEffect(() => {
    if (!isNative()) return;
    let cancelled = false;

    const run = async () => {
      const s = loadSettings();
      if (cancelled) return;
      if (s.lastScheduledOn === new Date().toDateString()) return;
      await syncNotifications(s);
    };

    // Always refresh once on launch, regardless of the day marker.
    void syncNotifications(loadSettings());

    const listener = CapApp.addListener("appStateChange", ({ isActive }) => {
      if (isActive) void run();
    });
    const interval = setInterval(run, 60 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
      void listener.then((l) => l.remove());
    };
  }, []);

  return null;
}
