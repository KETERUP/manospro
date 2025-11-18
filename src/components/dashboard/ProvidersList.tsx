import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Proveedor {
  id: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  cif: string | null;
  direccion: string | null;
  tipo_material: string | null;
}

interface ProvidersListProps {
  searchQuery: string;
}

const ProvidersList = ({ searchQuery }: ProvidersListProps) => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    try {
      const { data, error } = await supabase
        .from("proveedores")
        .select("*")
        .order("nombre", { ascending: true });

      if (error) throw error;
      setProveedores(data || []);
    } catch (error) {
      console.error("Error fetching proveedores:", error);
      toast.error("Error al cargar proveedores");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("proveedores")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Proveedor eliminado");
      fetchProveedores();
    } catch (error) {
      console.error("Error deleting proveedor:", error);
      toast.error("Error al eliminar proveedor");
    }
    setDeleteId(null);
  };

  const filteredProveedores = proveedores.filter((proveedor) =>
    proveedor.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    proveedor.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    proveedor.cif?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    proveedor.tipo_material?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse bg-card border-border">
            <CardContent className="p-6">
              <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredProveedores.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">
            {searchQuery
              ? "No se encontraron proveedores con ese criterio de búsqueda"
              : "No hay proveedores registrados"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProveedores.map((proveedor) => (
          <Card
            key={proveedor.id}
            className="hover:shadow-lg transition-all duration-200 bg-card border-border hover:border-primary/50"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-foreground mb-1">
                    {proveedor.nombre}
                  </h3>
                  {proveedor.cif && (
                    <p className="text-sm text-muted-foreground">
                      CIF: {proveedor.cif}
                    </p>
                  )}
                  {proveedor.tipo_material && (
                    <p className="text-sm text-primary mt-1">
                      {proveedor.tipo_material}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteId(proveedor.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {proveedor.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{proveedor.email}</span>
                  </div>
                )}
                {proveedor.telefono && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{proveedor.telefono}</span>
                  </div>
                )}
                {proveedor.direccion && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{proveedor.direccion}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar proveedor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el
              proveedor del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProvidersList;
