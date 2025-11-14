import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, DollarSign } from "lucide-react";

interface ProfitabilityCardProps {
  totalPresupuestado: number;
  totalGastado: number;
  gananciaNeta: number;
}

const ProfitabilityCard = ({ 
  totalPresupuestado, 
  totalGastado, 
  gananciaNeta 
}: ProfitabilityCardProps) => {
  return (
    <Card className="bg-gradient-to-br from-secondary to-dark-surface border-border shadow-2xl">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-white font-bold text-xl">Rentabilidad del Proyecto</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-muted-foreground text-sm mb-1">Presupuestado</p>
            <p className="text-white text-2xl font-bold">
              ${totalPresupuestado.toLocaleString("es-CL")}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm mb-1">Gastado</p>
            <p className="text-white text-2xl font-bold">
              ${totalGastado.toLocaleString("es-CL")}
            </p>
          </div>
        </div>

        <div className="bg-dark-bg/50 rounded-xl p-4 border border-primary/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <p className="text-muted-foreground text-sm">GANANCIA NETA</p>
                <p className={`text-4xl font-black ${
                  gananciaNeta >= 0 ? "text-primary" : "text-destructive"
                }`}>
                  ${gananciaNeta.toLocaleString("es-CL")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfitabilityCard;
