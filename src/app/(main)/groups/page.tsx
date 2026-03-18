import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Header } from "@/components/layout/header";
import { GroupCard } from "@/components/groups/group-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function GroupsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = createAdminClient();

  const { data: memberships } = await admin
    .from("group_members")
    .select("group_id, groups(id, name, description, color, invite_code)")
    .eq("user_id", user!.id);

  type GroupRow = { id: string; name: string; description: string | null; color: string; invite_code: string };
  const groups = memberships?.map((m) => m.groups as unknown as GroupRow) ?? [];
  const groupIds = groups.map((g) => g.id);

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

  return (
    <>
      <Header
        title="Mis Grupos"
        rightContent={
          <Link href="/groups/new">
            <Button size="sm" variant="ghost" className="rounded-full gap-1 text-primary">
              <Plus className="h-4 w-4" />
              Nuevo
            </Button>
          </Link>
        }
      />

      <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">
        {groups.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🥩</div>
            <p className="font-semibold text-lg mb-1">No tenés grupos</p>
            <p className="text-sm text-muted-foreground mb-6">
              Creá uno e invitá a tus amigos
            </p>
            <Link href="/groups/new">
              <Button className="rounded-full">Crear grupo</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                id={group.id}
                name={group.name}
                description={group.description}
                color={group.color ?? "#e67e22"}
                memberCount={memberCountByGroup[group.id] ?? 0}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
