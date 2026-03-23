"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

type Member = {
  user_id: string;
  profiles: { id: string; display_name: string; avatar_url: string | null };
};

export function PersonSelector({
  label,
  placeholder,
  members,
  memberId,
  customName,
  onMemberChange,
  onCustomNameChange,
}: {
  label: string;
  placeholder: string;
  members: Member[];
  memberId: string;
  customName: string;
  onMemberChange: (id: string) => void;
  onCustomNameChange: (name: string) => void;
}) {
  const [mode, setMode] = useState<"member" | "custom">(
    customName ? "custom" : "member"
  );

  return (
    <div>
      <label className="text-sm font-medium mb-1.5 block">{label}</label>
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => {
            setMode("member");
            onCustomNameChange("");
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            mode === "member"
              ? "bg-primary text-white border-primary"
              : "bg-card border-border text-foreground"
          }`}
        >
          Miembro
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("custom");
            onMemberChange("");
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            mode === "custom"
              ? "bg-primary text-white border-primary"
              : "bg-card border-border text-foreground"
          }`}
        >
          Otro
        </button>
      </div>

      {mode === "member" ? (
        <select
          value={memberId}
          onChange={(e) => onMemberChange(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">{placeholder}</option>
          {members.map((m) => (
            <option key={m.profiles.id} value={m.profiles.id}>
              {m.profiles.display_name}
            </option>
          ))}
        </select>
      ) : (
        <Input
          placeholder="Escribir nombre..."
          value={customName}
          onChange={(e) => onCustomNameChange(e.target.value)}
        />
      )}
    </div>
  );
}
