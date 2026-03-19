"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

const tabs = [
  { label: "Home", icon: "home", href: "/home" },
  { label: "Calendario", icon: "calendar_today", href: "/calendar" },
  { label: "Grupos", icon: "groups", href: "/groups" },
  { label: "Perfil", icon: "person", href: "/profile" },
];

export function AppShell() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-card dark:bg-background border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/home"
              ? pathname === "/home"
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Icon
                name={tab.icon}
                filled={isActive}
                size="md"
              />
              <span
                className={cn(
                  "text-[10px] uppercase tracking-wider",
                  isActive ? "font-bold" : "font-medium"
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
