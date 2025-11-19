import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, DollarSign } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ProfitabilityCardProps {
  montoTotal: number;
  montoAdelantado: number;
  totalGastado: number;
  estado: string;
}

const ProfitabilityCard = ({ 
  montoTotal, 
  montoAdelantado, 
  totalGastado,
  estado
}: ProfitabilityCardProps) => {
  const porCobrar = montoTotal - montoAdelantado;
  const gananciaNeta = montoTotal - totalGastado; // Ganancia final
  const gananciaParcial = montoAdelantado - totalGastado; // Ganancia actual con adelanto
  const porcentajeGastado = montoTotal > 0 
    ? (totalGastado / montoTotal) * 100 
    : 0;
  const porcentajeCobrado = montoTotal > 0 
    ? (montoAdelantado / montoTotal) * 100 
    : 0;

  const isNotCompleted = estado !== "TERMINADO";

  const chartData = [
    { name: "Adelantado", value: montoAdelantado, color: "#10b981" },
    { name: "Por Cobrar", value: Math.max(0, porCobrar), color: "#6366f1" }
  ];

  return (
    <Card className="bg-gradient-to-br from-secondary to-dark-surface border-border shadow-2xl">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-white font-bold text-xl">Rentabilidad del Proyecto</h2>
        </div>

        {isNotCompleted && (
          <div className="mb-6 bg-dark-bg/50 rounded-xl p-4 border border-border">
            <h3 className="text-white font-semibold mb-4 text-center">Estado de Avance</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `$${value.toLocaleString("es-CL")}`}
                      contentStyle={{ 
                        backgroundColor: "#1a1a1a", 
                        border: "1px solid #333",
                        borderRadius: "8px"
                      }}
                      labelStyle={{ color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
                    <p className="text-muted-foreground text-sm">Adelantado</p>
                  </div>
                  <p className="text-white text-xl font-bold ml-5">
                    ${montoAdelantado.toLocaleString("es-CL")}
                  </p>
                  <p className="text-muted-foreground text-xs ml-5">
                    {porcentajeCobrado.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-[#6366f1]"></div>
                    <p className="text-muted-foreground text-sm">Por Cobrar</p>
                  </div>
                  <p className="text-white text-xl font-bold ml-5">
                    ${Math.max(0, porCobrar).toLocaleString("es-CL")}
                  </p>
                  <p className="text-muted-foreground text-xs ml-5">
                    {(100 - porcentajeCobrado).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-muted-foreground text-sm mb-1">Valor Total</p>
            <p className="text-white text-2xl font-bold">
              ${montoTotal.toLocaleString("es-CL")}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm mb-1">Adelantado</p>
            <p className="text-white text-2xl font-bold">
              ${montoAdelantado.toLocaleString("es-CL")}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm mb-1">Gastado</p>
            <p className="text-white text-2xl font-bold">
              ${totalGastado.toLocaleString("es-CL")}
            </p>
          </div>
        </div>

        <div className="bg-dark-bg/50 rounded-xl p-4 border border-primary/30 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <p className="text-muted-foreground text-sm">GANANCIA NETA FINAL</p>
                <p className={`text-4xl font-black ${
                  gananciaNeta >= 0 ? "text-primary" : "text-destructive"
                }`}>
                  ${gananciaNeta.toLocaleString("es-CL")}
                </p>
                {montoTotal > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {((gananciaNeta / montoTotal) * 100).toFixed(1)}% de rentabilidad
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {isNotCompleted && (
          <div className="bg-dark-bg/30 rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground text-sm">Ganancia Parcial (con adelanto)</p>
                <p className={`text-2xl font-bold ${
                  gananciaParcial >= 0 ? "text-green-500" : "text-destructive"
                }`}>
                  ${gananciaParcial.toLocaleString("es-CL")}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfitabilityCard;
