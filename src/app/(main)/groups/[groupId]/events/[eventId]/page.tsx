import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { QRDisplay } from "@/components/events/qr-display";
import { ManualAttendance } from "@/components/events/manual-attendance";
import { CostDisplay } from "@/components/events/cost-display";
import { PhotoGallery } from "@/components/events/photo-gallery";
import { CommentSection } from "@/components/events/comment-section";
import { AsadorRating } from "@/components/events/asador-rating";
import { Icon } from "@/components/ui/icon";
import Link from "next/link";
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

  // Fetch asador profile if different from creator
  let asadorProfile: Profile | null = null;
  if (event.asador_id) {
    if (event.asador_id === creator.id) {
      asadorProfile = creator;
    } else {
      const { data: ap } = await admin
        .from("profiles")
        .select("id, display_name, avatar_url")
        .eq("id", event.asador_id)
        .single();
      asadorProfile = ap as Profile | null;
    }
  }

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

  // Fetch photos
  const { data: photos } = await admin
    .from("event_photos")
    .select("id, photo_url, user_id, created_at, profiles(display_name)")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  // Fetch comments
  const { data: comments } = await admin
    .from("event_comments")
    .select("id, content, user_id, created_at, profiles(display_name, avatar_url)")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  // Fetch ratings
  const { data: ratings } = await admin
    .from("event_ratings")
    .select("rating, user_id")
    .eq("event_id", eventId);

  const totalVotes = ratings?.length ?? 0;
  const averageRating = totalVotes > 0
    ? (ratings!.reduce((sum, r) => sum + r.rating, 0) / totalVotes)
    : null;

  const currentUserRating = ratings?.find((r) => r.user_id === user?.id)?.rating ?? null;
  const isAttendee = attendedUserIds.has(user?.id ?? "");
  const isPastEvent = new Date(event.event_date + "T23:59:59") < new Date();
  const canVote = isAttendee && isPastEvent;

  // Calculate effective guests for cost display
  const effectiveGuests = event.guest_count ?? attendedUserIds.size;

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
      <Header
        title={event.title}
        backHref={`/groups/${groupId}`}
        rightContent={
          isCreator ? (
            <Link
              href={`/groups/${groupId}/events/${eventId}/edit`}
              className="text-primary hover:text-primary/80 p-1"
            >
              <Icon name="edit" size="sm" />
            </Link>
          ) : undefined
        }
      />

      <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full space-y-5 pb-24">
        {/* Event info */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Icon name="calendar_today" className="text-muted-foreground" size="sm" />
              <span className="capitalize">{formatDate(event.event_date)}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Icon name="person" className="text-muted-foreground" size="sm" />
              <span>Anfitrion: <span className="font-medium">{creator.display_name}</span></span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Icon name="local_fire_department" className="text-orange-500" size="sm" />
              <span>Asador: <span className="font-medium">{asadorProfile?.display_name ?? creator.display_name}</span></span>
            </div>

            {event.venue && (
              <div className="flex items-center gap-2 text-sm">
                <Icon name="location_on" className="text-muted-foreground" size="sm" />
                <span>{event.venue}</span>
              </div>
            )}

            {event.guest_count && (
              <div className="flex items-center gap-2 text-sm">
                <Icon name="groups" className="text-muted-foreground" size="sm" />
                <span>{event.guest_count} comensales</span>
              </div>
            )}

            {event.description && (
              <div className="flex items-start gap-2 text-sm">
                <Icon name="description" className="text-muted-foreground mt-0.5" size="sm" />
                <span className="text-muted-foreground">{event.description}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cost breakdown */}
        {event.cost_ars != null && event.cost_ars > 0 && (
          <CostDisplay
            costArs={event.cost_ars}
            usdRate={event.usd_rate}
            effectiveGuests={effectiveGuests}
          />
        )}

        {/* Notes */}
        {event.notes && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="sticky_note_2" className="text-muted-foreground" size="sm" />
                <span className="text-sm font-bold">Notas</span>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {event.notes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Asador Rating */}
        {(isPastEvent || totalVotes > 0) && (
          <Card>
            <CardContent className="p-4">
              <AsadorRating
                eventId={eventId}
                groupId={groupId}
                currentRating={currentUserRating}
                averageRating={averageRating}
                totalVotes={totalVotes}
                canVote={canVote}
              />
            </CardContent>
          </Card>
        )}

        {/* QR Display - only for event creator */}
        {isCreator && (
          <QRDisplay eventId={eventId} secretWord={event.secret_word} />
        )}

        {/* Check-in instructions for non-organizers */}
        {!isCreator && !isPastEvent && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm text-muted-foreground italic">
                Para confirmar tu asistencia, pedile a <span className="font-medium not-italic text-foreground">{creator.display_name}</span> (organizador) que te muestre el QR para escanearlo, o pedile la palabra secreta.
              </p>
              <Link
                href={`/checkin/${eventId}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
              >
                <Icon name="qr_code_scanner" size="sm" />
                Ingresar palabra secreta o escanear QR
              </Link>
            </CardContent>
          </Card>
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
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
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

        <Separator />

        {/* Photos */}
        <PhotoGallery
          eventId={eventId}
          groupId={groupId}
          photos={(photos ?? []) as unknown as { id: string; photo_url: string; user_id: string; created_at: string; profiles: { display_name: string } }[]}
          userId={user?.id ?? ""}
        />

        <Separator />

        {/* Comments */}
        <CommentSection
          eventId={eventId}
          groupId={groupId}
          comments={(comments ?? []) as unknown as { id: string; content: string; user_id: string; created_at: string; profiles: { display_name: string; avatar_url: string | null } }[]}
          userId={user?.id ?? ""}
        />
      </main>
    </>
  );
}
