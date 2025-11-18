import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Calendar as CalendarIcon } from "lucide-react";
import { es } from "date-fns/locale";
import { toast } from "sonner";

// Datos de ejemplo de reuniones para noviembre 2025
const meetingsData = [
  {
    date: new Date(2025, 10, 5), // 5 de noviembre
    time: "10:00",
    client: "Juan Pérez",
    location: "Av. Providencia 1234",
  },
  {
    date: new Date(2025, 10, 12), // 12 de noviembre
    time: "14:30",
    client: "María González",
    location: "Las Condes, Santiago",
  },
  {
    date: new Date(2025, 10, 20), // 20 de noviembre
    time: "09:00",
    client: "Pedro Rodríguez",
    location: "Vitacura 5678",
  },
];

const HeaderCalendar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(2025, 10, 1));

  const getDatesWithMeetings = () => {
    return meetingsData.map((meeting) => meeting.date);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const meeting = meetingsData.find(
        (m) => m.date.toDateString() === date.toDateString()
      );
      if (meeting) {
        toast.info(
          `Reunión con ${meeting.client}`,
          {
            description: `Hora: ${meeting.time} - Lugar: ${meeting.location}`,
            duration: 5000,
          }
        );
      }
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2"
      >
        <CalendarIcon className="h-5 w-5" />
        <span className="font-medium">Calendario</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {isExpanded && (
        <Card className="absolute top-full right-0 mt-2 z-50 bg-card border-border shadow-lg">
          <div className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              locale={es}
              defaultMonth={new Date(2025, 10, 1)}
              className="rounded-md"
              modifiers={{
                hasMeeting: getDatesWithMeetings(),
              }}
              modifiersStyles={{
                hasMeeting: {
                  border: "2px solid #ef4444",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                },
              }}
            />
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm font-semibold text-foreground mb-2">
                Próximas Reuniones:
              </p>
              <div className="space-y-2">
                {meetingsData.map((meeting, index) => (
                  <div
                    key={index}
                    className="text-xs text-muted-foreground bg-muted/50 p-2 rounded"
                  >
                    <p className="font-medium text-foreground">
                      {meeting.date.toLocaleDateString("es-CL")} - {meeting.time}
                    </p>
                    <p>{meeting.client}</p>
                    <p className="text-xs">{meeting.location}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default HeaderCalendar;
