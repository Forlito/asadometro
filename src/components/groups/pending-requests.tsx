"use client";

import { useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { toast } from "sonner";
import { approveJoinRequest, rejectJoinRequest } from "@/lib/actions/groups";

type PendingRequest = {
  id: string;
  user_id: string;
  profile: {
    display_name: string;
    avatar_url: string | null;
  };
};

export function PendingRequests({ requests }: { requests: PendingRequest[] }) {
  const [isPending, startTransition] = useTransition();

  if (requests.length === 0) return null;

  const handleApprove = (requestId: string) => {
    startTransition(async () => {
      try {
        await approveJoinRequest(requestId);
        toast.success("Solicitud aprobada!");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error");
      }
    });
  };

  const handleReject = (requestId: string) => {
    startTransition(async () => {
      try {
        await rejectJoinRequest(requestId);
        toast.success("Solicitud rechazada");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error");
      }
    });
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Icon name="pending" className="text-yellow-500" size="sm" />
        <h2 className="text-base font-bold">Solicitudes pendientes ({requests.length})</h2>
      </div>
      <Card>
        <CardContent className="p-0 divide-y">
          {requests.map((r) => (
            <div key={r.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={r.profile.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {r.profile.display_name?.charAt(0)?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{r.profile.display_name}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive h-8 px-2"
                  onClick={() => handleReject(r.id)}
                  disabled={isPending}
                >
                  <Icon name="close" size="sm" />
                </Button>
                <Button
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => handleApprove(r.id)}
                  disabled={isPending}
                >
                  <Icon name="check" size="sm" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
