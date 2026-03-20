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

export async function rateEvent(eventId: string, groupId: string, rating: number) {
  if (rating < 1 || rating > 10) throw new Error("Rating debe ser entre 1 y 10");

  const user = await getUser();
  const admin = createAdminClient();

  // Verify user attended this event
  const { data: attendance } = await admin
    .from("attendance")
    .select("user_id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .single();

  if (!attendance) throw new Error("Solo los asistentes pueden votar");

  // Upsert rating
  const { error } = await admin
    .from("event_ratings")
    .upsert(
      { event_id: eventId, user_id: user.id, rating },
      { onConflict: "event_id,user_id" }
    );

  if (error) throw new Error(error.message);
  revalidatePath(`/groups/${groupId}/events/${eventId}`);
}
