import { createAdminClient } from "@/lib/supabase/admin";
import { EventCard } from "@/components/events/event-card";
import { Button } from "@/components/ui/button";
import { Plus, Flame } from "lucide-react";
import Link from "next/link";

export default async function GroupEventsPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const admin = createAdminClient();

  const { data: group } = await admin
    .from("groups")
    .select("color")
    .eq("id", groupId)
    .single();

  const { data: events } = await admin
    .from("events")
    .select("id, title, event_date, created_by, profiles!events_created_by_fkey(display_name)")
    .eq("group_id", groupId)
    .order("event_date", { ascending: false });

  const eventIds = (events ?? []).map((e) => e.id);

  const { data: attendanceCounts } = eventIds.length > 0
    ? await admin.from("attendance").select("event_id").in("event_id", eventIds)
    : { data: [] };

  const countByEvent = (attendanceCounts ?? []).reduce(
    (acc: Record<string, number>, a: { event_id: string }) => {
      acc[a.event_id] = (acc[a.event_id] || 0) + 1;
      return acc;
    },
    {}
  );

  const formatDate = (date: string) => {
    const d = new Date(date + "T12:00:00");
    return d.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" });
  };

  return (
    <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold">Asados</h2>
        <Link href={`/groups/${groupId}/events/new`}>
          <Button size="sm" variant="ghost" className="rounded-full gap-1 text-primary">
            <Plus className="h-4 w-4" />
            Nuevo asado
          </Button>
        </Link>
      </div>

      {(events ?? []).length === 0 ? (
        <div className="text-center py-16">
          <Flame className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-semibold mb-1">Todavia no hay asados</p>
          <p className="text-sm text-muted-foreground mb-4">
            Crea el primero y empeza a medir
          </p>
          <Link href={`/groups/${groupId}/events/new`}>
            <Button className="rounded-full" size="sm">Crear asado</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {(events ?? []).map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              groupId={groupId}
              title={event.title}
              dateStr={formatDate(event.event_date)}
              asadorName={(event.profiles as unknown as { display_name: string })?.display_name}
              attendees={countByEvent[event.id] ?? 0}
              groupColor={group?.color}
            />
          ))}
        </div>
      )}
    </main>
  );
}
