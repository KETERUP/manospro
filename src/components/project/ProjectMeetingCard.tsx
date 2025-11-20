import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin, Clock, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ProjectMeetingCardProps {
  projectId: string;
  projectName: string;
  clientId: string | null;
}

interface MeetingData {
  id: string;
  fecha_inicio: string;
  descripcion: string | null;
}

const ProjectMeetingCard = ({ projectId, projectName, clientId }: ProjectMeetingCardProps) => {
  const [meeting, setMeeting] = useState<MeetingData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fecha: "",
    hora: "",
    lugar: "",
  });

  useEffect(() => {
    fetchMeeting();
  }, [projectId]);

  const fetchMeeting = async () => {
    try {
      const { data, error } = await supabase
        .from("agenda_eventos")
        .select("id, fecha_inicio, descripcion")
        .eq("proyecto_id", projectId)
        .eq("tipo_evento", "REUNION")
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setMeeting(data);
        const fechaObj = new Date(data.fecha_inicio);
        setFormData({
          fecha: format(fechaObj, "yyyy-MM-dd"),
          hora: format(fechaObj, "HH:mm"),
          lugar: data.descripcion || "",
        });
      } else {
        setIsEditing(true);
      }
    } catch (error) {
      console.error("Error fetching meeting:", error);
    }
  };

  const handleSave = async () => {
    if (!formData.fecha || !formData.hora) {
      toast.error("Fecha y hora son requeridos");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { data: profile } = await supabase
        .from("profiles")
        .select("empresa_id")
        .eq("id", user.id)
        .single();

      if (!profile?.empresa_id) throw new Error("Empresa no encontrada");

      const fechaInicio = `${formData.fecha}T${formData.hora}:00`;

      if (meeting) {
        // Actualizar
        const { error } = await supabase
          .from("agenda_eventos")
          .update({
            fecha_inicio: fechaInicio,
            descripcion: formData.lugar,
            updated_at: new Date().toISOString(),
          })
          .eq("id", meeting.id);

        if (error) throw error;
        toast.success("Reunión actualizada exitosamente");
      } else {
        // Crear
        const { error } = await supabase
          .from("agenda_eventos")
          .insert({
            titulo: `Reunión con Cliente - ${projectName}`,
            descripcion: formData.lugar,
            fecha_inicio: fechaInicio,
            tipo_evento: "REUNION",
            proyecto_id: projectId,
            cliente_id: clientId,
            empresa_id: profile.empresa_id,
            user_id: user.id,
          });

        if (error) throw error;
        toast.success("Reunión creada exitosamente");
      }

      await fetchMeeting();
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving meeting:", error);
      toast.error("Error al guardar la reunión");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (meeting) {
      const fechaObj = new Date(meeting.fecha_inicio);
      setFormData({
        fecha: format(fechaObj, "yyyy-MM-dd"),
        hora: format(fechaObj, "HH:mm"),
        lugar: meeting.descripcion || "",
      });
      setIsEditing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Reunión con Cliente
        </CardTitle>
        {meeting && !isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="gap-2"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hora">Hora</Label>
                <Input
                  id="hora"
                  type="time"
                  value={formData.hora}
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lugar">Lugar</Label>
              <Input
                id="lugar"
                type="text"
                placeholder="Ej: Oficina central, Obra, etc."
                value={formData.lugar}
                onChange={(e) => setFormData({ ...formData, lugar: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={loading} className="flex-1">
                {loading ? "Guardando..." : meeting ? "Actualizar" : "Crear Reunión"}
              </Button>
              {meeting && (
                <Button variant="outline" onClick={handleCancel} disabled={loading}>
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        ) : meeting ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-foreground">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(meeting.fecha_inicio), "PPP", { locale: es })}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(meeting.fecha_inicio), "HH:mm")} hrs</span>
            </div>
            {meeting.descripcion && (
              <div className="flex items-center gap-2 text-foreground">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{meeting.descripcion}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">No hay reunión programada</p>
            <Button onClick={() => setIsEditing(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Programar Reunión
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectMeetingCard;
