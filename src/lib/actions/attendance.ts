"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  return user;
}

export async function checkin(eventId: string, secretWord: string) {
  const user = await getUser();
  const admin = createAdminClient();

  const { data: event } = await admin
    .from("events")
    .select("id, secret_word, group_id")
    .eq("id", eventId)
    .single();

  if (!event) throw new Error("Evento no encontrado");

  if (event.secret_word.toLowerCase() !== secretWord.toLowerCase()) {
    throw new Error("Palabra secreta incorrecta");
  }

  // Auto-join group if not a member
  const { data: membership } = await admin
    .from("group_members")
    .select("user_id")
    .eq("group_id", event.group_id)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    await admin.from("group_members").insert({
      group_id: event.group_id,
      user_id: user.id,
      role: "member",
    });
  }

  await admin.from("attendance").upsert({
    event_id: eventId,
    user_id: user.id,
    method: "qr",
  });

  revalidatePath(`/groups/${event.group_id}`);
  revalidatePath("/home");
  return { success: true, groupId: event.group_id };
}

export async function toggleAttendance(
  eventId: string,
  userId: string,
  attended: boolean,
  groupId: string
) {
  const user = await getUser();
  const admin = createAdminClient();

  // Verify caller is the event creator
  const { data: event } = await admin
    .from("events")
    .select("created_by")
    .eq("id", eventId)
    .single();

  if (!event || event.created_by !== user.id) {
    throw new Error("Solo el asador puede cambiar la asistencia");
  }

  if (attended) {
    await admin
      .from("attendance")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", userId);
  } else {
    await admin.from("attendance").insert({
      event_id: eventId,
      user_id: userId,
      method: "manual",
    });
  }

  revalidatePath(`/groups/${groupId}/events/${eventId}`);
  revalidatePath(`/groups/${groupId}`);
  return { success: true };
}
