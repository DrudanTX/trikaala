import { Outlet, createFileRoute } from "@tanstack/react-router";
import { MobileNav } from "@/components/MobileNav";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
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
