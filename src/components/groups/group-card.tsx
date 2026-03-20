import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export function GroupCard({
  id,
  name,
  description,
  color,
  memberCount,
  photoUrl,
}: {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  memberCount?: number;
  photoUrl?: string | null;
}) {
  return (
    <Link href={`/groups/${id}`}>
      <div className="bg-card dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-primary/5 flex items-center gap-4 hover:shadow-md transition-shadow">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name}
            className="w-14 h-14 rounded-full object-cover shrink-0"
          />
        ) : (
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 text-white text-xl font-bold"
            style={{ backgroundColor: color }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-foreground truncate">{name}</h3>
            {memberCount !== undefined && (
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                {memberCount} miembros
              </span>
            )}
          </div>
          {description && (
            <p className="text-muted-foreground text-sm mt-0.5 truncate">
              {description}
            </p>
          )}
        </div>
        <Icon name="chevron_right" className="text-muted-foreground/50 shrink-0" />
      </div>
    </Link>
  );
}
