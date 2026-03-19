import { createAdminClient } from "@/lib/supabase/admin";
import { EventCard } from "@/components/events/event-card";
import { Icon } from "@/components/ui/icon";
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
    .select("id, title, event_date, created_by, venue, profiles!events_created_by_fkey(display_name)")
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
    <>
      <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full pb-24">
        {(events ?? []).length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Icon name="local_fire_department" className="text-primary/30 text-4xl" />
            </div>
            <p className="font-bold mb-1">Todavia no hay asados</p>
            <p className="text-sm text-muted-foreground mb-4">
              Crea el primero y empeza a medir
            </p>
          </div>
        ) : (
          <div className="space-y-4">
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
                venue={event.venue}
              />
            ))}
          </div>
        )}
      </main>

      {/* Pill FAB */}
      <Link
        href={`/groups/${groupId}/events/new`}
        className="fixed bottom-24 right-6 z-20 bg-primary hover:bg-primary/90 text-white flex items-center gap-2 px-5 py-3 rounded-full shadow-lg shadow-primary/30 transition-colors active:scale-95"
      >
        <Icon name="add" />
        <span className="font-bold text-sm tracking-wide">Nuevo asado</span>
      </Link>
    </>
  );
}
