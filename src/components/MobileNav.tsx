import { Link, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";

const items = [
  { to: "/", label: "Today", icon: "◈" },
  { to: "/japa", label: "Japa", icon: "◍" },
  { to: "/dashboard", label: "Journey", icon: "◉" },
  { to: "/guide", label: "Guide", icon: "❋" },
  { to: "/settings", label: "You", icon: "✦" },
] as const;

export function MobileNav() {
  const loc = useLocation();
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 px-4 pb-4 pt-2">
      <div className="relative flex items-center justify-around rounded-full border border-border bg-card/85 px-2 py-2 shadow-soft backdrop-blur-xl">
        {items.map((it) => {
          const active = loc.pathname === it.to;
          return (
            <Link
              key={it.to}
              to={it.to}
              className="relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-full px-2 py-1.5 text-[11px] font-medium text-ink-soft transition-colors"
            >
              {active && (
                <motion.span
                  layoutId="navpill"
                  className="absolute inset-0 rounded-full bg-saffron-soft/70"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className={`relative text-base ${active ? "text-primary" : ""}`}>
                {it.icon}
              </span>
              <span className={`relative ${active ? "text-ink" : ""}`}>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
