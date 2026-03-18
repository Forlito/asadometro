import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { QRDisplay } from "@/components/events/qr-display";
import { ManualAttendance } from "@/components/events/manual-attendance";
import { CalendarDays, User, FileText } from "lucide-react";
import type { Profile } from "@/lib/types";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ groupId: string; eventId: string }>;
}) {
  const { groupId, eventId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = createAdminClient();

  // Fetch event details
  const { data: event } = await admin
    .from("events")
    .select("*, profiles!events_created_by_fkey(id, display_name, avatar_url)")
    .eq("id", eventId)
    .single();

  if (!event) {
    return (
      <>
        <Header title="Evento" backHref={`/groups/${groupId}`} />
        <main className="flex-1 px-4 py-16 text-center">
          <p className="text-muted-foreground">Evento no encontrado</p>
        </main>
      </>
    );
  }

  const creator = event.profiles as unknown as Profile;
  const isCreator = user?.id === event.created_by;

  // Get group members
  const { data: members } = await admin
    .from("group_members")
    .select("user_id, profiles(id, display_name, avatar_url)")
    .eq("group_id", groupId);

  // Get attendance
  const { data: attendance } = await admin
    .from("attendance")
    .select("user_id")
    .eq("event_id", eventId);

  const attendedUserIds = new Set((attendance ?? []).map((a) => a.user_id));

  const formatDate = (date: string) => {
    const d = new Date(date + "T12:00:00");
    return d.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
      <Header title={event.title} backHref={`/groups/${groupId}`} />

      <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full space-y-5">
        {/* Event info */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="capitalize">{formatDate(event.event_date)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Asador: <span className="font-medium">{creator.display_name}</span></span>
            </div>
            {event.description && (
              <div className="flex items-start gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">{event.description}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Display - only for event creator */}
        {isCreator && (
          <QRDisplay eventId={eventId} secretWord={event.secret_word} />
        )}

        <Separator />

        {/* Attendance list */}
        <section>
          <h2 className="text-base font-bold mb-3">
            Asistencia ({attendedUserIds.size}/{members?.length ?? 0})
          </h2>
          <Card>
            <CardContent className="p-0 divide-y">
              {(members ?? []).map((m) => {
                const profile = m.profiles as unknown as Profile;
                const attended = attendedUserIds.has(profile.id);

                return (
                  <div key={profile.id} className="flex items-center gap-3 px-4 py-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {profile.display_name?.charAt(0)?.toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {profile.display_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {attended ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Presente
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-muted-foreground">
                          Ausente
                        </Badge>
                      )}
                      {isCreator && (
                        <ManualAttendance
                          eventId={eventId}
                          userId={profile.id}
                          attended={attended}
                          groupId={groupId}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}
