"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { toast } from "sonner";

export function CopyInviteButton({ inviteCode }: { inviteCode: string }) {
  const handleCopy = async () => {
    const url = `${window.location.origin}/join/${inviteCode}`;
    await navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

  if (!inviteCode) return null;

  return (
    <Button
      variant="secondary"
      size="sm"
      className="rounded-full gap-1.5 w-full"
      onClick={handleCopy}
    >
      <Icon name="link" size="sm" />
      Copiar link de invitacion
    </Button>
  );
}
