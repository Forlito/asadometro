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
  const isCustom = value !== "" && !options.includes(value);
  const [showCustom, setShowCustom] = useState(isCustom);

  return (
    <div>
      <p className="text-sm font-medium mb-1.5">{label}</p>
      <select
        value={showCustom ? "__other__" : value}
        onChange={(e) => {
          if (e.target.value === "__other__") {
            setShowCustom(true);
            onChange("");
          } else {
            setShowCustom(false);
            onChange(e.target.value);
          }
        }}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <option value="">Seleccionar...</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
        <option value="__other__">Otro...</option>
      </select>
      {showCustom && (
        <Input
          placeholder={type === "corte" ? "Ej: Tira de asado" : "Ej: Sweetbreads"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2"
        />
      )}
    </div>
  );
}
