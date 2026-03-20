import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { FeedbackFAB } from "@/components/layout/feedback-fab";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="flex flex-col min-h-screen pb-16">
      {children}
      <AppShell />
      <FeedbackFAB
        userEmail={user.email ?? ""}
        userName={user.user_metadata?.full_name ?? user.email ?? ""}
      />
    </div>
  );
}
