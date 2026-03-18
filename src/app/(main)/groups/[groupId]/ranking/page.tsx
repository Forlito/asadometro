import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Crown, Flame, TrendingDown } from "lucide-react";
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
    .select("id, created_by")
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
    const missed = totalEvents - attended;
    const rate = totalEvents > 0 ? Math.round((attended / totalEvents) * 100) : 0;

    return { profile, attended, missed, rate, hosted };
  });

  // Sort by attendance rate descending
  const ranked = [...stats].sort((a, b) => b.rate - a.rate || b.attended - a.attended);
  const topAsador = [...stats].sort((a, b) => b.hosted - a.hosted)[0];
  const rateados = [...stats].sort((a, b) => b.missed - a.missed).filter((s) => s.missed > 0).slice(0, 5);

  return (
    <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full space-y-5">
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

      {/* Top asador */}
      {topAsador && topAsador.hosted > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Top asador</p>
              <p className="font-bold">{topAsador.profile.display_name}</p>
            </div>
            <Badge variant="secondary">{topAsador.hosted} asados</Badge>
          </CardContent>
        </Card>
      )}

      {/* Attendance ranking */}
      {totalEvents > 0 && (
        <section>
          <h2 className="text-base font-bold mb-3 flex items-center gap-2">
            <Flame className="h-4 w-4 text-primary" />
            Ranking de asistencia
          </h2>
          <Card>
            <CardContent className="p-0 divide-y">
              {ranked.map((s, i) => (
                <div key={s.profile.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-sm font-bold text-muted-foreground w-6 text-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {s.profile.display_name}
                      {i === 0 && " 👑"}
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
            <TrendingDown className="h-4 w-4 text-destructive" />
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
          <Flame className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-semibold">No hay datos todavia</p>
          <p className="text-sm text-muted-foreground">
            Crea el primer asado para ver el ranking
          </p>
        </div>
      )}
    </main>
  );
}
