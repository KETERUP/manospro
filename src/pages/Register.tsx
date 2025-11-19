import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import logo from "@/assets/logo-manospro.png";

const Register = () => {
  const navigate = useNavigate();
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombreCompleto || !email || !password) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre_completo: nombreCompleto,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      // Obtener el usuario recién creado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No se pudo obtener el usuario");

      // Crear empresa por defecto para el usuario
      const { data: empresaCreada, error: empresaError } = await supabase
        .from("empresas")
        .insert({
          nombre: `Empresa de ${nombreCompleto}`,
          cif: "TEMP-" + Date.now(),
          direccion_fiscal: "Por definir",
          email: email,
          telefono: "Por definir",
        })
        .select("id")
        .single();

      if (empresaError) throw empresaError;

      // Actualizar perfil con empresa_id
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ empresa_id: empresaCreada.id })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Asignar rol admin automáticamente
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: user.id,
          empresa_id: empresaCreada.id,
          role: "admin",
        });

      if (roleError) throw roleError;

      toast.success("¡Cuenta creada exitosamente!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-surface to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="MANOS PRO" className="h-32 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Crea tu cuenta en MANOS PRO</h1>
          <p className="text-muted-foreground">Comienza a gestionar tus proyectos hoy</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nombreCompleto" className="text-foreground">Nombre Completo</Label>
              <Input
                id="nombreCompleto"
                type="text"
                placeholder="Juan Pérez"
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                className="bg-muted border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-muted border-border"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-semibold py-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                "Registrarse"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <div className="text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link 
                to="/login" 
                className="text-primary font-semibold hover:underline"
              >
                Ingresa aquí
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
