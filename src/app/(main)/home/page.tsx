import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Header } from "@/components/layout/header";
import { EventCard } from "@/components/events/event-card";
import { GroupCard } from "@/components/groups/group-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CalendarDays, Flame } from "lucide-react";
import Link from "next/link";
import type { Profile } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single<Profile>();

  // Get user's groups with member counts
  const { data: memberships } = await admin
    .from("group_members")
    .select("group_id, groups(id, name, description, color, invite_code)")
    .eq("user_id", user!.id);

  type GroupRow = { id: string; name: string; description: string | null; color: string; invite_code: string };
  const groups = memberships?.map((m) => m.groups as unknown as GroupRow) ?? [];
  const groupIds = groups.map((g) => g.id);

  // Get upcoming events (next 30 days)
  const today = new Date().toISOString().split("T")[0];
  const future = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

  const { data: upcomingEvents } = groupIds.length > 0
    ? await admin
        .from("events")
        .select("id, group_id, title, event_date, created_by, venue, profiles!events_created_by_fkey(display_name)")
        .in("group_id", groupIds)
        .gte("event_date", today)
        .lte("event_date", future)
        .order("event_date")
        .limit(10)
    : { data: [] };

  // Get recent past events
  const { data: recentEvents } = groupIds.length > 0
    ? await admin
        .from("events")
        .select("id, group_id, title, event_date, created_by, venue, profiles!events_created_by_fkey(display_name)")
        .in("group_id", groupIds)
        .lt("event_date", today)
        .order("event_date", { ascending: false })
        .limit(5)
    : { data: [] };

  // Get attendance counts
  const allEventIds = [
    ...(upcomingEvents ?? []).map((e) => e.id),
    ...(recentEvents ?? []).map((e) => e.id),
  ];

  const { data: attendanceCounts } = allEventIds.length > 0
    ? await admin.from("attendance").select("event_id").in("event_id", allEventIds)
    : { data: [] };

  const countByEvent = (attendanceCounts ?? []).reduce(
    (acc: Record<string, number>, a: { event_id: string }) => {
      acc[a.event_id] = (acc[a.event_id] || 0) + 1;
      return acc;
    },
    {}
  );

  // Get member counts per group
  const { data: allMembers } = groupIds.length > 0
    ? await admin.from("group_members").select("group_id").in("group_id", groupIds)
    : { data: [] };

  const memberCountByGroup = (allMembers ?? []).reduce(
    (acc: Record<string, number>, m: { group_id: string }) => {
      acc[m.group_id] = (acc[m.group_id] || 0) + 1;
      return acc;
    },
    {}
  );

  const groupColorMap = Object.fromEntries(groups.map((g) => [g.id, g.color]));
  const groupNameMap = Object.fromEntries(groups.map((g) => [g.id, g.name]));

  const formatDate = (date: string) => {
    const d = new Date(date + "T12:00:00");
    return d.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" });
  };

  // Split upcoming: featured + rest
  const nextEvent = (upcomingEvents ?? [])[0] ?? null;
  const moreUpcoming = (upcomingEvents ?? []).slice(1, 4);

  // Split recent: featured + rest
  const lastEvent = (recentEvents ?? [])[0] ?? null;
  const moreRecent = (recentEvents ?? []).slice(1, 4);

  return (
    <>
      <Header
        title={`Hola, ${profile?.display_name?.split(" ")[0] ?? ""}!`}
      />

      <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full space-y-6">
        {/* Proximo asado */}
        {nextEvent && (
          <section>
            <h2 className="text-base font-bold mb-3">Proximo asado</h2>
            {/* Featured card */}
            <Link href={`/groups/${nextEvent.group_id}/events/${nextEvent.id}`}>
              <Card className="hover:shadow-md transition-shadow overflow-hidden border-primary/30 bg-primary/5">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: groupColorMap[nextEvent.group_id] }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {groupNameMap[nextEvent.group_id]}
                    </span>
                  </div>
                  <p className="font-bold text-lg">{nextEvent.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <CalendarDays className="h-3.5 w-3.5 inline mr-1 relative -top-px" />
                    {formatDate(nextEvent.event_date)}
                    {(nextEvent.profiles as unknown as { display_name: string })?.display_name
                      ? ` · ${(nextEvent.profiles as unknown as { display_name: string }).display_name}`
                      : ""}
                    {nextEvent.venue ? ` · ${nextEvent.venue}` : ""}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <Flame className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">
                      {countByEvent[nextEvent.id] ?? 0} confirmados
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* More upcoming */}
            {moreUpcoming.length > 0 && (
              <div className="space-y-2 mt-2">
                {moreUpcoming.map((event) => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    groupId={event.group_id}
                    title={event.title}
                    dateStr={formatDate(event.event_date)}
                    asadorName={(event.profiles as unknown as { display_name: string })?.display_name}
                    attendees={countByEvent[event.id] ?? 0}
                    groupColor={groupColorMap[event.group_id]}
                    venue={event.venue}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Ultimo asado */}
        {lastEvent && (
          <section>
            <h2 className="text-base font-bold mb-3">Ultimo asado</h2>
            {/* Featured card */}
            <Link href={`/groups/${lastEvent.group_id}/events/${lastEvent.id}`}>
              <Card className="hover:shadow-md transition-shadow overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: groupColorMap[lastEvent.group_id] }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {groupNameMap[lastEvent.group_id]}
                    </span>
                  </div>
                  <p className="font-bold text-lg">{lastEvent.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <CalendarDays className="h-3.5 w-3.5 inline mr-1 relative -top-px" />
                    {formatDate(lastEvent.event_date)}
                    {(lastEvent.profiles as unknown as { display_name: string })?.display_name
                      ? ` · ${(lastEvent.profiles as unknown as { display_name: string }).display_name}`
                      : ""}
                    {lastEvent.venue ? ` · ${lastEvent.venue}` : ""}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <Flame className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">
                      {countByEvent[lastEvent.id] ?? 0} fueron
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* More recent */}
            {moreRecent.length > 0 && (
              <div className="space-y-2 mt-2">
                {moreRecent.map((event) => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    groupId={event.group_id}
                    title={event.title}
                    dateStr={formatDate(event.event_date)}
                    asadorName={(event.profiles as unknown as { display_name: string })?.display_name}
                    attendees={countByEvent[event.id] ?? 0}
                    groupColor={groupColorMap[event.group_id]}
                    venue={event.venue}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Groups */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold">Mis Grupos</h2>
            <Link href="/groups/new">
              <Button size="sm" variant="ghost" className="rounded-full gap-1 text-primary">
                <Plus className="h-4 w-4" />
                Nuevo
              </Button>
            </Link>
          </div>

          {groups.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🥩</div>
              <p className="font-semibold mb-1">No tenes grupos</p>
              <p className="text-sm text-muted-foreground mb-4">Crea uno e invita amigos</p>
              <Link href="/groups/new">
                <Button className="rounded-full" size="sm">Crear grupo</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {groups.map((group) => (
                <GroupCard
                  key={group.id}
                  id={group.id}
                  name={group.name}
                  description={group.description}
                  color={group.color ?? "#e67e22"}
                  memberCount={memberCountByGroup[group.id] ?? 0}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
