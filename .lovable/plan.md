# Japa Counter for Trikaala

A dedicated, distraction-free japa (mantra repetition) counter that reuses Trikaala's existing parchment/saffron design system, local-first storage, and bottom navigation.

## What gets built

**New "Japa" screen** at `/japa`, reachable from the bottom nav (a fifth item alongside Today, Journey, Guide, You) and from a small entry card on the Today screen.

**The counter**
- Large circular tap area filling most of the screen — comfortable for one-handed thumb use, sized well above accidental-tap risk.
- Shows `count` in large display type with `/ target` beneath, plus a soft progress ring that fills as you approach the target.
- Tap anywhere in the circle to +1. A short debounce window prevents a stray double-tap from registering twice.
- Secondary `—` and `+` buttons below for precise adjustment.
- `Undo` reverts the last increment; `Reset` asks for confirmation first.
- Progress percentage shown as quiet text (e.g. "Progress: 38.9%").

**Targets**
- Presets: 27, 54, 108 (default), 1008, and Custom.
- Changing the target mid-session keeps the current count.

**Completion**
- On reaching the target: a gentle breathing-glow bloom (reusing the existing `animate-breathe` motion language), the counter switches to a calm "Completed" state, and a `Complete Session` button becomes prominent. No confetti, no scores.

**Haptics**
- Light vibration on each increment, a slightly longer one at target, where the device supports it. Silently skipped otherwise.

**Saving**
- The in-progress session (count, target, start time) is saved continuously to local storage, so closing the app or navigating away never loses progress.
- Completing a session appends a record to practice history — date, target, completed count, timestamp. History is append-only; nothing is overwritten.

**Journey screen**
- New stats card for japa: today's japa total and this week's total, alongside the existing streak and Gayatri figures.
- A short list of recent completed japa sessions.

## Design

Matches the existing look exactly: parchment background, saffron accents, `rounded-3xl` cards with `shadow-soft`, Fraunces display numerals, Inter body text, framer-motion transitions consistent with the rest of the app. Works in dark mode via existing tokens. No new colors or fonts introduced.

## Technical notes

- `src/lib/japa.ts` — new module holding the active-session and history types plus load/save/append helpers, following the same `localStorage`-keyed pattern as `src/lib/storage.ts`, with SSR guards and its own storage keys so existing Sandhya logs are untouched.
- `src/lib/haptics.ts` — thin `navigator.vibrate` wrapper with a capability check.
- `src/routes/japa.tsx` — the counter route with its own `head()` metadata (title, description, og/twitter tags).
- `src/components/MobileNav.tsx` — add the Japa item; spacing adjusted for five items.
- `src/routes/dashboard.tsx` — add japa stats and recent-session list.
- `src/routes/index.tsx` — add a compact "Japa Counter" entry card.
- `src/routes/sitemap.xml.ts` — add `/japa`.
- State reads from `localStorage` happen in `useEffect` (not in `useState` initializers) to avoid hydration mismatches, matching how the existing screens do it.

Existing Sandhyavandanam tracking, streaks, and Gayatri counts are left functionally unchanged.
