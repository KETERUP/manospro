import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

interface Project {
  id: string;
  nombre_obra: string;
  estado: string;
  ganancia_neta: number;
  cliente: {
    nombre: string;
  } | null;
}

interface ProjectsListProps {
  searchQuery: string;
  statusFilter: string;
}

const ProjectsList = ({ searchQuery, statusFilter }: ProjectsListProps) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, [searchQuery, statusFilter]);

  const fetchProjects = async () => {
    try {
      let query = supabase
        .from("obras")
        .select(`
          id,
          nombre_obra,
          estado,
          ganancia_neta,
          cliente:clientes(nombre)
        `)
        .order("created_at", { ascending: false });

      if (statusFilter !== "Todos") {
        query = query.eq("estado", statusFilter as "Pendiente" | "Aprobado" | "Terminado");
      }

      if (searchQuery) {
        query = query.ilike("nombre_obra", `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Pendiente":
        return "bg-warning/20 text-warning border-warning/30";
      case "Aprobado":
        return "bg-success/20 text-success border-success/30";
      case "Terminado":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-white">
        Cargando proyectos...
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-white text-lg mb-2">No hay proyectos</p>
        <p className="text-muted-foreground">
          {searchQuery || statusFilter !== "Todos"
            ? "No se encontraron proyectos con los filtros aplicados"
            : "Crea tu primer proyecto para comenzar"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <Card
          key={project.id}
          className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white border-border hover:border-primary/50"
          onClick={() => navigate(`/project/${project.id}`)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-foreground text-lg">
                {project.nombre_obra}
              </h3>
              <Badge className={getStatusColor(project.estado)}>
                {project.estado}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {project.cliente?.nombre || "Sin cliente"}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-muted-foreground">Ganancia:</span>
              <span
                className={`text-lg font-bold ${
                  project.ganancia_neta >= 0 ? "text-success" : "text-destructive"
                }`}
              >
                ${project.ganancia_neta.toLocaleString("es-CL")}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProjectsList;
