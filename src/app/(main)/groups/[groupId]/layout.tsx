import { createAdminClient } from "@/lib/supabase/admin";
import { Header } from "@/components/layout/header";
import { GroupTabs } from "@/components/layout/group-tabs";

export default async function GroupLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const admin = createAdminClient();

  const { data: group } = await admin
    .from("groups")
    .select("name, color")
    .eq("id", groupId)
    .single();

  return (
    <>
      <div className="h-1 bg-primary w-full" />
      <Header title={group?.name ?? "Grupo"} backHref="/groups" />
      <GroupTabs groupId={groupId} />
      {children}
    </>
  );
}
