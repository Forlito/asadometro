import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Header } from "@/components/layout/header";
import { GlobalCalendar } from "@/components/calendar/global-calendar";

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = createAdminClient();

  // Get user's groups
  const { data: memberships } = await admin
    .from("group_members")
    .select("group_id, groups(id, name, color)")
    .eq("user_id", user!.id);

  type GroupInfo = { id: string; name: string; color: string };
  const groups = memberships?.map((m) => m.groups as unknown as GroupInfo) ?? [];
  const groupIds = groups.map((g) => g.id);

  // Get all events from user's groups
  const { data: events } = groupIds.length > 0
    ? await admin
        .from("events")
        .select("id, group_id, title, event_date, created_by, profiles!events_created_by_fkey(display_name)")
        .in("group_id", groupIds)
        .order("event_date")
    : { data: [] };

  const groupMap = Object.fromEntries(groups.map((g) => [g.id, g]));

  const calendarEvents = (events ?? []).map((e) => ({
    id: e.id,
    groupId: e.group_id,
    title: e.title,
    date: e.event_date,
    groupName: groupMap[e.group_id]?.name ?? "",
    groupColor: groupMap[e.group_id]?.color ?? "#e67e22",
    asadorName: (e.profiles as unknown as { display_name: string })?.display_name ?? "",
  }));

  const legend = groups.map((g) => ({ name: g.name, color: g.color }));

  return (
    <>
      <Header title="Calendario" />
      <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">
        <GlobalCalendar events={calendarEvents} legend={legend} />
      </main>
    </>
  );
}
