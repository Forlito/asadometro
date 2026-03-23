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

export async function updateNickname(nickname: string | null) {
  const user = await getUser();
  const admin = createAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({
      nickname: nickname?.trim() || null,
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  // If nickname is set, update display_name to the nickname
  // If cleared, restore the original name from auth metadata
  if (nickname?.trim()) {
    await admin
      .from("profiles")
      .update({ display_name: nickname.trim() })
      .eq("id", user.id);
  } else {
    // Restore original name from auth
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const originalName =
      authUser?.user_metadata?.full_name ||
      authUser?.user_metadata?.name ||
      authUser?.email?.split("@")[0] ||
      "Usuario";
    await admin
      .from("profiles")
      .update({ display_name: originalName })
      .eq("id", user.id);
  }

  revalidatePath("/profile");
  revalidatePath("/home");
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
