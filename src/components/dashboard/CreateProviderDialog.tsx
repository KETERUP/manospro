import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CreateProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CreateProviderDialog = ({ open, onOpenChange, onSuccess }: CreateProviderDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [cif, setCif] = useState("");
  const [direccion, setDireccion] = useState("");
  const [tipoMaterial, setTipoMaterial] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("proveedores")
        .insert({
          nombre: nombre.trim(),
          telefono: telefono.trim() || null,
          email: email.trim() || null,
          cif: cif.trim() || null,
          direccion: direccion.trim() || null,
          tipo_material: tipoMaterial.trim() || null,
        });

      if (error) throw error;

      toast.success("Proveedor creado exitosamente");
      setNombre("");
      setTelefono("");
      setEmail("");
      setCif("");
      setDireccion("");
      setTipoMaterial("");
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating proveedor:", error);
      toast.error("Error al crear proveedor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nuevo Proveedor</DialogTitle>
          <DialogDescription>
            Ingrese los datos del nuevo proveedor
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del proveedor"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cif">CIF</Label>
            <Input
              id="cif"
              value={cif}
              onChange={(e) => setCif(e.target.value)}
              placeholder="12345678A"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo_material">Tipo de Material</Label>
            <Input
              id="tipo_material"
              value={tipoMaterial}
              onChange={(e) => setTipoMaterial(e.target.value)}
              placeholder="Ej: Eléctrico, Fontanería, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+56 9 1234 5678"
              type="tel"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="proveedor@example.com"
              type="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Dirección completa"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear Proveedor"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProviderDialog;
