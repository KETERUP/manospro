import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Receipt, Image as ImageIcon } from "lucide-react";

interface Expense {
  id: string;
  descripcion: string;
  monto: number;
  foto_boleta: string | null;
  proveedor: {
    nombre: string;
  } | null;
}

interface ExpensesListProps {
  projectId: string;
}

const ExpensesList = ({ projectId }: ExpensesListProps) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, [projectId]);

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from("gastos")
        .select(`
          *,
          proveedor:proveedores(nombre)
        `)
        .eq("obra_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Receipt className="h-5 w-5 text-primary" />
          Gastos Registrados
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground text-center py-4">Cargando...</p>
        ) : expenses.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">
              No hay gastos registrados
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-start justify-between p-4 bg-muted rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">
                    {expense.descripcion}
                  </h4>
                  {expense.proveedor && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {expense.proveedor.nombre}
                    </p>
                  )}
                  <Badge className="bg-destructive/20 text-destructive border-destructive/30 font-bold">
                    -${expense.monto.toLocaleString("es-CL")}
                  </Badge>
                </div>
                {expense.foto_boleta && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2 flex-shrink-0"
                    onClick={() => window.open(expense.foto_boleta!, "_blank")}
                  >
                    <ImageIcon className="h-5 w-5 text-primary" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpensesList;
