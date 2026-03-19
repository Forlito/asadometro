"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { addEventPhoto } from "@/lib/actions/events";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icon";

type Photo = {
  id: string;
  photo_url: string;
  user_id: string;
  created_at: string;
  profiles: { display_name: string };
};

export function PhotoGallery({
  eventId,
  groupId,
  photos: initialPhotos,
  userId,
}: {
  eventId: string;
  groupId: string;
  photos: Photo[];
  userId: string;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [viewPhoto, setViewPhoto] = useState<Photo | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${eventId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(path, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("photos").getPublicUrl(path);

      await addEventPhoto(eventId, publicUrl, groupId);
      toast.success("Foto subida!");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al subir foto"
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold">Fotos</h2>
        <Button
          size="sm"
          variant="ghost"
          className="rounded-full gap-1 text-primary"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          <Icon name="photo_camera" size="sm" />
          {uploading ? "Subiendo..." : "Agregar foto"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {initialPhotos.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No hay fotos todavia
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {initialPhotos.map((photo) => (
            <button
              key={photo.id}
              onClick={() => setViewPhoto(photo)}
              className="aspect-square rounded-lg overflow-hidden bg-muted"
            >
              <img
                src={photo.photo_url}
                alt="Foto del asado"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Full-size photo dialog */}
      <Dialog open={!!viewPhoto} onOpenChange={(open) => !open && setViewPhoto(null)}>
        <DialogContent className="max-w-lg p-1 sm:max-w-lg">
          <DialogTitle className="sr-only">Foto del asado</DialogTitle>
          {viewPhoto && (
            <div>
              <img
                src={viewPhoto.photo_url}
                alt="Foto del asado"
                className="w-full rounded-lg"
              />
              <p className="text-xs text-muted-foreground text-center mt-2 pb-1">
                {viewPhoto.profiles.display_name}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
