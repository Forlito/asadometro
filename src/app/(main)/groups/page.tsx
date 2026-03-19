import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Header } from "@/components/layout/header";
import { GroupCard } from "@/components/groups/group-card";
import { GroupsSearch } from "@/components/groups/groups-search";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
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

  const groupsData = groups.map((g) => ({
    ...g,
    memberCount: memberCountByGroup[g.id] ?? 0,
  }));

  return (
    <>
      <Header
        title="Mis Grupos"
        large
      />

      <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full pb-24">
        {groups.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Icon name="groups" className="text-primary text-4xl" />
            </div>
            <p className="font-bold text-lg mb-1">No tenes grupos</p>
            <p className="text-sm text-muted-foreground mb-6">
              Crea uno e invita a tus amigos
            </p>
            <Link href="/groups/new">
              <Button className="rounded-full">Crear grupo</Button>
            </Link>
          </div>
        ) : (
          <GroupsSearch groups={groupsData} />
        )}
      </main>

      {/* FAB */}
      <Link
        href="/groups/new"
        className="fixed bottom-24 right-6 z-20 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      >
        <Icon name="add" size="lg" />
      </Link>
    </>
  );
}
