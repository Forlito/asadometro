import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@/components/ui/icon";
import type { Profile, MemberStats } from "@/lib/types";

export default async function RankingPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const admin = createAdminClient();

  // Get all members
  const { data: members } = await admin
    .from("group_members")
    .select("user_id, profiles(id, display_name, avatar_url)")
    .eq("group_id", groupId);

  // Get all events for this group
  const { data: events } = await admin
    .from("events")
    .select("id, created_by, asador_id")
    .eq("group_id", groupId);

  const totalEvents = events?.length ?? 0;
  const eventIds = (events ?? []).map((e) => e.id);

  // Get all attendance records
  const { data: attendance } = eventIds.length > 0
    ? await admin.from("attendance").select("event_id, user_id").in("event_id", eventIds)
    : { data: [] };

  // Build stats per member
  const stats: MemberStats[] = (members ?? []).map((m) => {
    const profile = m.profiles as unknown as Profile;
    const attended = (attendance ?? []).filter((a) => a.user_id === profile.id).length;
    const hosted = (events ?? []).filter((e) => e.created_by === profile.id).length;
    const grilled = (events ?? []).filter((e) => e.asador_id === profile.id).length;
    const missed = totalEvents - attended;
    const rate = totalEvents > 0 ? Math.round((attended / totalEvents) * 100) : 0;

    return { profile, attended, missed, rate, hosted, grilled };
  });

  // Rankings
  const rankedAttendance = [...stats].sort((a, b) => b.rate - a.rate || b.attended - a.attended);
  const rankedHost = [...stats].sort((a, b) => b.hosted - a.hosted).filter((s) => s.hosted > 0);
  const rankedAsador = [...stats].sort((a, b) => b.grilled - a.grilled).filter((s) => s.grilled > 0);
  const rateados = [...stats].sort((a, b) => b.missed - a.missed).filter((s) => s.missed > 0).slice(0, 5);

  const hasAsadorData = rankedAsador.length > 0;

  return (
    <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full space-y-5 pb-24">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-extrabold text-primary">{totalEvents}</p>
            <p className="text-xs text-muted-foreground">Asados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-extrabold text-primary">{members?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Miembros</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-extrabold text-primary">
              {totalEvents > 0
                ? Math.round((attendance?.length ?? 0) / totalEvents)
                : 0}
            </p>
            <p className="text-xs text-muted-foreground">Promedio</p>
          </CardContent>
        </Card>
      </div>

      {/* Ranking Anfitrion */}
      {totalEvents > 0 && rankedHost.length > 0 && (
        <section>
          <h2 className="text-base font-bold mb-3 flex items-center gap-2">
            <Icon name="workspace_premium" className="text-yellow-500" size="sm" />
            Ranking Anfitrion
          </h2>
          <Card>
            <CardContent className="p-0 divide-y">
              {rankedHost.map((s, i) => (
                <div key={s.profile.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-sm font-bold text-muted-foreground w-6 text-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {s.profile.display_name}
                    </p>
                  </div>
                  <Badge variant="secondary">{s.hosted} {s.hosted === 1 ? "asado" : "asados"}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Ranking Asador */}
      {hasAsadorData && (
        <section>
          <h2 className="text-base font-bold mb-3 flex items-center gap-2">
            <Icon name="local_fire_department" className="text-orange-500" size="sm" />
            Ranking Asador
          </h2>
          <Card>
            <CardContent className="p-0 divide-y">
              {rankedAsador.map((s, i) => (
                <div key={s.profile.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-sm font-bold text-muted-foreground w-6 text-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {s.profile.display_name}
                    </p>
                  </div>
                  <Badge variant="secondary">{s.grilled} {s.grilled === 1 ? "vez" : "veces"}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Attendance ranking */}
      {totalEvents > 0 && (
        <section>
          <h2 className="text-base font-bold mb-3 flex items-center gap-2">
            <Icon name="emoji_events" className="text-primary" size="sm" />
            Ranking Asistencia
          </h2>
          <Card>
            <CardContent className="p-0 divide-y">
              {rankedAttendance.map((s, i) => (
                <div key={s.profile.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-sm font-bold text-muted-foreground w-6 text-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {s.profile.display_name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${s.rate}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground w-10 text-right">
                        {s.rate}%
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {s.attended}/{totalEvents}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Los que mas se ratearon */}
      {rateados.length > 0 && (
        <section>
          <Separator className="mb-5" />
          <h2 className="text-base font-bold mb-3 flex items-center gap-2">
            <Icon name="trending_down" className="text-destructive" size="sm" />
            Los que mas se ratearon
          </h2>
          <Card>
            <CardContent className="p-0 divide-y">
              {rateados.map((s) => (
                <div key={s.profile.id} className="flex items-center justify-between px-4 py-3">
                  <p className="text-sm font-medium">{s.profile.display_name}</p>
                  <Badge variant="destructive" className="text-xs">
                    Se rateo {s.missed} {s.missed === 1 ? "vez" : "veces"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      {totalEvents === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Icon name="local_fire_department" className="text-primary/30 text-4xl" />
          </div>
          <p className="font-bold">No hay datos todavia</p>
          <p className="text-sm text-muted-foreground">
            Crea el primer asado para ver el ranking
          </p>
        </div>
      )}
    </main>
  );
}
