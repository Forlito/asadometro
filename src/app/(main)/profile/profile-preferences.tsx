"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { MeatSelector } from "@/components/preferences/meat-selector";
import { updateProfilePreferences } from "@/lib/actions/profile";
import { toast } from "sonner";

export function ProfilePreferences({
  preferredCut,
  preferredAchura,
}: {
  preferredCut: string | null;
  preferredAchura: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [cut, setCut] = useState(preferredCut ?? "");
  const [achura, setAchura] = useState(preferredAchura ?? "");
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateProfilePreferences(cut || null, achura || null);
        setEditing(false);
        toast.success("Preferencias actualizadas!");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error");
      }
    });
  };

  if (editing) {
    return (
      <section>
        <h2 className="text-base font-bold mb-3 flex items-center gap-2">
          <Icon name="restaurant" className="text-primary" size="sm" />
          Preferencias de asado
        </h2>
        <Card>
          <CardContent className="p-4 space-y-4">
            <MeatSelector label="Corte preferido" type="corte" value={cut} onChange={setCut} />
            <MeatSelector label="Achura preferida" type="achura" value={achura} onChange={setAchura} />
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full"
                onClick={() => {
                  setEditing(false);
                  setCut(preferredCut ?? "");
                  setAchura(preferredAchura ?? "");
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
          <Icon name="restaurant" className="text-primary" size="sm" />
          Preferencias de asado
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
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Corte:</span>
            <span className="font-medium">{preferredCut || "Sin definir"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Achura:</span>
            <span className="font-medium">{preferredAchura || "Sin definir"}</span>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
