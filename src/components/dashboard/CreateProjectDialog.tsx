import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Image as ImageIcon } from "lucide-react";
import CreateClientDialog from "./CreateClientDialog";
import { z } from "zod";

const projectSchema = z.object({
  nombreObra: z.string()
    .trim()
    .min(1, "El nombre de la obra es requerido")
    .max(100, "El nombre no puede exceder 100 caracteres"),
});

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
  const [imagenProyecto, setImagenProyecto] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error("Solo se permiten imágenes JPEG, PNG o WebP");
        e.target.value = "";
        return;
      }
      
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error("La imagen no puede exceder 5MB");
        e.target.value = "";
        return;
      }
      
      setImagenProyecto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationResult = projectSchema.safeParse({
      nombreObra,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user logged in");

      let imagenUrl = null;

      // Upload image if provided
      if (imagenProyecto) {
        const fileExt = imagenProyecto.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('proyectos')
          .upload(fileName, imagenProyecto);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('proyectos')
          .getPublicUrl(fileName);

        imagenUrl = publicUrl;
      }

      const { error } = await supabase.from("obras").insert({
        nombre_obra: validationResult.data.nombreObra,
        cliente_id: clienteId || null,
        user_id: user.id,
        imagen_proyecto: imagenUrl,
      });

      if (error) throw error;

      toast.success("Proyecto creado exitosamente");
      setNombreObra("");
      setClienteId("");
      setImagenProyecto(null);
      setImagePreview("");
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

            <div className="space-y-2">
              <Label htmlFor="imagen">Imagen del Proyecto (opcional)</Label>
              <div className="flex flex-col gap-3">
                <Input
                  id="imagen"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                {imagePreview && (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {!imagePreview && (
                  <div className="w-full h-40 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/20">
                    <div className="text-center">
                      <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Vista previa de la imagen</p>
                    </div>
                  </div>
                )}
              </div>
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
