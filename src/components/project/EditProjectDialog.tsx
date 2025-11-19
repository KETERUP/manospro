import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";

const projectSchema = z.object({
  nombreObra: z.string()
    .trim()
    .min(1, "El nombre de la obra es requerido")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  descripcion: z.string()
    .trim()
    .max(500, "La descripción no puede exceder 500 caracteres")
    .optional(),
  montoTotal: z.number()
    .positive("El monto total debe ser mayor a 0")
    .min(0.01, "El monto total es requerido"),
  montoAdelantado: z.number()
    .min(0, "El adelanto no puede ser negativo")
    .optional()
    .default(0),
}).refine(data => data.montoAdelantado <= data.montoTotal, {
  message: "El adelanto no puede ser mayor al monto total",
  path: ["montoAdelantado"],
});

interface Client {
  id: string;
  nombre: string;
}

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  currentData: {
    nombre_obra: string;
    descripcion?: string | null;
    cliente_id?: string | null;
    monto_total: number;
    monto_adelantado: number;
  };
  onUpdate: () => void;
}

const EditProjectDialog = ({ open, onOpenChange, projectId, currentData, onUpdate }: EditProjectDialogProps) => {
  const [nombreObra, setNombreObra] = useState(currentData.nombre_obra);
  const [descripcion, setDescripcion] = useState(currentData.descripcion || "");
  const [clienteId, setClienteId] = useState(currentData.cliente_id || "");
  const [montoTotal, setMontoTotal] = useState(currentData.monto_total.toString());
  const [montoAdelantado, setMontoAdelantado] = useState(currentData.monto_adelantado.toString());
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchClients();
      // Reset form with current data
      setNombreObra(currentData.nombre_obra);
      setDescripcion(currentData.descripcion || "");
      setClienteId(currentData.cliente_id || "");
      setMontoTotal(currentData.monto_total.toString());
      setMontoAdelantado(currentData.monto_adelantado.toString());
    }
  }, [open, currentData]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nombre")
        .order("nombre");

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationResult = projectSchema.safeParse({
      nombreObra,
      descripcion: descripcion || undefined,
      montoTotal: parseFloat(montoTotal),
      montoAdelantado: parseFloat(montoAdelantado || "0"),
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("obras")
        .update({
          nombre_obra: validationResult.data.nombreObra,
          descripcion: validationResult.data.descripcion || null,
          cliente_id: clienteId || null,
          monto_total: validationResult.data.montoTotal,
          monto_adelantado: validationResult.data.montoAdelantado,
        })
        .eq("id", projectId);

      if (error) throw error;

      toast.success("Proyecto actualizado exitosamente");
      onOpenChange(false);
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar el proyecto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Proyecto</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombreObra">Nombre de la Obra *</Label>
            <Input
              id="nombreObra"
              placeholder="Ej: Remodelación Casa Pérez"
              value={nombreObra}
              onChange={(e) => setNombreObra(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cliente">Cliente</Label>
            <Select value={clienteId} onValueChange={setClienteId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin cliente</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Indicaciones del Cliente</Label>
            <Input
              id="descripcion"
              placeholder="Detalles del proyecto, requerimientos específicos..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="montoTotal">Valor Total del Proyecto *</Label>
            <Input
              id="montoTotal"
              type="number"
              step="0.01"
              min="0"
              placeholder="1000000"
              value={montoTotal}
              onChange={(e) => setMontoTotal(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="montoAdelantado">Adelanto (Ya Pagado)</Label>
            <Input
              id="montoAdelantado"
              type="number"
              step="0.01"
              min="0"
              placeholder="200000"
              value={montoAdelantado}
              onChange={(e) => setMontoAdelantado(e.target.value)}
            />
          </div>

          {montoTotal && parseFloat(montoTotal) > 0 && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium text-foreground">
                Por Cobrar: ${(parseFloat(montoTotal) - parseFloat(montoAdelantado || "0")).toLocaleString("es-CL")}
              </p>
            </div>
          )}

          <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/30">
            <p className="text-xs text-yellow-600 dark:text-yellow-500">
              Nota: Los gastos y ganancia neta se calculan automáticamente según los gastos registrados.
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Actualizando...
              </>
            ) : (
              "Actualizar Proyecto"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectDialog;