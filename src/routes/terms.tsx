import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Trikaala" },
      { name: "description", content: "Trikaala terms of service: the rules and responsibilities for using the Sandhyāvandanam tracking app." },
      { property: "og:title", content: "Terms of Service — Trikaala" },
      { property: "og:description", content: "Trikaala terms of service: the rules and responsibilities for using the Sandhyāvandanam tracking app." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

const sections = [
  {
    title: "About Trikaala",
    body: "Trikaala is a mobile application designed to help users track and maintain their Sandhyāvandanam practice and related personal spiritual practices. It provides informational content, practice-tracking tools, reminders, guides, timers, counters, and other features. Trikaala is intended as a supportive tracking and educational tool. It is not intended to replace instruction from a qualified teacher, guru, acharya, or other knowledgeable authority.",
  },
  {
    title: "No Religious or Professional Authority",
    body: "Trikaala does not claim to be an authoritative source of religious instruction. Religious practices, traditions, procedures, mantras, pronunciations, and customs may vary between families, sampradayas, traditions, teachers, and regions. Users should use their own judgment and consult an appropriate qualified teacher or authority when they need guidance about their personal practice.",
  },
  {
    title: "Your Account",
    body: "If Trikaala requires an account, you are responsible for maintaining the security of your account information and for activity conducted through your account. You agree to provide accurate information and not to use another person's account without permission.",
  },
  {
    title: "Practice Tracking",
    body: "Trikaala's tracking features are provided for personal organization and convenience. Completion records, streaks, reminders, counters, and other statistics should not be treated as authoritative records of religious observance. Trikaala does not guarantee that its reminders, calculations, notifications, or tracking will always be accurate or delivered without interruption.",
  },
  {
    title: "Informational Content",
    body: "We make reasonable efforts to provide useful and accurate information, but we do not guarantee that all content is complete, current, or applicable to every tradition or individual. If you identify an error or believe content should be corrected, please contact us.",
  },
  {
    title: "Acceptable Use",
    body: "You agree not to: use Trikaala for unlawful purposes; attempt to interfere with or disrupt the service; attempt to gain unauthorized access to the application or its systems; reverse engineer or exploit the service except where permitted by applicable law; abuse, harass, or harm other users; or use the application in a way that could damage the service or other users.",
  },
  {
    title: "Intellectual Property",
    body: "Trikaala and its original software, design, branding, graphics, text, and other content are owned by Trikaala or its respective licensors, except for third-party materials. You may use the application for its intended personal purposes, but you may not copy, reproduce, modify, distribute, or commercially exploit Trikaala's proprietary content without permission, except where permitted by law.",
  },
  {
    title: "Third-Party Services",
    body: "Trikaala may rely on third-party services for certain functionality, such as hosting, authentication, analytics, notifications, payments, or other infrastructure. Those services may have their own terms and privacy policies. Trikaala is not responsible for the independent policies or availability of third-party services.",
  },
  {
    title: "Availability",
    body: "We may modify, suspend, or discontinue parts of Trikaala at any time. We do not guarantee that the application will always be available, uninterrupted, secure, or error-free.",
  },
  {
    title: "Disclaimer",
    body: "To the maximum extent permitted by applicable law, Trikaala is provided on an \"as is\" and \"as available\" basis without warranties of any kind, whether express or implied. We do not guarantee that the application or its content will always be accurate, complete, reliable, available, or suitable for a particular purpose.",
  },
  {
    title: "Limitation of Liability",
    body: "To the maximum extent permitted by applicable law, Trikaala and its developers, contributors, and service providers will not be liable for indirect, incidental, special, consequential, or punitive damages arising from or related to your use of the application. Nothing in these Terms is intended to exclude or limit liability that cannot legally be excluded or limited under applicable law.",
  },
  {
    title: "Changes to These Terms",
    body: "We may update these Terms from time to time. When we make material changes, we may provide notice through the application or another reasonable method. Your continued use of Trikaala after updated Terms become effective means you accept the updated Terms.",
  },
  {
    title: "Termination",
    body: "We may suspend or terminate access to Trikaala if we reasonably believe that a user has violated these Terms or used the service in a way that could harm the application, its users, or others. You may stop using Trikaala at any time.",
  },
  {
    title: "Governing Law",
    body: "These Terms will be governed by the laws applicable to Trikaala and its operator, except where applicable law provides otherwise. Any dispute will be handled in accordance with applicable law.",
  },
];

function TermsPage() {
  return (
    <div className="px-5 pt-12">
      <p className="text-xs uppercase tracking-[0.2em] text-ink-soft/70">Legal</p>
      <h1 className="mt-1 font-display text-3xl text-ink">Terms of Service</h1>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-soft">
        <p className="text-sm font-medium text-ink-soft">Last Updated</p>
        <p className="mt-1 font-display text-xl text-ink">August 2026</p>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          Welcome to Trikaala. By using Trikaala, you agree to these Terms of Service.
        </p>
      </section>

      <div className="mt-4 space-y-4">
        {sections.map((section, i) => (
          <section
            key={section.title}
            className="rounded-3xl border border-border bg-card p-6 shadow-soft"
          >
            <h2 className="font-display text-lg text-ink">
              {i + 1}. {section.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{section.body}</p>
          </section>
        ))}
      </div>

      <section className="mt-4 rounded-3xl border border-border bg-card p-6 shadow-soft">
        <h2 className="font-display text-lg text-ink">Contact</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          If you have questions, concerns, or requests regarding these Terms, please contact us through the contact information provided in the Trikaala application or its official website.
        </p>
        <a
          href="mailto:druvsatya@gmail.com"
          className="mt-2 inline-block text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          druvsatya@gmail.com
        </a>
      </section>

      <section className="mt-4 rounded-3xl border border-border bg-card p-6 shadow-soft">
        <p className="text-sm leading-relaxed text-ink-soft">
          By using Trikaala, you acknowledge that you have read and agree to these Terms of Service.
        </p>
      </section>

      <div className="mt-8 space-y-3 pb-8">
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