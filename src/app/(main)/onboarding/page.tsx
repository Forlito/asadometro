"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { MeatSelector } from "@/components/preferences/meat-selector";
import { completeOnboarding } from "@/lib/actions/profile";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const [cut, setCut] = useState("");
  const [achura, setAchura] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await completeOnboarding(cut || null, achura || null);
      router.push("/home");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await completeOnboarding(null, null);
      router.push("/home");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 px-4 py-8 max-w-lg mx-auto w-full space-y-6 pb-24">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Icon name="local_fire_department" className="text-primary text-3xl" />
        </div>
        <h1 className="text-2xl font-extrabold">Bienvenido al Asadometro!</h1>
        <p className="text-muted-foreground mt-2">
          Contanos tus preferencias de asado
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <MeatSelector
            label="Corte preferido"
            type="corte"
            value={cut}
            onChange={setCut}
          />

          <MeatSelector
            label="Achura preferida"
            type="achura"
            value={achura}
            onChange={setAchura}
          />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button
          className="w-full rounded-full"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Guardando..." : "Guardar preferencias"}
        </Button>
        <Button
          variant="ghost"
          className="w-full rounded-full text-muted-foreground"
          onClick={handleSkip}
          disabled={loading}
        >
          Omitir por ahora
        </Button>
      </div>
    </main>
  );
}
