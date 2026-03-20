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

export async function updateProfilePreferences(
  preferredCut: string | null,
  preferredAchura: string | null
) {
  const user = await getUser();
  const admin = createAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({
      preferred_cut: preferredCut?.trim() || null,
      preferred_achura: preferredAchura?.trim() || null,
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/profile");
}

export async function completeOnboarding(
  preferredCut: string | null,
  preferredAchura: string | null
) {
  const user = await getUser();
  const admin = createAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({
      preferred_cut: preferredCut?.trim() || null,
      preferred_achura: preferredAchura?.trim() || null,
      onboarding_completed: true,
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/home");
  revalidatePath("/profile");
}
