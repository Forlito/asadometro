"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { updateEvent } from "@/lib/actions/events";
import { createClient } from "@/lib/supabase/client";
import { Flame } from "lucide-react";

type Member = {
  user_id: string;
  profiles: { id: string; display_name: string; avatar_url: string | null };
};

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;
  const eventId = params.eventId as string;

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [asadorId, setAsadorId] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [costArs, setCostArs] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      // Fetch event data
      const { data: event } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (event) {
        setTitle(event.title ?? "");
        setDate(event.event_date ?? "");
        setDescription(event.description ?? "");
        setVenue(event.venue ?? "");
        setAsadorId(event.asador_id ?? "");
        setGuestCount(event.guest_count?.toString() ?? "");
        setCostArs(event.cost_ars?.toString() ?? "");
        setNotes(event.notes ?? "");
      }

      // Fetch members
      const { data: m } = await supabase
        .from("group_members")
        .select("user_id, profiles(id, display_name, avatar_url)")
        .eq("group_id", groupId);

      if (m) setMembers(m as unknown as Member[]);
      setFetching(false);
    };
    load();
  }, [eventId, groupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    setLoading(true);
    try {
      await updateEvent({
        eventId,
        groupId,
        title: title.trim() || "Asado",
        description: description.trim() || null,
        eventDate: date,
        venue: venue.trim() || null,
        asadorId: asadorId || null,
        guestCount: guestCount ? parseInt(guestCount) : null,
        costArs: costArs ? parseFloat(costArs) : null,
        notes: notes.trim() || null,
      });
      toast.success("Asado actualizado!");
      router.push(`/groups/${groupId}/events/${eventId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar");
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <>
        <Header title="Editar asado" backHref={`/groups/${groupId}/events/${eventId}`} />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Flame className="h-8 w-8 text-primary animate-pulse" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Editar asado" backHref={`/groups/${groupId}/events/${eventId}`} />

      <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Titulo</label>
                <Input
                  placeholder="Ej: Asado de cumple"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Fecha</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Descripcion</label>
                <Input
                  placeholder="Ej: Traer bebida"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Sede</label>
                <Input
                  placeholder="¿Donde se hace?"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Asador</label>
                <select
                  value={asadorId}
                  onChange={(e) => setAsadorId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">¿Quien cocina?</option>
                  {members.map((m) => (
                    <option key={m.profiles.id} value={m.profiles.id}>
                      {m.profiles.display_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Comensales</label>
                <Input
                  type="number"
                  placeholder="Cantidad estimada"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  min={1}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Costo</label>
                <Input
                  type="number"
                  placeholder="$ Costo total en pesos"
                  value={costArs}
                  onChange={(e) => setCostArs(e.target.value)}
                  min={0}
                  step="0.01"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Notas</label>
                <textarea
                  placeholder="Notas del asado..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-full"
                disabled={loading || !date}
              >
                {loading ? "Guardando..." : "Guardar cambios"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
