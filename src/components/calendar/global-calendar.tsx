"use client";

import { useState, useMemo } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { Card, CardContent } from "@/components/ui/card";
import { Flame } from "lucide-react";
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

  // Dates that have events (for modifiers)
  const eventDates = useMemo(
    () => Object.keys(eventsByDate).map((d) => new Date(d + "T12:00:00")),
    [eventsByDate]
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 flex justify-center">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{ hasEvent: eventDates }}
            modifiersStyles={{
              hasEvent: {
                fontWeight: "bold",
                textDecoration: "underline",
                textDecorationColor: "var(--color-primary, #e67e22)",
                textUnderlineOffset: "4px",
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
                      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Flame className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {event.groupName}
                          {event.asadorName ? ` · ${event.asadorName}` : ""}
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
