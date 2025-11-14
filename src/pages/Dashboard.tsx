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
import FinancialSummary from "@/components/dashboard/FinancialSummary";
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
        const seeded = localStorage.getItem('projects_seeded_v3');
        if (!seeded) {
          const success = await seedProjects();
          if (success) {
            localStorage.setItem('projects_seeded_v3', 'true');
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logo} alt="MANOS PRO" className="h-14 w-14" />
              <h1 className="text-foreground font-bold text-3xl tracking-tight">MANOS PRO</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary hover:bg-accent"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-primary hover:bg-accent"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="proyectos" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-8 bg-card shadow-sm h-12">
            <TabsTrigger 
              value="proyectos"
              className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg font-medium"
            >
              Proyectos
            </TabsTrigger>
            <TabsTrigger 
              value="calendario"
              className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg font-medium"
            >
              Calendario
            </TabsTrigger>
            <TabsTrigger 
              value="financiero"
              className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg font-medium"
            >
              Resumen Financiero
            </TabsTrigger>
          </TabsList>

          <TabsContent value="proyectos" className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Buscar proyecto por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-card border-border shadow-sm text-base rounded-xl"
              />
            </div>

            {/* Status Filters */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {["Todos", "Pendiente", "Aprobado", "Terminado", "Rechazado"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="default"
                  onClick={() => setStatusFilter(status)}
                  className={
                    statusFilter === status
                      ? "bg-primary text-white hover:bg-primary-hover rounded-full font-medium shadow-sm"
                      : "bg-card text-foreground hover:bg-accent hover:text-accent-foreground border-border rounded-full font-medium"
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

          <TabsContent value="financiero">
            <FinancialSummary />
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating Action Button */}
      <Button
        onClick={() => setShowCreateDialog(true)}
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full bg-primary hover:bg-primary-hover text-white shadow-xl hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 hover:scale-110"
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
