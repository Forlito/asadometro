"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { toast } from "sonner";
import { toggleAttendance } from "@/lib/actions/attendance";

export function ManualAttendance({
  eventId,
  userId,
  attended,
  groupId,
}: {
  eventId: string;
  userId: string;
  attended: boolean;
  groupId: string;
}) {
  const router = useRouter();

  const toggle = async () => {
    try {
      await toggleAttendance(eventId, userId, attended, groupId);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 w-7 p-0 rounded-full"
      onClick={toggle}
    >
      {attended ? (
        <Icon name="close" size="sm" className="text-destructive" />
      ) : (
        <Icon name="check" size="sm" className="text-green-600" />
      )}
    </Button>
  );
}
