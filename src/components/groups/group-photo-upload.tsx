"use client";

import { useRef, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateGroupPhoto } from "@/lib/actions/groups";
import { Icon } from "@/components/ui/icon";
import { toast } from "sonner";

export function GroupPhotoUpload({
  groupId,
  currentPhotoUrl,
  groupName,
  color,
}: {
  groupId: string;
  currentPhotoUrl: string | null;
  groupName: string;
  color: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    startTransition(async () => {
      try {
        const supabase = createClient();
        const ext = file.name.split(".").pop();
        const path = `groups/${groupId}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("photos")
          .upload(path, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("photos")
          .getPublicUrl(path);

        await updateGroupPhoto(groupId, publicUrl);
        toast.success("Foto actualizada!");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error al subir foto");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={isPending}
      className="relative shrink-0"
    >
      {currentPhotoUrl ? (
        <img
          src={currentPhotoUrl}
          alt={groupName}
          className="w-14 h-14 rounded-full object-cover"
        />
      ) : (
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold"
          style={{ backgroundColor: color }}
        >
          {groupName.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="absolute -bottom-0.5 -right-0.5 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
        <Icon name="photo_camera" className="text-[10px]" />
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </button>
  );
}
