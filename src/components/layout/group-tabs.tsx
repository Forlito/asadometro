"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function GroupTabs({ groupId }: { groupId: string }) {
  const pathname = usePathname();
  const base = `/groups/${groupId}`;

  const tabs = [
    { label: "Asados", href: base },
    { label: "Ranking", href: `${base}/ranking` },
    { label: "Miembros", href: `${base}/members` },
  ];

  return (
    <div className="flex border-b px-4 gap-1">
      {tabs.map((tab) => {
        const isActive =
          tab.href === base
            ? pathname === base || pathname.startsWith(`${base}/events`)
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
