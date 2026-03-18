"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateSecretWord } from "@/lib/words";

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  return user;
}

export async function createEvent(
  groupId: string,
  title: string,
  description: string | null,
  eventDate: string
) {
  const user = await getUser();
  const admin = createAdminClient();
  const secretWord = generateSecretWord();

  const { data: event, error } = await admin
    .from("events")
    .insert({
      group_id: groupId,
      title: title || "Asado",
      description,
      event_date: eventDate,
      secret_word: secretWord,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Auto check-in the creator
  await admin.from("attendance").insert({
    event_id: event.id,
    user_id: user.id,
    method: "manual",
  });

  revalidatePath("/home");
  revalidatePath("/calendar");
  revalidatePath(`/groups/${groupId}`);
  return event;
}

export async function deleteEvent(eventId: string, groupId: string) {
  const user = await getUser();
  const admin = createAdminClient();

  const { data: event } = await admin
    .from("events")
    .select("created_by")
    .eq("id", eventId)
    .single();

  if (!event || event.created_by !== user.id) {
    throw new Error("Solo el asador puede eliminar el evento");
  }

  await admin.from("events").delete().eq("id", eventId);

  revalidatePath("/home");
  revalidatePath("/calendar");
  revalidatePath(`/groups/${groupId}`);
}
