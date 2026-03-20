import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { GroupTabs } from "@/components/layout/group-tabs";
import { GroupPhotoUpload } from "@/components/groups/group-photo-upload";

export default async function GroupLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const admin = createAdminClient();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: group } = await admin
    .from("groups")
    .select("name, color, photo_url")
    .eq("id", groupId)
    .single();

  // Check if user is admin
  const { data: membership } = await admin
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user!.id)
    .single();

  const isAdmin = membership?.role === "admin";

  return (
    <>
      <div className="h-1 bg-primary w-full" />
      <div className="sticky top-0 z-40 bg-card dark:bg-background border-b border-border/10">
        <div className="flex items-center gap-3 h-14 px-4 max-w-lg mx-auto">
          <a href="/groups" className="text-foreground p-1">
            <span className="material-symbols-rounded text-[24px]">arrow_back</span>
          </a>
          {isAdmin ? (
            <GroupPhotoUpload
              groupId={groupId}
              currentPhotoUrl={group?.photo_url ?? null}
              groupName={group?.name ?? "G"}
              color={group?.color ?? "#d46211"}
            />
          ) : group?.photo_url ? (
            <img
              src={group.photo_url}
              alt={group?.name ?? ""}
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ backgroundColor: group?.color ?? "#d46211" }}
            >
              {(group?.name ?? "G").charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-lg font-bold tracking-tight truncate">
            {group?.name ?? "Grupo"}
          </h1>
        </div>
      </div>
      <GroupTabs groupId={groupId} />
      {children}
    </>
  );
}
