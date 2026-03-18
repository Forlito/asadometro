"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { createGroup } from "@/lib/actions/groups";

export default function NewGroupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const group = await createGroup(name.trim(), description.trim() || null);
      toast.success("Grupo creado!");
      router.push(`/groups/${group.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear grupo");
      setLoading(false);
    }
  };

  return (
    <>
      <Header title="Nuevo grupo" backHref="/groups" />

      <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Nombre del grupo
                </label>
                <Input
                  placeholder="Ej: Asados del domingo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Descripcion (opcional)
                </label>
                <Input
                  placeholder="Ej: Los pibes de la esquina"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-full"
                disabled={loading || !name.trim()}
              >
                {loading ? "Creando..." : "Crear grupo"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
