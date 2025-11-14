import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Plus, Search, Settings } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo-manospro.png";
import ProjectsList from "@/components/dashboard/ProjectsList";
import CalendarView from "@/components/dashboard/CalendarView";
import CreateProjectDialog from "@/components/dashboard/CreateProjectDialog";
import { seedProjects } from "@/utils/seedProjects";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Todos");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        
        // Check if we need to seed projects (only run once)
        const seeded = localStorage.getItem('projects_seeded');
        if (!seeded) {
          const success = await seedProjects();
          if (success) {
            localStorage.setItem('projects_seeded', 'true');
            toast.success("Proyectos de ejemplo cargados");
            window.location.reload();
          }
        }
      } else {
        navigate("/login");
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="bg-secondary border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="MANOS PRO" className="h-10" />
              <h1 className="text-white font-bold text-lg">MANOS PRO</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-primary hover:bg-dark-surface"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-white hover:text-primary hover:bg-dark-surface"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="proyectos" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-6 bg-dark-surface">
            <TabsTrigger 
              value="proyectos"
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Proyectos
            </TabsTrigger>
            <TabsTrigger 
              value="calendario"
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Calendario
            </TabsTrigger>
          </TabsList>

          <TabsContent value="proyectos" className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Buscar proyecto por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-border"
              />
            </div>

            {/* Status Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {["Todos", "Pendiente", "Aprobado", "Terminado", "Rechazado"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className={
                    statusFilter === status
                      ? "bg-primary text-white hover:bg-primary-hover"
                      : "bg-muted text-foreground hover:bg-muted/80 border-border"
                  }
                >
                  {status}
                </Button>
              ))}
            </div>

            {/* Projects List */}
            <ProjectsList 
              searchQuery={searchQuery}
              statusFilter={statusFilter}
            />
          </TabsContent>

          <TabsContent value="calendario">
            <CalendarView />
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating Action Button */}
      <Button
        onClick={() => setShowCreateDialog(true)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-primary hover:bg-primary-hover text-white shadow-2xl hover:shadow-primary/50 transition-all duration-200"
        size="icon"
      >
        <Plus className="h-8 w-8" />
      </Button>

      <CreateProjectDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
};

export default Dashboard;
