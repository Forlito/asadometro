"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <Button
      variant="outline"
      className="w-full rounded-full text-destructive hover:text-destructive"
      onClick={handleLogout}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Cerrar sesion
    </Button>
  );
}
