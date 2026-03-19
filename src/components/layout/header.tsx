"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export function Header({
  title,
  backHref,
  rightContent,
  large,
}: {
  title: string;
  backHref?: string;
  rightContent?: React.ReactNode;
  large?: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 bg-card dark:bg-background border-b border-border/10">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          {backHref && (
            <Link href={backHref} className="text-foreground p-1">
              <Icon name="arrow_back" />
            </Link>
          )}
          {!large && (
            <h1 className="text-lg font-bold tracking-tight truncate">
              {title}
            </h1>
          )}
        </div>
        {rightContent && <div>{rightContent}</div>}
      </div>
      {large && (
        <div className="px-4 pb-4 max-w-lg mx-auto">
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        </div>
      )}
    </header>
  );
}
