// Thin, capability-checked wrapper around the Vibration API.
function canVibrate(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

export function hapticLight() {
  if (!canVibrate()) return;
  try {
    navigator.vibrate(10);
  } catch {
    /* no-op */
  }
}

export function hapticStrong() {
  if (!canVibrate()) return;
  try {
    navigator.vibrate([28, 40, 60]);
  } catch {
    /* no-op */
  }
}
