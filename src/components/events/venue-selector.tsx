"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

type Member = {
  user_id: string;
  profiles: { id: string; display_name: string; avatar_url: string | null };
};

export function VenueSelector({
  members,
  value,
  onChange,
}: {
  members: Member[];
  value: string;
  onChange: (value: string) => void;
}) {
  // Detect if existing value matches "Casa de [member]"
  const matchingMember = members.find(
    (m) => value === `Casa de ${m.profiles.display_name}`
  );

  const [mode, setMode] = useState<"member" | "custom">(
    matchingMember ? "member" : value ? "custom" : "member"
  );
  const [selectedMemberId, setSelectedMemberId] = useState(
    matchingMember?.profiles.id ?? ""
  );
  const [customValue, setCustomValue] = useState(
    matchingMember ? "" : value
  );

  useEffect(() => {
    if (mode === "member" && selectedMemberId) {
      const member = members.find((m) => m.profiles.id === selectedMemberId);
      if (member) onChange(`Casa de ${member.profiles.display_name}`);
    }
  }, [selectedMemberId, mode, members, onChange]);

  return (
    <div>
      <label className="text-sm font-medium mb-1.5 block">Sede</label>
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => {
            setMode("member");
            if (selectedMemberId) {
              const member = members.find((m) => m.profiles.id === selectedMemberId);
              if (member) onChange(`Casa de ${member.profiles.display_name}`);
            } else {
              onChange("");
            }
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            mode === "member"
              ? "bg-primary text-white border-primary"
              : "bg-card border-border text-foreground"
          }`}
        >
          Casa de...
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("custom");
            onChange(customValue);
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            mode === "custom"
              ? "bg-primary text-white border-primary"
              : "bg-card border-border text-foreground"
          }`}
        >
          Otro lugar
        </button>
      </div>

      {mode === "member" ? (
        <select
          value={selectedMemberId}
          onChange={(e) => setSelectedMemberId(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Seleccionar miembro...</option>
          {members.map((m) => (
            <option key={m.profiles.id} value={m.profiles.id}>
              {m.profiles.display_name}
            </option>
          ))}
        </select>
      ) : (
        <Input
          placeholder="Donde se hace?"
          value={customValue}
          onChange={(e) => {
            setCustomValue(e.target.value);
            onChange(e.target.value);
          }}
        />
      )}
    </div>
  );
}
