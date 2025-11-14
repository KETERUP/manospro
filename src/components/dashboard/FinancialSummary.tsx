import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

interface FinancialData {
  ingresosReales: number;
  ingresosPorIngresar: number;
  gastosEfectuados: number;
  gastosPorVenir: number;
}

const FinancialSummary = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>("2024-11");
  const [financialData, setFinancialData] = useState<FinancialData>({
    ingresosReales: 0,
    ingresosPorIngresar: 0,
    gastosEfectuados: 0,
    gastosPorVenir: 0,
  });

  useEffect(() => {
    fetchFinancialData();
  }, [selectedMonth]);

  const fetchFinancialData = async () => {
    try {
      const [year, month] = selectedMonth.split("-");
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);

      // Fetch projects for the selected month
      const { data: projects, error } = await supabase
        .from("obras")
        .select(`
          id,
          estado,
          total_presupuestado,
          total_gastado,
          created_at
        `)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (error) throw error;

      let ingresosReales = 0;
      let ingresosPorIngresar = 0;
      let gastosEfectuados = 0;
      let gastosPorVenir = 0;

      projects?.forEach((project) => {
        gastosEfectuados += project.total_gastado;
        
        if (project.estado === "Terminado") {
          ingresosReales += project.total_presupuestado;
        } else {
          ingresosReales += project.total_gastado;
          ingresosPorIngresar += project.total_presupuestado - project.total_gastado;
        }

        if (project.estado !== "Terminado") {
          gastosPorVenir += project.total_presupuestado - project.total_gastado;
        }
      });

      setFinancialData({
        ingresosReales,
        ingresosPorIngresar,
        gastosEfectuados,
        gastosPorVenir,
      });
    } catch (error) {
      console.error("Error fetching financial data:", error);
    }
  };

  const ingresosChartData = [
    { name: "Ingresos Reales", value: financialData.ingresosReales, color: "#10b981" },
    { name: "Por Ingresar", value: financialData.ingresosPorIngresar, color: "#6366f1" },
  ];

  const gastosChartData = [
    { name: "Gastos Efectuados", value: financialData.gastosEfectuados, color: "#ef4444" },
    { name: "Gastos Por Venir", value: financialData.gastosPorVenir, color: "#f97316" },
  ];

  const totalIngresos = financialData.ingresosReales + financialData.ingresosPorIngresar;
  const totalGastos = financialData.gastosEfectuados + financialData.gastosPorVenir;
  const balanceNeto = totalIngresos - totalGastos;

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-foreground font-semibold">Seleccionar Mes</h3>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48 bg-background border-border">
                <SelectValue placeholder="Seleccionar mes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-11">Noviembre 2024</SelectItem>
                <SelectItem value="2024-12">Diciembre 2024</SelectItem>
                <SelectItem value="2025-01">Enero 2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Balance Summary */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="h-8 w-8 text-primary" />
            <h2 className="text-foreground font-bold text-2xl">Balance Neto Mensual</h2>
          </div>
          <p className={`text-5xl font-black ${balanceNeto >= 0 ? "text-primary" : "text-destructive"}`}>
            ${balanceNeto.toLocaleString("es-CL")}
          </p>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Ingresos Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="h-5 w-5 text-primary" />
              Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={ingresosChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ingresosChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `$${value.toLocaleString("es-CL")}`}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
                  <span className="text-sm text-muted-foreground">Ingresos Reales</span>
                </div>
                <span className="font-semibold text-foreground">
                  ${financialData.ingresosReales.toLocaleString("es-CL")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#6366f1]"></div>
                  <span className="text-sm text-muted-foreground">Por Ingresar</span>
                </div>
                <span className="font-semibold text-foreground">
                  ${financialData.ingresosPorIngresar.toLocaleString("es-CL")}
                </span>
              </div>
              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Total Ingresos</span>
                  <span className="font-bold text-lg text-primary">
                    ${totalIngresos.toLocaleString("es-CL")}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gastos Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingDown className="h-5 w-5 text-destructive" />
              Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={gastosChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {gastosChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `$${value.toLocaleString("es-CL")}`}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                  <span className="text-sm text-muted-foreground">Gastos Efectuados</span>
                </div>
                <span className="font-semibold text-foreground">
                  ${financialData.gastosEfectuados.toLocaleString("es-CL")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#f97316]"></div>
                  <span className="text-sm text-muted-foreground">Gastos Por Venir</span>
                </div>
                <span className="font-semibold text-foreground">
                  ${financialData.gastosPorVenir.toLocaleString("es-CL")}
                </span>
              </div>
              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Total Gastos</span>
                  <span className="font-bold text-lg text-destructive">
                    ${totalGastos.toLocaleString("es-CL")}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialSummary;
