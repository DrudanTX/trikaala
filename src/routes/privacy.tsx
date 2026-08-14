import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Trikaala" },
      { name: "description", content: "Trikaala privacy policy: how prayer tracking data, preferences, and reminders are handled." },
      { property: "og:title", content: "Privacy Policy — Trikaala" },
      { property: "og:description", content: "Trikaala privacy policy: how prayer tracking data, preferences, and reminders are handled." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

const sections = [
  {
    title: "Information We Collect",
    body: "Trikaala stores prayer tracking data, streaks, preferences, reminder settings, and app usage information required for core functionality.",
  },
  {
    title: "How Information Is Used",
    body: "Your information is used solely to provide prayer tracking, streak calculations, reminders, progress history, and app functionality.",
  },
  {
    title: "Data Sharing",
    body: "Trikaala does not sell personal information. Data is not shared with third parties except when required for essential app services or legal compliance.",
  },
  {
    title: "Notifications",
    body: "Trikaala may send prayer reminders and notification alerts based on settings chosen by the user.",
  },
  {
    title: "Data Security",
    body: "Reasonable measures are used to protect user information and app data.",
  },
  {
    title: "Your Choices",
    body: "Users can modify reminder settings, clear local app data, or uninstall the app at any time.",
  },
  {
    title: "Children's Privacy",
    body: "Trikaala does not knowingly collect personal information from children.",
  },
  {
    title: "Changes To This Policy",
    body: "This policy may be updated periodically. Changes will be reflected on this page.",
  },
];

function PrivacyPage() {
  return (
    <div className="px-5 pt-12">
      <p className="text-xs uppercase tracking-[0.2em] text-ink-soft/70">Legal</p>
      <h1 className="mt-1 font-display text-3xl text-ink">Privacy Policy</h1>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-soft">
        <p className="text-sm font-medium text-ink-soft">Last Updated</p>
        <p className="mt-1 font-display text-xl text-ink">August 2026</p>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          Trikaala is committed to protecting your privacy.
        </p>
      </section>

      <div className="mt-4 space-y-4">
        {sections.map((section) => (
          <section
            key={section.title}
            className="rounded-3xl border border-border bg-card p-6 shadow-soft"
          >
            <h2 className="font-display text-lg text-ink">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{section.body}</p>
          </section>
        ))}
      </div>

      <section className="mt-4 rounded-3xl border border-border bg-card p-6 shadow-soft">
        <h2 className="font-display text-lg text-ink">Contact</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          For privacy questions, contact:
        </p>
        <a
          href="mailto:druvsatya@gmail.com"
          className="mt-2 inline-block text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          druvsatya@gmail.com
        </a>
      </section>

      <div className="mt-8 space-y-3 pb-8">
        <a
          href="mailto:druvsatya@gmail.com?subject=Trikaala%20Support"
          className="flex w-full items-center justify-center rounded-2xl bg-primary py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Contact Support
        </a>
        <Link
          to="/settings"
          className="flex w-full items-center justify-center rounded-2xl border border-border bg-card py-3.5 text-sm font-medium text-ink transition-colors hover:bg-secondary"
        >
          Back to Settings
        </Link>
      </div>
    </div>
  );
}
