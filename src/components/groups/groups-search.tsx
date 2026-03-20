"use client";

import { useState } from "react";
import { GroupCard } from "./group-card";
import { Icon } from "@/components/ui/icon";

type GroupData = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  memberCount: number;
  photo_url?: string | null;
};

export function GroupsSearch({ groups }: { groups: GroupData[] }) {
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const filtered = query
    ? groups.filter(
        (g) =>
          g.name.toLowerCase().includes(query.toLowerCase()) ||
          g.description?.toLowerCase().includes(query.toLowerCase())
      )
    : groups;

  return (
    <>
      {showSearch && (
        <div className="mb-4 flex items-center gap-2 bg-card dark:bg-zinc-900 rounded-xl border border-primary/5 px-3 py-2">
          <Icon name="search" className="text-muted-foreground" size="sm" />
          <input
            type="text"
            placeholder="Buscar grupo..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <Icon name="close" className="text-muted-foreground" size="sm" />
            </button>
          )}
          <button onClick={() => { setShowSearch(false); setQuery(""); }}>
            <span className="text-xs text-primary font-medium">Cerrar</span>
          </button>
        </div>
      )}

      {!showSearch && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowSearch(true)}
            className="p-2 text-foreground"
          >
            <Icon name="search" />
          </button>
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((group) => (
          <GroupCard
            key={group.id}
            id={group.id}
            name={group.name}
            description={group.description}
            color={group.color ?? "#d46211"}
            memberCount={group.memberCount}
            photoUrl={group.photo_url}
          />
        ))}
        {filtered.length === 0 && query && (
          <p className="text-center text-sm text-muted-foreground py-8">
            No se encontraron grupos
          </p>
        )}
      </div>
    </>
  );
}
