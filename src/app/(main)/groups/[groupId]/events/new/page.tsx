"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { createEvent } from "@/lib/actions/events";
import { createClient } from "@/lib/supabase/client";
import { ChevronDown, ChevronUp } from "lucide-react";

type Member = {
  user_id: string;
  profiles: { id: string; display_name: string; avatar_url: string | null };
};

export default function NewEventPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Extra fields
  const [showMore, setShowMore] = useState(false);
  const [venue, setVenue] = useState("");
  const [asadorId, setAsadorId] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [costArs, setCostArs] = useState("");
  const [notes, setNotes] = useState("");

  // Fetch group members for asador dropdown
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("group_members")
      .select("user_id, profiles(id, display_name, avatar_url)")
      .eq("group_id", groupId)
      .then(({ data }) => {
        if (data) setMembers(data as unknown as Member[]);
      });
  }, [groupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    setLoading(true);
    try {
      const event = await createEvent({
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

              {/* Collapsible extra details */}
              <button
                type="button"
                onClick={() => setShowMore(!showMore)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                Mas detalles
                {showMore ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {showMore && (
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Sede
                    </label>
                    <Input
                      placeholder="¿Dónde se hace?"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Asador
                    </label>
                    <select
                      value={asadorId}
                      onChange={(e) => setAsadorId(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">¿Quién cocina?</option>
                      {members.map((m) => (
                        <option key={m.profiles.id} value={m.profiles.id}>
                          {m.profiles.display_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Comensales
                    </label>
                    <Input
                      type="number"
                      placeholder="Cantidad estimada"
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      min={1}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Costo
                    </label>
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
                    <label className="text-sm font-medium mb-1.5 block">
                      Notas
                    </label>
                    <textarea
                      placeholder="Notas del asado..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                    />
                  </div>
                </div>
              )}

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
