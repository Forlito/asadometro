"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { toast } from "sonner";
import { StatsCardStory } from "./stats-card-story";

type StatsData = {
  displayName: string;
  avatarUrl: string | null;
  attended: number;
  hosted: number;
  grilled: number;
  attendanceRate: number;
  avgRating: number | null;
};

export function StatsSnapshot({ stats }: { stats: StatsData }) {
  const storyRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const generatePreview = async () => {
    if (!storyRef.current) return;
    setGenerating(true);
    try {
      const dataUrl = await toPng(storyRef.current, { pixelRatio: 1 });
      setPreviewUrl(dataUrl);
    } catch {
      toast.error("Error al generar la imagen");
    }
    setGenerating(false);
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.download = "asadometro-stats.png";
    link.href = previewUrl;
    link.click();
    toast.success("Imagen descargada!");
  };

  const handleCopy = async () => {
    if (!previewUrl) return;
    try {
      const res = await fetch(previewUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      toast.success("Imagen copiada!");
    } catch {
      toast.error("No se pudo copiar la imagen");
    }
  };

  return (
    <div>
      {/* Hidden render target */}
      <StatsCardStory ref={storyRef} stats={stats} />

      {/* Generate button */}
      {!previewUrl && (
        <Button
          variant="secondary"
          size="sm"
          className="rounded-full gap-1.5 w-full"
          onClick={generatePreview}
          disabled={generating}
        >
          <Icon name="share" size="sm" />
          {generating ? "Generando..." : "Compartir mis stats"}
        </Button>
      )}

      {/* Preview modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setPreviewUrl(null)}
          />
          <div className="relative bg-card rounded-2xl p-4 mx-4 max-w-sm w-full space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Preview</h3>
              <button onClick={() => setPreviewUrl(null)} className="p-1">
                <Icon name="close" className="text-muted-foreground" size="sm" />
              </button>
            </div>

            {/* Preview image */}
            <div className="rounded-lg overflow-hidden border">
              <img
                src={previewUrl}
                alt="Stats preview"
                className="w-full h-auto"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full gap-1.5 flex-1"
                onClick={handleCopy}
              >
                <Icon name="content_copy" size="sm" />
                Copiar
              </Button>
              <Button
                size="sm"
                className="rounded-full gap-1.5 flex-1"
                onClick={handleDownload}
              >
                <Icon name="download" size="sm" />
                Descargar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
