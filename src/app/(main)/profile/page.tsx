import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Flame, Users, ChefHat } from "lucide-react";
import type { Profile } from "@/lib/types";
import { LogoutButton } from "./logout-button";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single<Profile>();

  // Get user's groups
  const { data: memberships } = await admin
    .from("group_members")
    .select("group_id")
    .eq("user_id", user!.id);

  const groupCount = memberships?.length ?? 0;
  const groupIds = (memberships ?? []).map((m) => m.group_id);

  // Get events in user's groups
  const { data: events } = groupIds.length > 0
    ? await admin.from("events").select("id, created_by").in("group_id", groupIds)
    : { data: [] };

  const eventIds = (events ?? []).map((e) => e.id);

  // Count events user attended
  const { data: attendanceRecords } = eventIds.length > 0
    ? await admin
        .from("attendance")
        .select("event_id")
        .eq("user_id", user!.id)
        .in("event_id", eventIds)
    : { data: [] };

  const attended = attendanceRecords?.length ?? 0;
  const hosted = (events ?? []).filter((e) => e.created_by === user!.id).length;

  return (
    <>
      <Header title="Mi perfil" />

      <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full space-y-5">
        {/* Profile info */}
        <div className="flex flex-col items-center text-center py-4">
          <Avatar className="h-20 w-20 mb-3">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="text-2xl">
              {profile?.display_name?.charAt(0)?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold">{profile?.display_name}</h2>
          <p className="text-sm text-muted-foreground">{user!.email}</p>
        </div>

        <Separator />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <Flame className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-extrabold">{attended}</p>
              <p className="text-xs text-muted-foreground">Asistidos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <ChefHat className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-extrabold">{hosted}</p>
              <p className="text-xs text-muted-foreground">Organizados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-extrabold">{groupCount}</p>
              <p className="text-xs text-muted-foreground">Grupos</p>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <LogoutButton />
      </main>
    </>
  );
}
