"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import Link from "next/link";
import "react-day-picker/style.css";

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  attended: boolean;
  attendeeCount: number;
};

export function AsadoCalendar({
  events,
  groupId,
}: {
  events: CalendarEvent[];
  groupId: string;
}) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const eventDates = events.reduce(
    (acc: Record<string, CalendarEvent[]>, e) => {
      const key = e.date;
      if (!acc[key]) acc[key] = [];
      acc[key].push(e);
      return acc;
    },
    {}
  );

  const attendedDates = events
    .filter((e) => e.attended)
    .map((e) => new Date(e.date + "T12:00:00"));

  const missedDates = events
    .filter((e) => !e.attended)
    .map((e) => new Date(e.date + "T12:00:00"));

  const selectedDateStr = selectedDate?.toISOString().split("T")[0];
  const eventsForDate = selectedDateStr ? eventDates[selectedDateStr] ?? [] : [];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 flex justify-center">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{
              attended: attendedDates,
              missed: missedDates,
            }}
            modifiersClassNames={{
              attended: "bg-green-100 text-green-800 font-bold rounded-full",
              missed: "bg-orange-100 text-orange-800 font-bold rounded-full",
            }}
          />
        </CardContent>
      </Card>

      <div className="flex items-center gap-4 justify-center text-sm">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-green-400" />
          <span className="text-muted-foreground">Fuiste</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-orange-400" />
          <span className="text-muted-foreground">Te lo perdiste</span>
        </div>
      </div>

      {eventsForDate.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            {selectedDate?.toLocaleDateString("es-AR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          {eventsForDate.map((event) => (
            <Link
              key={event.id}
              href={`/groups/${groupId}/events/${event.id}`}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center gap-3 p-3">
                  <Icon name="local_fire_department" className="text-primary shrink-0" size="md" />
                  <span className="font-medium flex-1 truncate">{event.title}</span>
                  <div className="flex items-center gap-1">
                    <Icon name="groups" className="text-muted-foreground" size="sm" />
                    <span className="text-sm text-muted-foreground">
                      {event.attendeeCount}
                    </span>
                  </div>
                  {event.attended ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 rounded-full text-xs">
                      Fui
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="rounded-full text-xs">
                      No fui
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
