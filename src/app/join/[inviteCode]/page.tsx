"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icon";
import { joinGroup } from "@/lib/actions/groups";

export default function JoinGroupPage() {
  const params = useParams();
  const router = useRouter();
  const inviteCode = params.inviteCode as string;

  const [group, setGroup] = useState<{ id: string; name: string; description: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      const { data: g } = await supabase
        .from("groups")
        .select("id, name, description")
        .eq("invite_code", inviteCode)
        .single();

      if (g) setGroup(g);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) setNeedsLogin(true);

      setLoading(false);
    };
    load();
  }, [inviteCode]);

  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/join/${inviteCode}`,
      },
    });
  };

  const handleJoin = async () => {
    setJoining(true);
    try {
      const g = await joinGroup(inviteCode);
      toast.success("Te uniste al grupo!");
      router.push(`/groups/${g.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al unirse");
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Icon name="local_fire_department" className="text-primary text-3xl animate-pulse" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Icon name="sentiment_dissatisfied" className="text-muted-foreground text-3xl" />
        </div>
        <h1 className="text-xl font-bold mb-2">Grupo no encontrado</h1>
        <p className="text-muted-foreground">El link de invitacion no es valido</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6 text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Icon name="groups" className="text-primary text-3xl" />
          </div>
          <h1 className="text-xl font-bold">{group.name}</h1>
          {group.description && (
            <p className="text-muted-foreground text-sm">{group.description}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Te invitaron a unirte a este grupo
          </p>

          {needsLogin ? (
            <Button className="w-full rounded-full" onClick={handleLogin}>
              Entrar con Google para unirte
            </Button>
          ) : (
            <Button
              className="w-full rounded-full"
              onClick={handleJoin}
              disabled={joining}
            >
              {joining ? "Uniendose..." : "Unirme al grupo"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
