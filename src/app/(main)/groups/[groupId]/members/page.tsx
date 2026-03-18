"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Copy, Share2, Users, Flame } from "lucide-react";
import { toast } from "sonner";

type Member = {
  user_id: string;
  role: "admin" | "member";
  profile: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
};

export default function MembersPage() {
  const params = useParams();
  const groupId = params.groupId as string;

  const [members, setMembers] = useState<Member[]>([]);
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      const { data: group } = await supabase
        .from("groups")
        .select("invite_code")
        .eq("id", groupId)
        .single();

      if (group) setInviteCode(group.invite_code);

      const { data } = await supabase
        .from("group_members")
        .select("user_id, role, profiles(id, display_name, avatar_url)")
        .eq("group_id", groupId)
        .order("joined_at");

      if (data) {
        setMembers(
          data.map((m) => ({
            user_id: m.user_id,
            role: m.role as "admin" | "member",
            profile: m.profiles as unknown as Member["profile"],
          }))
        );
      }

      setLoading(false);
    };
    load();
  }, [groupId]);

  const inviteUrl = typeof window !== "undefined"
    ? `${window.location.origin}/join/${inviteCode}`
    : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    toast.success("Link copiado!");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Unite al grupo en Asadometro",
          text: "Te invito a unirte a mi grupo de asados",
          url: inviteUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Flame className="h-8 w-8 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full space-y-5">
      {/* Invite section */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-medium">Invitar al grupo</p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1 rounded-full"
              onClick={handleCopy}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar link
            </Button>
            <Button
              className="flex-1 rounded-full"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartir
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Members list */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-bold">Miembros ({members.length})</h2>
        </div>

        <Card>
          <CardContent className="p-0 divide-y">
            {members.map((m) => (
              <div key={m.user_id} className="flex items-center gap-3 px-4 py-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={m.profile.avatar_url ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {m.profile.display_name?.charAt(0)?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {m.profile.display_name}
                  </p>
                </div>
                {m.role === "admin" && (
                  <Badge variant="secondary" className="text-xs">
                    Admin
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
