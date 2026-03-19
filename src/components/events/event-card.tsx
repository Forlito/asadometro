import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export function EventCard({
  id,
  groupId,
  title,
  dateStr,
  asadorName,
  attendees,
  groupColor,
  venue,
}: {
  id: string;
  groupId: string;
  title: string;
  dateStr: string;
  asadorName?: string;
  attendees: number;
  groupColor?: string;
  venue?: string | null;
}) {
  return (
    <Link href={`/groups/${groupId}/events/${id}`}>
      <div className="bg-card dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-border flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Icon name="local_fire_department" className="text-primary text-3xl" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground truncate">{title}</h3>
          {venue && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {venue}
            </p>
          )}
          <p className="text-xs font-medium text-primary mt-1 truncate">
            {dateStr}
            {asadorName ? ` \u2022 Asador: ${asadorName}` : ""}
          </p>
        </div>
        <div className="flex flex-col items-center justify-center border-l border-border pl-4 shrink-0">
          <span className="text-lg font-bold text-foreground leading-none">
            {attendees}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-tighter text-muted-foreground">
            fueron
          </span>
        </div>
      </div>
    </Link>
  );
}
