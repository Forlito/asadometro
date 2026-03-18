"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function Header({
  title,
  backHref,
  rightContent,
}: {
  title: string;
  backHref?: string;
  rightContent?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          {backHref && (
            <Link href={backHref} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          )}
          <h1 className="text-lg font-bold truncate">{title}</h1>
        </div>
        {rightContent && <div>{rightContent}</div>}
      </div>
    </header>
  );
}
