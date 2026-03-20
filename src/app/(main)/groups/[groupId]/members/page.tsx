"use client";

import { useState, useEffect, useTransition } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@/components/ui/icon";
import { PendingRequests } from "@/components/groups/pending-requests";
import { toggleApprovalMode } from "@/lib/actions/groups";
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

type PendingRequest = {
  id: string;
  user_id: string;
  profile: {
    display_name: string;
    avatar_url: string | null;
  };
};

export default function MembersPage() {
  const params = useParams();
  const groupId = params.groupId as string;

  const [members, setMembers] = useState<Member[]>([]);
  const [inviteCode, setInviteCode] = useState("");
  const [requireApproval, setRequireApproval] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      const { data: group } = await supabase
        .from("groups")
        .select("invite_code, require_approval")
        .eq("id", groupId)
        .single();

      if (group) {
        setInviteCode(group.invite_code);
        setRequireApproval(group.require_approval ?? false);
      }

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

      // Fetch pending join requests
      const { data: requests } = await supabase
        .from("join_requests")
        .select("id, user_id, profiles(display_name, avatar_url)")
        .eq("group_id", groupId)
        .eq("status", "pending");

      if (requests) {
        setPendingRequests(
          requests.map((r) => ({
            id: r.id,
            user_id: r.user_id,
            profile: r.profiles as unknown as PendingRequest["profile"],
          }))
        );
      }

      setLoading(false);
    };
    load();
  }, [groupId]);

  const isAdmin = members.find((m) => m.user_id === currentUserId)?.role === "admin";

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

  const handleToggleApproval = () => {
    const newValue = !requireApproval;
    setRequireApproval(newValue);
    startTransition(async () => {
      try {
        await toggleApprovalMode(groupId, newValue);
        toast.success(newValue ? "Aprobacion activada" : "Aprobacion desactivada");
      } catch (err) {
        setRequireApproval(!newValue);
        toast.error(err instanceof Error ? err.message : "Error");
      }
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Icon name="local_fire_department" className="text-primary text-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full space-y-5 pb-24">
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
              <Icon name="content_copy" size="sm" className="mr-2" />
              Copiar link
            </Button>
            <Button
              className="flex-1 rounded-full"
              onClick={handleShare}
            >
              <Icon name="share" size="sm" className="mr-2" />
              Compartir
            </Button>
          </div>

          {/* Approval mode toggle - admin only */}
          {isAdmin && (
            <button
              type="button"
              onClick={handleToggleApproval}
              disabled={isPending}
              className="flex items-center justify-between w-full pt-2 border-t"
            >
              <div className="flex items-center gap-2">
                <Icon name="admin_panel_settings" size="sm" className="text-muted-foreground" />
                <span className="text-sm">Aprobar solicitudes</span>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${
                requireApproval ? "bg-primary justify-end" : "bg-muted justify-start"
              }`}>
                <div className="w-5 h-5 bg-white rounded-full shadow-sm" />
              </div>
            </button>
          )}
        </CardContent>
      </Card>

      {/* Pending requests - admin only */}
      {isAdmin && pendingRequests.length > 0 && (
        <>
          <PendingRequests requests={pendingRequests} />
          <Separator />
        </>
      )}

      <Separator />

      {/* Members list */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Icon name="groups" className="text-muted-foreground" size="sm" />
          <h2 className="text-base font-bold">Miembros ({members.length})</h2>
        </div>

        <Card>
          <CardContent className="p-0 divide-y">
            {members.map((m) => (
              <div key={m.user_id} className="flex items-center gap-3 px-4 py-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={m.profile.avatar_url ?? undefined} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
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
