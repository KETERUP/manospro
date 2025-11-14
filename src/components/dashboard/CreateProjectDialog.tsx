import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import CreateClientDialog from "./CreateClientDialog";

interface Client {
  id: string;
  nombre: string;
}

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateProjectDialog = ({ open, onOpenChange }: CreateProjectDialogProps) => {
  const [nombreObra, setNombreObra] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateClient, setShowCreateClient] = useState(false);

  useEffect(() => {
    if (open) {
      fetchClients();
    }
  }, [open]);

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

    if (!nombreObra) {
      toast.error("El nombre de la obra es requerido");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user logged in");

      const { error } = await supabase.from("obras").insert({
        nombre_obra: nombreObra,
        cliente_id: clienteId || null,
        user_id: user.id,
      });

      if (error) throw error;

      toast.success("Proyecto creado exitosamente");
      setNombreObra("");
      setClienteId("");
      onOpenChange(false);
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Error al crear el proyecto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nueva Obra</DialogTitle>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="cliente">Cliente (opcional)</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateClient(true)}
                  className="h-8 text-primary hover:text-primary-hover"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Nuevo
                </Button>
              </div>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Proyecto"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <CreateClientDialog
        open={showCreateClient}
        onOpenChange={setShowCreateClient}
        onSuccess={fetchClients}
      />
    </>
  );
};

export default CreateProjectDialog;
