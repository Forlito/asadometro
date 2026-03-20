"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CATEGORIES = ["Bug", "Sugerencia", "Otro"];

export function FeedbackFAB({
  userEmail,
  userName,
}: {
  userEmail: string;
  userName: string;
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("Sugerencia");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error("Escribi un mensaje");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, message, userEmail, userName }),
      });

      if (!res.ok) throw new Error();

      toast.success("Feedback enviado, gracias!");
      setMessage("");
      setOpen(false);
    } catch {
      toast.error("Error al enviar feedback");
    }
    setSending(false);
  };

  return (
    <>
      {/* FAB Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-4 z-[25] w-11 h-11 rounded-full bg-muted/90 border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-colors active:scale-95"
          aria-label="Enviar feedback"
        >
          <Icon name="support_agent" className="text-muted-foreground" size="sm" />
        </button>
      )}

      {/* Modal Overlay */}
      {open && (
        <div className="fixed inset-0 z-[50] flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          {/* Bottom Sheet */}
          <div className="relative w-full max-w-lg bg-card rounded-t-2xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Enviar feedback</h3>
              <button onClick={() => setOpen(false)} className="p-1">
                <Icon name="close" className="text-muted-foreground" size="sm" />
              </button>
            </div>

            {/* Category chips */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Categoria</p>
              <div className="flex gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      category === cat
                        ? "bg-primary text-white border-primary"
                        : "bg-card border-border text-foreground hover:border-primary/50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Mensaje</p>
              <textarea
                placeholder="Contanos que encontraste o que te gustaria mejorar..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>

            <Button
              className="w-full rounded-full"
              onClick={handleSubmit}
              disabled={sending || !message.trim()}
            >
              {sending ? "Enviando..." : "Enviar feedback"}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
