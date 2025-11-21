import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";

const clientSchema = z.object({
  nombre: z.string()
    .trim()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  telefono: z.string()
    .trim()
    .max(20, "El teléfono no puede exceder 20 caracteres")
    .optional(),
  email: z.string()
    .trim()
    .email("Formato de email inválido")
    .max(255, "El email no puede exceder 255 caracteres")
    .optional()
    .or(z.literal("")),
  nif_cif: z.string()
    .trim()
    .max(50, "El NIF/CIF no puede exceder 50 caracteres")
    .optional(),
  direccion: z.string()
    .trim()
    .max(500, "La dirección no puede exceder 500 caracteres")
    .optional(),
});

interface Cliente {
  id: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  nif_cif: string | null;
  direccion: string | null;
}

interface EditClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  cliente: Cliente | null;
}

const EditClientDialog = ({ open, onOpenChange, onSuccess, cliente }: EditClientDialogProps) => {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [nifCif, setNifCif] = useState("");
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cliente) {
      setNombre(cliente.nombre);
      setTelefono(cliente.telefono || "");
      setEmail(cliente.email || "");
      setNifCif(cliente.nif_cif || "");
      setDireccion(cliente.direccion || "");
    }
  }, [cliente]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cliente) return;

    const validationResult = clientSchema.safeParse({
      nombre,
      telefono: telefono || undefined,
      email: email || undefined,
      nif_cif: nifCif || undefined,
      direccion: direccion || undefined,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("clientes")
        .update({
          nombre: validationResult.data.nombre,
          telefono: validationResult.data.telefono || null,
          email: validationResult.data.email || null,
          nif_cif: validationResult.data.nif_cif || null,
          direccion: validationResult.data.direccion || null,
        })
        .eq("id", cliente.id);

      if (error) throw error;

      toast.success("Cliente actualizado exitosamente");
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar el cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              placeholder="Juan Pérez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nif_cif">NIF/CIF</Label>
            <Input
              id="nif_cif"
              placeholder="12345678-9"
              value={nifCif}
              onChange={(e) => setNifCif(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              type="tel"
              placeholder="+56 9 1234 5678"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="cliente@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Textarea
              id="direccion"
              placeholder="Calle Vitacura 321, Vitacura"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditClientDialog;
