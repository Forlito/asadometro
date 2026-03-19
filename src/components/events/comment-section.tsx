"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addEventComment } from "@/lib/actions/events";
import { toast } from "sonner";
import { Send } from "lucide-react";

type Comment = {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profiles: { display_name: string; avatar_url: string | null };
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return "hace un momento";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  const days = Math.floor(diff / 86400);
  if (days === 1) return "hace 1 dia";
  return `hace ${days} dias`;
}

export function CommentSection({
  eventId,
  groupId,
  comments,
  userId,
}: {
  eventId: string;
  groupId: string;
  comments: Comment[];
  userId: string;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!content.trim()) return;
    setSending(true);
    try {
      await addEventComment(eventId, content.trim(), groupId);
      setContent("");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al enviar comentario"
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <section>
      <h2 className="text-base font-bold mb-3">Comentarios</h2>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No hay comentarios todavia
        </p>
      ) : (
        <div className="space-y-4 mb-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={c.profiles.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs">
                  {c.profiles.display_name?.charAt(0)?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium">
                    {c.profiles.display_name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {timeAgo(c.created_at)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {c.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add comment */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Escribi un comentario..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={sending}
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={handleSend}
          disabled={sending || !content.trim()}
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
