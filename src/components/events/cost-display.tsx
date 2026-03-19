import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

export function CostDisplay({
  costArs,
  usdRate,
  effectiveGuests,
}: {
  costArs: number;
  usdRate: number | null;
  effectiveGuests: number;
}) {
  const costUsd = usdRate ? costArs / usdRate : null;
  const perPersonArs = effectiveGuests > 0 ? costArs / effectiveGuests : null;
  const perPersonUsd =
    costUsd && effectiveGuests > 0 ? costUsd / effectiveGuests : null;

  const fmt = (n: number) =>
    n.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const fmtUsd = (n: number) =>
    n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="payments" className="text-primary" size="sm" />
          <span className="text-sm font-bold">Costos</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-semibold">
            ${fmt(costArs)} ARS
            {costUsd != null && (
              <span className="text-muted-foreground font-normal">
                {" "}
                (~${fmtUsd(costUsd)} USD)
              </span>
            )}
          </span>
        </div>

        {perPersonArs != null && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Por persona ({effectiveGuests})
            </span>
            <span className="font-semibold">
              ${fmt(perPersonArs)} ARS
              {perPersonUsd != null && (
                <span className="text-muted-foreground font-normal">
                  {" "}
                  (~${fmtUsd(perPersonUsd)} USD)
                </span>
              )}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
