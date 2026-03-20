"use client";

import { useState, useTransition } from "react";
import { rateEvent } from "@/lib/actions/ratings";
import { toast } from "sonner";

export function AsadorRating({
  eventId,
  groupId,
  currentRating,
  averageRating,
  totalVotes,
  canVote,
}: {
  eventId: string;
  groupId: string;
  currentRating: number | null;
  averageRating: number | null;
  totalVotes: number;
  canVote: boolean;
}) {
  const [selected, setSelected] = useState(currentRating);
  const [isPending, startTransition] = useTransition();

  const handleRate = (rating: number) => {
    setSelected(rating);
    startTransition(async () => {
      try {
        await rateEvent(eventId, groupId, rating);
        toast.success("Voto registrado!");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error al votar");
        setSelected(currentRating);
      }
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">Rating del asado</h3>
        {averageRating !== null && (
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-extrabold text-primary">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">/10</span>
            <span className="text-xs text-muted-foreground ml-1">
              ({totalVotes} {totalVotes === 1 ? "voto" : "votos"})
            </span>
          </div>
        )}
      </div>

      {canVote && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">
            {selected ? "Tu voto (toca para cambiar)" : "Vota la calidad del asado"}
          </p>
          <div className="flex gap-1.5">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                type="button"
                disabled={isPending}
                onClick={() => handleRate(num)}
                className={`h-9 w-9 rounded-lg text-sm font-bold transition-colors ${
                  selected === num
                    ? "bg-primary text-white shadow-md"
                    : num <= (selected ?? 0)
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      )}

      {!canVote && totalVotes === 0 && (
        <p className="text-xs text-muted-foreground">
          Todavia no hay votos
        </p>
      )}
    </div>
  );
}
