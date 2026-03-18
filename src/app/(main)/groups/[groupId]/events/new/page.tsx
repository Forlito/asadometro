"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { createEvent } from "@/lib/actions/events";

export default function NewEventPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    setLoading(true);
    try {
      const event = await createEvent(
        groupId,
        title.trim() || "Asado",
        description.trim() || null,
        date
      );
      toast.success("Asado creado!");
      router.push(`/groups/${groupId}/events/${event.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear asado");
      setLoading(false);
    }
  };

  return (
    <>
      <Header title="Nuevo asado" backHref={`/groups/${groupId}`} />

      <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Titulo (opcional)
                </label>
                <Input
                  placeholder="Ej: Asado de cumple"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Fecha
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Descripcion (opcional)
                </label>
                <Input
                  placeholder="Ej: Traer bebida"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-full"
                disabled={loading || !date}
              >
                {loading ? "Creando..." : "Crear asado"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
