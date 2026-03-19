import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Header } from "@/components/layout/header";
import { EventCard } from "@/components/events/event-card";
import { GroupCard } from "@/components/groups/group-card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
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
        large
      />

      <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full space-y-6 pb-24">
        {/* Proximo asado */}
        {nextEvent && (
          <section>
            <h2 className="text-base font-bold mb-3">Proximo asado</h2>
            {/* Featured card */}
            <Link href={`/groups/${nextEvent.group_id}/events/${nextEvent.id}`}>
              <div className="bg-card dark:bg-zinc-900 rounded-xl p-5 shadow-sm border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: groupColorMap[nextEvent.group_id] }}
                  />
                  <span className="text-xs text-muted-foreground font-medium">
                    {groupNameMap[nextEvent.group_id]}
                  </span>
                </div>
                <p className="font-bold text-lg">{nextEvent.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  <Icon name="calendar_today" className="text-[14px] inline mr-1 relative -top-px" />
                  {formatDate(nextEvent.event_date)}
                  {(nextEvent.profiles as unknown as { display_name: string })?.display_name
                    ? ` \u00b7 ${(nextEvent.profiles as unknown as { display_name: string }).display_name}`
                    : ""}
                  {nextEvent.venue ? ` \u00b7 ${nextEvent.venue}` : ""}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <Icon name="local_fire_department" className="text-primary text-[18px]" />
                  <span className="text-sm font-bold text-primary">
                    {countByEvent[nextEvent.id] ?? 0} confirmados
                  </span>
                </div>
              </div>
            </Link>

            {/* More upcoming */}
            {moreUpcoming.length > 0 && (
              <div className="space-y-3 mt-3">
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
            <Link href={`/groups/${lastEvent.group_id}/events/${lastEvent.id}`}>
              <div className="bg-card dark:bg-zinc-900 rounded-xl p-5 shadow-sm border border-border hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: groupColorMap[lastEvent.group_id] }}
                  />
                  <span className="text-xs text-muted-foreground font-medium">
                    {groupNameMap[lastEvent.group_id]}
                  </span>
                </div>
                <p className="font-bold text-lg">{lastEvent.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  <Icon name="calendar_today" className="text-[14px] inline mr-1 relative -top-px" />
                  {formatDate(lastEvent.event_date)}
                  {(lastEvent.profiles as unknown as { display_name: string })?.display_name
                    ? ` \u00b7 ${(lastEvent.profiles as unknown as { display_name: string }).display_name}`
                    : ""}
                  {lastEvent.venue ? ` \u00b7 ${lastEvent.venue}` : ""}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <Icon name="local_fire_department" className="text-primary text-[18px]" />
                  <span className="text-sm font-bold text-primary">
                    {countByEvent[lastEvent.id] ?? 0} fueron
                  </span>
                </div>
              </div>
            </Link>

            {moreRecent.length > 0 && (
              <div className="space-y-3 mt-3">
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
                <Icon name="add" size="sm" />
                Nuevo
              </Button>
            </Link>
          </div>

          {groups.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Icon name="groups" className="text-primary/30 text-3xl" />
              </div>
              <p className="font-bold mb-1">No tenes grupos</p>
              <p className="text-sm text-muted-foreground mb-4">Crea uno e invita amigos</p>
              <Link href="/groups/new">
                <Button className="rounded-full" size="sm">Crear grupo</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => (
                <GroupCard
                  key={group.id}
                  id={group.id}
                  name={group.name}
                  description={group.description}
                  color={group.color ?? "#d46211"}
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
