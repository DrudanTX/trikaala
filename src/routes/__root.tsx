import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { MobileNav } from "@/components/MobileNav";
import { NotificationScheduler } from "@/components/NotificationScheduler";


import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#f4ead5" },
      { title: "Trikaala — Daily Sandhyavandhanam" },
      { name: "description", content: "A calm, minimal companion for your daily Sandhyavandhanam practice — Pratah, Madhyahnikam, Sayam — with Gayatri mantra counts, gentle streaks, and sun-aware reminders." },
      { property: "og:title", content: "Trikaala — Daily Sandhyavandhanam" },
      { property: "og:description", content: "A calm, minimal companion for your daily Sandhyavandhanam practice — Pratah, Madhyahnikam, Sayam — with Gayatri mantra counts, gentle streaks, and sun-aware reminders." },
      { property: "og:type", content: "website" },
      { name: "google-site-verification", content: "P38KtFvb0uvGr_baM5FVAzX6DTZ-YK_MMOdNGiKIElQ" },
      { name: "twitter:card", content: "summary" },
      {
        name: "google-fonts",
        content: "preload",
      },
      { name: "twitter:title", content: "Trikaala — Daily Sandhyavandhanam" },
      { name: "twitter:description", content: "A calm, minimal companion for your daily Sandhyavandhanam practice — Pratah, Madhyahnikam, Sayam — with Gayatri mantra counts, gentle streaks, and sun-aware reminders." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0fd805fc-2483-464a-a35f-90f5695e6c31/id-preview-6b75f6b8--a787f0ce-214a-49e0-8400-c8f30b865385.lovable.app-1778044687492.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0fd805fc-2483-464a-a35f-90f5695e6c31/id-preview-6b75f6b8--a787f0ce-214a-49e0-8400-c8f30b865385.lovable.app-1778044687492.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <div className="relative mx-auto min-h-screen w-full max-w-md overflow-x-hidden bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-72 bg-gradient-to-b from-saffron-soft/40 to-transparent" />
      <div className="relative z-10 pb-28">
        <Outlet />
      </div>
      <MobileNav />
    </div>
  );
}
