import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import ProfitabilityCard from "@/components/project/ProfitabilityCard";
import ProjectInfo from "@/components/project/ProjectInfo";
import BudgetItems from "@/components/project/BudgetItems";
import ExpensesList from "@/components/project/ExpensesList";
import AddExpenseDialog from "@/components/project/AddExpenseDialog";

interface ProjectData {
  id: string;
  nombre_obra: string;
  descripcion: string | null;
  estado: string;
  fecha_visita: string | null;
  monto_total: number;
  monto_adelantado: number;
  total_gastado: number;
  ganancia_neta: number;
  cliente: {
    nombre: string;
  } | null;
}

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Check authentication
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/login");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        navigate("/login");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProject = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("obras")
        .select(`
          *,
          cliente:clientes(nombre)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error("Error fetching project:", error);
      toast.error("Error al cargar el proyecto");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProject();
    }
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Cargando...</div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="text-primary hover:bg-accent"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <h1 className="text-foreground font-bold text-lg line-clamp-1">
                {project.nombre_obra}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Profitability Block */}
        <ProfitabilityCard
          montoTotal={project.monto_total || 0}
          montoAdelantado={project.monto_adelantado || 0}
          totalGastado={project.total_gastado || 0}
          estado={project.estado}
        />

        {/* Project Info */}
        <ProjectInfo
          cliente={project.cliente?.nombre || "Sin cliente"}
          descripcion={project.descripcion}
          estado={project.estado}
          fechaVisita={project.fecha_visita}
          projectId={project.id}
          onUpdate={fetchProject}
        />

        {/* Budget Items */}
        <BudgetItems projectId={project.id} />

        {/* Expenses */}
        <ExpensesList projectId={project.id} />
      </main>

      {/* Floating Action Button */}
      <Button
        onClick={() => setShowAddExpense(true)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-primary hover:bg-primary-hover text-white shadow-2xl hover:shadow-primary/50 transition-all duration-200"
        size="icon"
      >
        <Plus className="h-8 w-8" />
      </Button>

      <AddExpenseDialog
        open={showAddExpense}
        onOpenChange={setShowAddExpense}
        projectId={project.id}
        onSuccess={fetchProject}
      />
    </div>
  );
};

export default ProjectDetail;
