import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Info } from "lucide-react";

interface ProjectInfoProps {
  cliente: string;
  estado: string;
  fechaVisita: string | null;
  projectId: string;
  onUpdate: () => void;
}

const ProjectInfo = ({ cliente, estado, fechaVisita, projectId, onUpdate }: ProjectInfoProps) => {
  const [updating, setUpdating] = useState(false);

  const handleEstadoChange = async (newEstado: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("obras")
        .update({ estado: newEstado as "Pendiente" | "Aprobado" | "Terminado" | "Rechazado" })
        .eq("id", projectId);

      if (error) throw error;

      toast.success("Estado actualizado");
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar el estado");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card className="bg-white border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Info className="h-5 w-5 text-primary" />
          Información General
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-muted-foreground">Cliente</Label>
          <p className="text-foreground font-semibold">{cliente}</p>
        </div>

        <div>
          <Label className="text-muted-foreground mb-2 block">Estado</Label>
          <Select value={estado} onValueChange={handleEstadoChange} disabled={updating}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pendiente">Pendiente</SelectItem>
              <SelectItem value="Aprobado">Aprobado</SelectItem>
              <SelectItem value="Terminado">Terminado</SelectItem>
              <SelectItem value="Rechazado">Rechazado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {fechaVisita && (
          <div>
            <Label className="text-muted-foreground">Fecha de Visita</Label>
            <p className="text-foreground font-semibold">
              {new Date(fechaVisita).toLocaleDateString("es-CL")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectInfo;
