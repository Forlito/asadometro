"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { toast } from "sonner";
import { StatsCardStory } from "./stats-card-story";
import { StatsCardTwitter } from "./stats-card-twitter";

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
  const twitterRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const generateAndDownload = async (
    ref: React.RefObject<HTMLDivElement | null>,
    filename: string
  ) => {
    if (!ref.current) return;
    setGenerating(true);
    try {
      const dataUrl = await toPng(ref.current, { pixelRatio: 1 });
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();
      toast.success("Imagen descargada!");
    } catch {
      toast.error("Error al generar la imagen");
    }
    setGenerating(false);
  };

  return (
    <div>
      {/* Hidden render targets */}
      <StatsCardStory ref={storyRef} stats={stats} />
      <StatsCardTwitter ref={twitterRef} stats={stats} />

      {/* Buttons */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="rounded-full gap-1.5 flex-1"
          onClick={() => generateAndDownload(storyRef, "asadometro-story.png")}
          disabled={generating}
        >
          <Icon name="smartphone" size="sm" />
          Instagram Story
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="rounded-full gap-1.5 flex-1"
          onClick={() => generateAndDownload(twitterRef, "asadometro-twitter.png")}
          disabled={generating}
        >
          <Icon name="computer" size="sm" />
          Twitter/X
        </Button>
      </div>
    </div>
  );
}
