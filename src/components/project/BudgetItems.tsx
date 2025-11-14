import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BudgetItem {
  id: string;
  descripcion: string;
  precio: number;
}

interface BudgetItemsProps {
  projectId: string;
}

const BudgetItems = ({ projectId }: BudgetItemsProps) => {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, [projectId]);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("items_presupuesto")
        .select("*")
        .eq("obra_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching budget items:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <FileText className="h-5 w-5 text-primary" />
            Detalle del Presupuesto
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="text-primary border-primary hover:bg-primary hover:text-white"
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground text-center py-4">Cargando...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">
              No hay ítems en el presupuesto
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <span className="text-foreground font-medium">{item.descripcion}</span>
                <Badge variant="secondary" className="text-base font-bold">
                  ${item.precio.toLocaleString("es-CL")}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetItems;
