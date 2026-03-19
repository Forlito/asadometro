"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

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
      <Icon name="logout" size="sm" className="mr-2" />
      Cerrar sesion
    </Button>
  );
}
