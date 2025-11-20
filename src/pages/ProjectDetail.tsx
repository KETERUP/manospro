import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
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
import ProfitabilityCard from "@/components/project/ProfitabilityCard";
import ProjectInfo from "@/components/project/ProjectInfo";
import ExpensesList from "@/components/project/ExpensesList";
import AddExpenseDialog from "@/components/project/AddExpenseDialog";
import EditProjectDialog from "@/components/project/EditProjectDialog";

interface ProjectData {
  id: string;
  nombre_obra: string;
  descripcion: string | null;
  estado: string;
  fecha_visita: string | null;
  monto_total: number | null;
  monto_adelantado: number | null;
  total_gastado: number;
  ganancia_neta: number | null;
  cliente_id: string | null;
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
  const [showEditProject, setShowEditProject] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const handleDeleteProject = async () => {
    if (!id) return;

    try {
      const { error } = await supabase
        .from("obras")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Proyecto eliminado exitosamente");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Error al eliminar el proyecto");
    }
  };

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
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditProject(true)}
                className="gap-2"
              >
                <Pencil className="h-4 w-4" />
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </Button>
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

      <EditProjectDialog
        open={showEditProject}
        onOpenChange={setShowEditProject}
        projectId={project.id}
        currentData={{
          nombre_obra: project.nombre_obra,
          descripcion: project.descripcion,
          cliente_id: project.cliente_id,
          monto_total: project.monto_total || 0,
          monto_adelantado: project.monto_adelantado || 0,
          total_gastado: project.total_gastado || 0,
        }}
        onUpdate={fetchProject}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar proyecto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el proyecto
              "{project.nombre_obra}" y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectDetail;
