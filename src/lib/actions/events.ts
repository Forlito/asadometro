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

async function fetchBlueRate(): Promise<number | null> {
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares/blue", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.venta ?? null;
  } catch {
    return null;
  }
}

export async function createEvent(params: {
  groupId: string;
  title: string;
  description: string | null;
  eventDate: string;
  venue: string | null;
  asadorId: string | null;
  guestCount: number | null;
  costArs: number | null;
  notes: string | null;
}) {
  const user = await getUser();
  const admin = createAdminClient();
  const secretWord = generateSecretWord();

  // Fetch blue rate if cost is provided
  let usdRate: number | null = null;
  if (params.costArs && params.costArs > 0) {
    usdRate = await fetchBlueRate();
  }

  const { data: event, error } = await admin
    .from("events")
    .insert({
      group_id: params.groupId,
      title: params.title || "Asado",
      description: params.description,
      event_date: params.eventDate,
      secret_word: secretWord,
      created_by: user.id,
      venue: params.venue,
      asador_id: params.asadorId || user.id,
      guest_count: params.guestCount,
      cost_ars: params.costArs,
      usd_rate: usdRate,
      notes: params.notes,
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
  revalidatePath(`/groups/${params.groupId}`);
  return event;
}

export async function updateEvent(params: {
  eventId: string;
  groupId: string;
  title: string;
  description: string | null;
  eventDate: string;
  venue: string | null;
  asadorId: string | null;
  guestCount: number | null;
  costArs: number | null;
  notes: string | null;
}) {
  const user = await getUser();
  const admin = createAdminClient();

  // Verify ownership
  const { data: event } = await admin
    .from("events")
    .select("created_by")
    .eq("id", params.eventId)
    .single();

  if (!event || event.created_by !== user.id) {
    throw new Error("Solo el organizador puede editar el evento");
  }

  // Re-fetch blue rate if cost changed
  let usdRate: number | null = null;
  if (params.costArs && params.costArs > 0) {
    usdRate = await fetchBlueRate();
  }

  const { error } = await admin
    .from("events")
    .update({
      title: params.title || "Asado",
      description: params.description,
      event_date: params.eventDate,
      venue: params.venue,
      asador_id: params.asadorId,
      guest_count: params.guestCount,
      cost_ars: params.costArs,
      usd_rate: usdRate,
      notes: params.notes,
    })
    .eq("id", params.eventId);

  if (error) throw new Error(error.message);

  revalidatePath("/home");
  revalidatePath("/calendar");
  revalidatePath(`/groups/${params.groupId}`);
  revalidatePath(`/groups/${params.groupId}/events/${params.eventId}`);
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
    throw new Error("Solo el organizador puede eliminar el evento");
  }

  await admin.from("events").delete().eq("id", eventId);

  revalidatePath("/home");
  revalidatePath("/calendar");
  revalidatePath(`/groups/${groupId}`);
}

export async function addEventComment(eventId: string, content: string, groupId: string) {
  const user = await getUser();
  const admin = createAdminClient();

  const { error } = await admin.from("event_comments").insert({
    event_id: eventId,
    user_id: user.id,
    content: content.trim(),
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/groups/${groupId}/events/${eventId}`);
}

export async function deleteEventComment(commentId: string, eventId: string, groupId: string) {
  const user = await getUser();
  const admin = createAdminClient();

  await admin.from("event_comments").delete().eq("id", commentId).eq("user_id", user.id);
  revalidatePath(`/groups/${groupId}/events/${eventId}`);
}

export async function addEventPhoto(eventId: string, photoUrl: string, groupId: string) {
  const user = await getUser();
  const admin = createAdminClient();

  const { error } = await admin.from("event_photos").insert({
    event_id: eventId,
    user_id: user.id,
    photo_url: photoUrl,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/groups/${groupId}/events/${eventId}`);
}
