import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Star } from "lucide-react";

interface Project {
  id: string;
  nombre_obra: string;
  estado: string;
  ganancia_neta: number;
  imagen_proyecto: string | null;
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
          imagen_proyecto,
          cliente:clientes(nombre)
        `)
        .order("created_at", { ascending: false });

      if (statusFilter !== "Todos") {
        query = query.eq("estado", statusFilter as "Pendiente" | "Aprobado" | "Terminado" | "Rechazado");
      }

      if (searchQuery) {
        query = query.or(`nombre_obra.ilike.%${searchQuery}%,cliente.nombre.ilike.%${searchQuery}%`);
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
      case "Rechazado":
        return "bg-destructive/20 text-destructive border-destructive/30";
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {projects.map((project) => (
        <Card
          key={project.id}
          className="group cursor-pointer overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 bg-background"
          onClick={() => navigate(`/project/${project.id}`)}
        >
          <div className="relative h-64 w-full overflow-hidden bg-muted">
            {project.imagen_proyecto ? (
              <img
                src={project.imagen_proyecto}
                alt={project.nombre_obra}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <Building2 className="h-20 w-20 text-muted-foreground/30" />
              </div>
            )}
            <div className="absolute top-3 right-3">
              <Badge className={`${getStatusColor(project.estado)} shadow-lg`}>
                {project.estado}
              </Badge>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-foreground text-base line-clamp-2 flex-1">
                {project.nombre_obra}
              </h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
              {project.cliente?.nombre || "Sin cliente"}
            </p>
            
            <div className="flex items-baseline gap-2 pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">Ganancia:</span>
              <span
                className={`text-base font-bold ${
                  project.ganancia_neta >= 0 ? "text-success" : "text-destructive"
                }`}
              >
                ${project.ganancia_neta.toLocaleString("es-CL")}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ProjectsList;
