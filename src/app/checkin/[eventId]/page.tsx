"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle2, Flame } from "lucide-react";
import { checkin } from "@/lib/actions/attendance";

export default function CheckinPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const codeFromUrl = searchParams.get("code") ?? "";

  const [secretWord, setSecretWord] = useState(codeFromUrl);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setNeedsLogin(true);
        return;
      }

      // If code is in URL, auto-submit
      if (codeFromUrl) {
        handleCheckin(codeFromUrl);
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/checkin/${eventId}?code=${secretWord}`,
      },
    });
  };

  const handleCheckin = async (word: string) => {
    setLoading(true);
    try {
      await checkin(eventId, word);
      setSuccess(true);
      toast.success("Check-in exitoso!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al hacer check-in");
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretWord.trim()) return;
    await handleCheckin(secretWord);
  };

  if (success) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center px-6">
        <div className="text-center space-y-4">
          <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold">Check-in exitoso!</h1>
          <p className="text-muted-foreground">
            Quedaste registrado en {eventTitle || "el asado"}
          </p>
          <Button
            className="rounded-full mt-4"
            onClick={() => router.push("/dashboard")}
          >
            Ir al inicio
          </Button>
        </div>
      </div>
    );
  }

  if (needsLogin) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center px-6">
        <div className="text-center space-y-4">
          <Flame className="h-16 w-16 text-primary mx-auto" />
          <h1 className="text-2xl font-bold">Asadometro</h1>
          <p className="text-muted-foreground">
            Iniciá sesión para hacer check-in
          </p>
          <Button className="rounded-full" onClick={handleLogin}>
            Entrar con Google
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Flame className="h-12 w-12 text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-bold">Check-in</h1>
          {eventTitle && (
            <p className="text-muted-foreground mt-1">{eventTitle}</p>
          )}
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Palabra secreta
                </label>
                <Input
                  placeholder="Ingresá la palabra..."
                  value={secretWord}
                  onChange={(e) => setSecretWord(e.target.value)}
                  className="text-center text-lg font-semibold uppercase tracking-wider"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-full"
                disabled={loading || !secretWord.trim()}
              >
                {loading ? "Verificando..." : "Hacer check-in"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
