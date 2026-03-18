import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Flame } from "lucide-react";

export function EventCard({
  id,
  groupId,
  title,
  dateStr,
  asadorName,
  attendees,
  groupColor,
}: {
  id: string;
  groupId: string;
  title: string;
  dateStr: string;
  asadorName?: string;
  attendees: number;
  groupColor?: string;
}) {
  return (
    <Link href={`/groups/${groupId}/events/${id}`}>
      <Card className="hover:shadow-md transition-shadow overflow-hidden">
        <CardContent className="flex items-center gap-3 p-4">
          {groupColor && (
            <div
              className="w-1 h-12 rounded-full shrink-0"
              style={{ backgroundColor: groupColor }}
            />
          )}
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Flame className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{title}</p>
            <p className="text-xs text-muted-foreground">
              {dateStr}{asadorName ? ` · ${asadorName}` : ""}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-primary">{attendees}</p>
            <p className="text-[10px] text-muted-foreground">fueron</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
