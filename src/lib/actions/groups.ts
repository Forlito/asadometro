"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getNextColor } from "@/lib/constants";

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  return user;
}

export async function createGroup(name: string, description: string | null) {
  const user = await getUser();
  const admin = createAdminClient();

  // Count existing groups to pick color
  const { data: existing } = await admin
    .from("group_members")
    .select("group_id")
    .eq("user_id", user.id);

  const color = getNextColor(existing?.length ?? 0);

  const { data: group, error } = await admin
    .from("groups")
    .insert({ name, description, color, created_by: user.id })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await admin.from("group_members").insert({
    group_id: group.id,
    user_id: user.id,
    role: "admin",
  });

  revalidatePath("/home");
  revalidatePath("/groups");
  return group;
}

export async function joinGroup(inviteCode: string) {
  const user = await getUser();
  const admin = createAdminClient();

  const { data: group } = await admin
    .from("groups")
    .select("id")
    .eq("invite_code", inviteCode)
    .single();

  if (!group) throw new Error("Grupo no encontrado");

  const { data: existing } = await admin
    .from("group_members")
    .select("user_id")
    .eq("group_id", group.id)
    .eq("user_id", user.id)
    .single();

  if (existing) return group;

  await admin.from("group_members").insert({
    group_id: group.id,
    user_id: user.id,
    role: "member",
  });

  revalidatePath("/home");
  revalidatePath("/groups");
  revalidatePath(`/groups/${group.id}`);
  return group;
}
