import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export function GroupCard({
  id,
  name,
  description,
  color,
  memberCount,
}: {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  memberCount?: number;
}) {
  return (
    <Link href={`/groups/${id}`}>
      <Card className="hover:shadow-md transition-shadow overflow-hidden">
        <CardContent className="flex items-center gap-3 p-4">
          <div
            className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-lg"
            style={{ backgroundColor: color }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{name}</p>
            {description && (
              <p className="text-sm text-muted-foreground truncate">{description}</p>
            )}
          </div>
          {memberCount !== undefined && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span className="text-xs">{memberCount}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
