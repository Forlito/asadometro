"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

const CORTES = [
  "Vacío", "Asado de tira", "Entraña", "Colita de cuadril",
  "Matambre", "Bife de chorizo", "Ojo de bife",
];

const ACHURAS = [
  "Chinchulín", "Molleja", "Riñón", "Provoleta", "Morcilla", "Chorizo",
];

export function MeatSelector({
  label,
  type,
  value,
  onChange,
}: {
  label: string;
  type: "corte" | "achura";
  value: string;
  onChange: (value: string) => void;
}) {
  const options = type === "corte" ? CORTES : ACHURAS;
  const [showCustom, setShowCustom] = useState(
    value !== "" && !options.includes(value)
  );

  return (
    <div>
      <p className="text-sm font-medium mb-2">{label}</p>
      <div className="flex flex-wrap gap-2 mb-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setShowCustom(false);
              onChange(value === option ? "" : option);
            }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              value === option
                ? "bg-primary text-white border-primary"
                : "bg-card border-border text-foreground hover:border-primary/50"
            }`}
          >
            {option}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setShowCustom(true);
            if (options.includes(value)) onChange("");
          }}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            showCustom
              ? "bg-primary text-white border-primary"
              : "bg-card border-border text-foreground hover:border-primary/50"
          }`}
        >
          Otro...
        </button>
      </div>
      {showCustom && (
        <Input
          placeholder={type === "corte" ? "Ej: Tira de asado" : "Ej: Sweetbreads"}
          value={options.includes(value) ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2"
        />
      )}
    </div>
  );
}
