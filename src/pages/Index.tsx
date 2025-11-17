import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo-manospro.png";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <img src={logo} alt="MANOS PRO" className="h-48 mx-auto mb-8" />
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          MANOS PRO
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Gestiona tus proyectos de construcción de forma profesional
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/login")}
            size="lg"
            className="bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Ingresar
          </Button>
          <Button
            onClick={() => navigate("/register-multistep")}
            size="lg"
            variant="outline"
            className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold px-8 py-6 text-lg rounded-xl transition-all duration-200"
          >
            Registrarse
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
