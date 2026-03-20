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
    .select("id, require_approval")
    .eq("invite_code", inviteCode)
    .single();

  if (!group) throw new Error("Grupo no encontrado");

  // Already a member?
  const { data: existing } = await admin
    .from("group_members")
    .select("user_id")
    .eq("group_id", group.id)
    .eq("user_id", user.id)
    .single();

  if (existing) return { ...group, pending: false };

  // If approval required, create a join request instead
  if (group.require_approval) {
    // Check if already requested
    const { data: existingRequest } = await admin
      .from("join_requests")
      .select("id, status")
      .eq("group_id", group.id)
      .eq("user_id", user.id)
      .single();

    if (existingRequest) {
      return { ...group, pending: existingRequest.status === "pending" };
    }

    await admin.from("join_requests").insert({
      group_id: group.id,
      user_id: user.id,
    });

    return { ...group, pending: true };
  }

  await admin.from("group_members").insert({
    group_id: group.id,
    user_id: user.id,
    role: "member",
  });

  revalidatePath("/home");
  revalidatePath("/groups");
  revalidatePath(`/groups/${group.id}`);
  return { ...group, pending: false };
}

export async function approveJoinRequest(requestId: string) {
  const user = await getUser();
  const admin = createAdminClient();

  // Get the request
  const { data: request } = await admin
    .from("join_requests")
    .select("id, group_id, user_id, status")
    .eq("id", requestId)
    .single();

  if (!request || request.status !== "pending") {
    throw new Error("Solicitud no encontrada");
  }

  // Verify caller is admin
  const { data: membership } = await admin
    .from("group_members")
    .select("role")
    .eq("group_id", request.group_id)
    .eq("user_id", user.id)
    .single();

  if (membership?.role !== "admin") {
    throw new Error("Solo admins pueden aprobar solicitudes");
  }

  // Approve: update request + add member
  await admin
    .from("join_requests")
    .update({ status: "approved" })
    .eq("id", requestId);

  await admin.from("group_members").insert({
    group_id: request.group_id,
    user_id: request.user_id,
    role: "member",
  });

  revalidatePath(`/groups/${request.group_id}/members`);
  revalidatePath(`/groups/${request.group_id}`);
}

export async function rejectJoinRequest(requestId: string) {
  const user = await getUser();
  const admin = createAdminClient();

  const { data: request } = await admin
    .from("join_requests")
    .select("id, group_id, status")
    .eq("id", requestId)
    .single();

  if (!request || request.status !== "pending") {
    throw new Error("Solicitud no encontrada");
  }

  const { data: membership } = await admin
    .from("group_members")
    .select("role")
    .eq("group_id", request.group_id)
    .eq("user_id", user.id)
    .single();

  if (membership?.role !== "admin") {
    throw new Error("Solo admins pueden rechazar solicitudes");
  }

  await admin
    .from("join_requests")
    .update({ status: "rejected" })
    .eq("id", requestId);

  revalidatePath(`/groups/${request.group_id}/members`);
}

export async function toggleApprovalMode(groupId: string, requireApproval: boolean) {
  const user = await getUser();
  const admin = createAdminClient();

  const { data: membership } = await admin
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single();

  if (membership?.role !== "admin") {
    throw new Error("Solo admins pueden cambiar esta configuracion");
  }

  await admin
    .from("groups")
    .update({ require_approval: requireApproval })
    .eq("id", groupId);

  revalidatePath(`/groups/${groupId}/members`);
}

export async function updateGroupPhoto(groupId: string, photoUrl: string) {
  const user = await getUser();
  const admin = createAdminClient();

  const { data: membership } = await admin
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single();

  if (membership?.role !== "admin") {
    throw new Error("Solo admins pueden cambiar la foto del grupo");
  }

  await admin
    .from("groups")
    .update({ photo_url: photoUrl })
    .eq("id", groupId);

  revalidatePath(`/groups/${groupId}`);
  revalidatePath("/groups");
  revalidatePath("/home");
}
