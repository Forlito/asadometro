"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { updateNickname } from "@/lib/actions/profile";
import { toast } from "sonner";

export function ProfileNickname({
  currentNickname,
  displayName,
}: {
  currentNickname: string | null;
  displayName: string;
}) {
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState(currentNickname ?? "");
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateNickname(nickname || null);
        setEditing(false);
        toast.success("Nombre actualizado!");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error");
      }
    });
  };

  if (editing) {
    return (
      <section>
        <h2 className="text-base font-bold mb-3 flex items-center gap-2">
          <Icon name="badge" className="text-primary" size="sm" />
          Nombre personalizado
        </h2>
        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              Ponete un apodo o nombre personalizado. Si lo dejas vacio, se usa tu nombre original.
            </p>
            <Input
              placeholder={displayName}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={50}
            />
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full"
                onClick={() => {
                  setEditing(false);
                  setNickname(currentNickname ?? "");
                }}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="rounded-full"
                onClick={handleSave}
                disabled={isPending}
              >
                {isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold flex items-center gap-2">
          <Icon name="badge" className="text-primary" size="sm" />
          Nombre personalizado
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary"
          onClick={() => setEditing(true)}
        >
          <Icon name="edit" size="sm" className="mr-1" />
          Editar
        </Button>
      </div>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Apodo:</span>
            <span className="font-medium">{currentNickname || "Sin definir"}</span>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
