import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Plus, Search, Settings } from "lucide-react";
import { toast } from "sonner";
import logoIcon from "@/assets/logo-icon-manospro.png";
import loadingImage from "@/assets/loading-manospro.png";
import ProjectsList from "@/components/dashboard/ProjectsList";
import FinancialSummary from "@/components/dashboard/FinancialSummary";
import CreateProjectDialog from "@/components/dashboard/CreateProjectDialog";
import CreateClientDialog from "@/components/dashboard/CreateClientDialog";
import CreateProviderDialog from "@/components/dashboard/CreateProviderDialog";
import ClientsList from "@/components/dashboard/ClientsList";
import ProvidersList from "@/components/dashboard/ProvidersList";
import HeaderCalendar from "@/components/dashboard/HeaderCalendar";
import { seedProjects } from "@/utils/seedProjects";
import { updateProjectImages } from "@/utils/updateProjectImages";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Todos");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCreateClientDialog, setShowCreateClientDialog] = useState(false);
  const [showCreateProviderDialog, setShowCreateProviderDialog] = useState(false);
  const [refreshClients, setRefreshClients] = useState(0);
  const [refreshProviders, setRefreshProviders] = useState(0);
  const [activeTab, setActiveTab] = useState("proyectos");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        
        const seeded = localStorage.getItem('projects_seeded_v4');
        if (!seeded) {
          const success = await seedProjects();
          if (success) {
            localStorage.setItem('projects_seeded_v4', 'true');
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

  const handleUpdateImages = async () => {
    toast.loading("Actualizando imágenes...");
    const success = await updateProjectImages();
    toast.dismiss();
    if (success) {
      toast.success("Imágenes actualizadas correctamente");
      window.location.reload();
    } else {
      toast.error("Error al actualizar imágenes");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <img src={loadingImage} alt="Cargando..." className="w-80 h-80 object-contain" />
        </div>
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
              <img src={logoIcon} alt="ManosPro Icon" className="h-20 w-20 object-contain" />
              <div className="flex flex-col">
                <h1 className="text-4xl font-bold leading-tight">
                  <span className="text-primary">Manos</span>
                  <span className="text-foreground">Pro</span>
                </h1>
                <div className="h-1 bg-gradient-to-r from-primary to-transparent rounded-full mt-1"></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <HeaderCalendar />
              <Button
                variant="outline"
                size="sm"
                onClick={handleUpdateImages}
                title="Actualizar Imágenes Proyectos"
              >
                Actualizar Imágenes
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/settings")}
                title="Configuración"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-5 w-5" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="proyectos" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-primary/10 p-2 gap-2 h-auto">
            <TabsTrigger 
              value="proyectos" 
              className="text-xl font-bold py-4 bg-primary text-primary-foreground hover:bg-primary-hover data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200 rounded-lg"
            >
              Proyectos
            </TabsTrigger>
            <TabsTrigger 
              value="clientes" 
              className="text-xl font-bold py-4 bg-primary text-primary-foreground hover:bg-primary-hover data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200 rounded-lg"
            >
              Clientes
            </TabsTrigger>
            <TabsTrigger 
              value="proveedores" 
              className="text-xl font-bold py-4 bg-primary text-primary-foreground hover:bg-primary-hover data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200 rounded-lg"
            >
              Proveedores
            </TabsTrigger>
          </TabsList>

          <TabsContent value="proyectos" className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Buscar proyectos o clientes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-card border-border shadow-sm text-base rounded-xl"
              />
            </div>

            {/* Status Filters */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[
                { value: "Todos", label: "Todos" },
                { value: "PENDIENTE", label: "Pendiente" },
                { value: "APROBADO", label: "Aprobado" },
                { value: "EN_PROGRESO", label: "En Progreso" },
                { value: "TERMINADO", label: "Terminado" },
                { value: "RECHAZADO", label: "Rechazado" }
              ].map((status) => (
                <Button
                  key={status.value}
                  variant={statusFilter === status.value ? "default" : "outline"}
                  size="default"
                  onClick={() => setStatusFilter(status.value)}
                  className={
                    statusFilter === status.value
                      ? "bg-primary text-white hover:bg-primary-hover rounded-full font-medium shadow-sm"
                      : "bg-card text-foreground hover:bg-accent hover:text-accent-foreground border-border rounded-full font-medium"
                  }
                >
                  {status.label}
                </Button>
              ))}
            </div>

            {/* Projects List */}
            <ProjectsList 
              searchQuery={searchQuery}
              statusFilter={statusFilter}
            />
          </TabsContent>

          <TabsContent value="clientes" className="space-y-6">
            {/* Resumen Financiero dentro de Clientes */}
            <div className="mb-8">
              <FinancialSummary />
            </div>

            {/* Lista de Clientes */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Lista de Clientes</h2>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Buscar clientes por nombre, email o CIF..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-card border-border shadow-sm text-base rounded-xl"
                />
              </div>
              <ClientsList searchQuery={searchQuery} key={refreshClients} />
            </div>
          </TabsContent>

          <TabsContent value="proveedores" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Buscar proveedores por nombre, email, CIF o tipo de material..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-card border-border shadow-sm text-base rounded-xl"
              />
            </div>
            <ProvidersList searchQuery={searchQuery} key={refreshProviders} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating Action Button */}
      <Button
        onClick={() => {
          if (activeTab === "clientes") {
            setShowCreateClientDialog(true);
          } else if (activeTab === "proveedores") {
            setShowCreateProviderDialog(true);
          } else {
            setShowCreateDialog(true);
          }
        }}
        size="lg"
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40"
      >
        <Plus className="h-8 w-8" />
      </Button>

      <CreateProjectDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
      
      <CreateClientDialog
        open={showCreateClientDialog}
        onOpenChange={setShowCreateClientDialog}
        onSuccess={() => {
          setRefreshClients(prev => prev + 1);
        }}
      />

      <CreateProviderDialog
        open={showCreateProviderDialog}
        onOpenChange={setShowCreateProviderDialog}
        onSuccess={() => {
          setRefreshProviders(prev => prev + 1);
        }}
      />
    </div>
  );
};

export default Dashboard;
