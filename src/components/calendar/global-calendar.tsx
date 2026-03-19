"use client";

import { useState, useMemo } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import Link from "next/link";

type CalendarEvent = {
  id: string;
  groupId: string;
  title: string;
  date: string;
  groupName: string;
  groupColor: string;
  asadorName: string;
};

type LegendItem = {
  name: string;
  color: string;
};

export function GlobalCalendar({
  events,
  legend,
}: {
  events: CalendarEvent[];
  legend: LegendItem[];
}) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Build a map of date string -> events
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const event of events) {
      if (!map[event.date]) map[event.date] = [];
      map[event.date].push(event);
    }
    return map;
  }, [events]);

  // Get events for the selected date
  const selectedDateStr = selectedDate
    ? selectedDate.toISOString().split("T")[0]
    : null;
  const selectedEvents = selectedDateStr ? eventsByDate[selectedDateStr] ?? [] : [];

  // Build a map of date string -> unique group colors for that date
  const colorsByDate = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const [dateStr, evts] of Object.entries(eventsByDate)) {
      const uniqueColors: string[] = [];
      const seen = new Set<string>();
      for (const e of evts) {
        if (!seen.has(e.groupColor)) {
          seen.add(e.groupColor);
          uniqueColors.push(e.groupColor);
        }
      }
      map[dateStr] = uniqueColors;
    }
    return map;
  }, [eventsByDate]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 flex justify-center">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            components={{
              DayButton: ({ day, ...props }) => {
                const dateStr = day.date.toISOString().split("T")[0];
                const colors = colorsByDate[dateStr];

                if (!colors || colors.length === 0) {
                  return <button {...props} />;
                }

                // Build background style
                let bg: string;
                if (colors.length === 1) {
                  bg = colors[0];
                } else {
                  // Split circle: left color + right color
                  bg = `linear-gradient(90deg, ${colors[0]} 50%, ${colors[1]} 50%)`;
                }

                return (
                  <button
                    {...props}
                    style={{
                      ...props.style,
                      background: bg,
                      color: "white",
                      borderRadius: "9999px",
                      fontWeight: "bold",
                    }}
                  />
                );
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Legend */}
      {legend.length > 0 && (
        <div className="flex flex-wrap gap-3 px-1">
          {legend.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-muted-foreground">{item.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Selected date events */}
      {selectedDateStr && (
        <section>
          <h3 className="text-sm font-bold mb-2 capitalize">
            {selectedDate!.toLocaleDateString("es-AR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h3>

          {selectedEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No hay asados este dia
            </p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/groups/${event.groupId}/events/${event.id}`}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="flex items-center gap-3 p-4">
                      <div
                        className="w-1 h-10 rounded-full shrink-0"
                        style={{ backgroundColor: event.groupColor }}
                      />
                      <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon name="local_fire_department" className="text-primary" size="sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {event.groupName}
                          {event.asadorName ? ` \u00b7 ${event.asadorName}` : ""}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
