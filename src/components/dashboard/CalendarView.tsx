import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

interface Event {
  id: string;
  nombre_obra: string;
  fecha_visita: string;
}

const CalendarView = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState<Event[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      filterEventsForDate(selectedDate);
    }
  }, [selectedDate, events]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("obras")
        .select("id, nombre_obra, fecha_visita")
        .eq("estado", "APROBADO")
        .not("fecha_visita", "is", null)
        .order("fecha_visita", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const filterEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    const filtered = events.filter(
      (event) => event.fecha_visita?.split("T")[0] === dateString
    );
    setEventsForSelectedDate(filtered);
  };

  const getDatesWithEvents = () => {
    return events.map((event) => new Date(event.fecha_visita));
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white border-border">
        <CardContent className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={es}
            className="rounded-md"
            modifiers={{
              hasEvent: getDatesWithEvents(),
            }}
            modifiersStyles={{
              hasEvent: {
                border: "2px solid #ef4444",
                borderRadius: "6px",
                fontWeight: "bold",
              },
            }}
          />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Eventos para {selectedDate?.toLocaleDateString("es-CL")}
        </h3>

        {eventsForSelectedDate.length === 0 ? (
          <Card className="bg-dark-surface border-border">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                No hay eventos programados para esta fecha
              </p>
            </CardContent>
          </Card>
        ) : (
          eventsForSelectedDate.map((event) => (
            <Card
              key={event.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white border-border hover:border-primary/50"
              onClick={() => navigate(`/project/${event.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-foreground">
                    {event.nombre_obra}
                  </h4>
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    APROBADO
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CalendarView;
