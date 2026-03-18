"use client";

import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

export function QRDisplay({
  eventId,
  secretWord,
}: {
  eventId: string;
  secretWord: string;
}) {
  const checkinUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/checkin/${eventId}?code=${secretWord}`
      : `/checkin/${eventId}?code=${secretWord}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(checkinUrl);
    toast.success("Link copiado!");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check-in al asado",
          text: `Escaneá el QR o usá la palabra secreta: ${secretWord}`,
          url: checkinUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Card>
      <CardContent className="p-6 flex flex-col items-center gap-4">
        <p className="text-sm font-medium text-muted-foreground">
          QR de check-in
        </p>

        <div className="bg-white p-4 rounded-2xl">
          <QRCodeSVG
            value={checkinUrl}
            size={200}
            level="M"
            fgColor="#c2410c"
          />
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Palabra secreta</p>
          <p className="text-2xl font-extrabold tracking-wider text-primary uppercase">
            {secretWord}
          </p>
        </div>

        <div className="flex gap-2 w-full">
          <Button
            variant="secondary"
            className="flex-1 rounded-full"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copiar link
          </Button>
          <Button
            className="flex-1 rounded-full"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
