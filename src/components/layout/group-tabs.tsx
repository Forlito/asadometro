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
    <div className="bg-card dark:bg-background sticky top-[53px] z-10">
      <div className="flex border-b border-border px-4">
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
                "flex-1 flex flex-col items-center justify-center py-3 border-b-[3px] transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              )}
            >
              <span className="text-sm font-bold tracking-wide">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
