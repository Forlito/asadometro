"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { toast } from "sonner";
import { createEvent } from "@/lib/actions/events";
import { createClient } from "@/lib/supabase/client";
import { VenueSelector } from "@/components/events/venue-selector";
import { PersonSelector } from "@/components/events/person-selector";

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
  const [asadorName, setAsadorName] = useState("");
  const [anfitrionId, setAnfitrionId] = useState("");
  const [anfitrionName, setAnfitrionName] = useState("");
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
        asadorName: asadorName.trim() || null,
        anfitrionId: anfitrionId || null,
        anfitrionName: anfitrionName.trim() || null,
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

      <main className="flex-1 px-4 py-5 max-w-lg mx-auto w-full pb-24">
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
                <Icon
                  name={showMore ? "expand_less" : "expand_more"}
                  size="sm"
                />
              </button>

              {showMore && (
                <div className="space-y-4 border-t pt-4">
                  <VenueSelector
                    members={members}
                    value={venue}
                    onChange={setVenue}
                  />

                  <PersonSelector
                    label="Asador"
                    placeholder="Quien cocina?"
                    members={members}
                    memberId={asadorId}
                    customName={asadorName}
                    onMemberChange={setAsadorId}
                    onCustomNameChange={setAsadorName}
                  />

                  <PersonSelector
                    label="Anfitrion"
                    placeholder="Quien organiza?"
                    members={members}
                    memberId={anfitrionId}
                    customName={anfitrionName}
                    onMemberChange={setAnfitrionId}
                    onCustomNameChange={setAnfitrionName}
                  />

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
