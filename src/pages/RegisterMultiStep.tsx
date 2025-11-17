import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";
import logo from "@/assets/logo-manospro.png";
import { ArrowLeft, ArrowRight, Building2, User, CheckCircle2 } from "lucide-react";

// Validation schemas
const userSchema = z.object({
  nombreCompleto: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "El nombre es muy largo"),
  email: z.string().trim().email("Email inválido").max(255, "Email muy largo"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").max(100, "Contraseña muy larga"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

const empresaSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "Nombre muy largo"),
  cif: z.string().trim().min(9, "CIF inválido").max(20, "CIF muy largo"),
  direccionFiscal: z.string().trim().min(5, "Dirección muy corta").max(200, "Dirección muy larga"),
  email: z.string().trim().email("Email inválido").max(255, "Email muy largo"),
  telefono: z.string().trim().min(9, "Teléfono inválido").max(20, "Teléfono muy largo"),
});

type UserData = z.infer<typeof userSchema>;
type EmpresaData = z.infer<typeof empresaSchema>;

const RegisterMultiStep = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Step 1: User data
  const [userData, setUserData] = useState<UserData>({
    nombreCompleto: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Step 2: Company data
  const [empresaData, setEmpresaData] = useState<EmpresaData>({
    nombre: "",
    cif: "",
    direccionFiscal: "",
    email: "",
    telefono: "",
  });

  const handleStep1Next = async () => {
    try {
      // Validate user data
      const validatedData = userSchema.parse(userData);
      setLoading(true);

      // Create user account
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nombre_completo: validatedData.nombreCompleto,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("Este email ya está registrado. Intenta iniciar sesión.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (!data.user) {
        toast.error("Error al crear usuario");
        return;
      }

      setUserId(data.user.id);
      toast.success("Usuario creado exitosamente");
      setStep(2);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Error al validar los datos");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Complete = async () => {
    try {
      // Validate company data
      const validatedData = empresaSchema.parse(empresaData);
      setLoading(true);

      if (!userId) {
        toast.error("Error: Usuario no encontrado");
        return;
      }

      // Create company
      const { data: empresaCreada, error: empresaError } = await supabase
        .from("empresas")
        .insert({
          nombre: validatedData.nombre,
          cif: validatedData.cif,
          direccion_fiscal: validatedData.direccionFiscal,
          email: validatedData.email,
          telefono: validatedData.telefono,
        })
        .select("id")
        .single();

      if (empresaError) {
        toast.error("Error al crear empresa: " + empresaError.message);
        return;
      }

      // Update profile with empresa_id
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ empresa_id: empresaCreada.id })
        .eq("id", userId);

      if (profileError) {
        toast.error("Error al actualizar perfil: " + profileError.message);
        return;
      }

      // Assign admin role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          empresa_id: empresaCreada.id,
          role: "admin",
        });

      if (roleError) {
        toast.error("Error al asignar rol: " + roleError.message);
        return;
      }

      toast.success("¡Registro completado exitosamente!");
      setStep(3);
      
      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Error al completar el registro");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <img src={logo} alt="MANOS PRO" className="h-24" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl text-center text-foreground">
              {step === 1 && "Crear Cuenta"}
              {step === 2 && "Datos de la Empresa"}
              {step === 3 && "¡Registro Completado!"}
            </CardTitle>
            <CardDescription className="text-center">
              {step === 1 && "Paso 1 de 2: Información personal"}
              {step === 2 && "Paso 2 de 2: Información de la empresa"}
              {step === 3 && "Tu cuenta ha sido creada exitosamente"}
            </CardDescription>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center gap-2">
            <div className={`h-2 w-20 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
            <div className={`h-2 w-20 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
            <div className={`h-2 w-20 rounded-full ${step >= 3 ? "bg-primary" : "bg-muted"}`} />
          </div>
        </CardHeader>

        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary mb-4">
                <User className="h-5 w-5" />
                <span className="font-semibold">Información Personal</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombreCompleto">Nombre Completo</Label>
                <Input
                  id="nombreCompleto"
                  placeholder="Juan Pérez"
                  value={userData.nombreCompleto}
                  onChange={(e) => setUserData({ ...userData, nombreCompleto: e.target.value })}
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="juan@empresa.cl"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  maxLength={255}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={userData.password}
                  onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={userData.confirmPassword}
                  onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
                  maxLength={100}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
                <Button
                  onClick={handleStep1Next}
                  disabled={loading}
                  className="flex-1 bg-primary hover:bg-primary-hover"
                >
                  Siguiente
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary mb-4">
                <Building2 className="h-5 w-5" />
                <span className="font-semibold">Datos de la Empresa</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombreEmpresa">Nombre de la Empresa</Label>
                <Input
                  id="nombreEmpresa"
                  placeholder="Constructora ABC Ltda."
                  value={empresaData.nombre}
                  onChange={(e) => setEmpresaData({ ...empresaData, nombre: e.target.value })}
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cif">CIF/RUT</Label>
                <Input
                  id="cif"
                  placeholder="12.345.678-9"
                  value={empresaData.cif}
                  onChange={(e) => setEmpresaData({ ...empresaData, cif: e.target.value })}
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccionFiscal">Dirección Fiscal</Label>
                <Input
                  id="direccionFiscal"
                  placeholder="Av. Principal 123, Santiago"
                  value={empresaData.direccionFiscal}
                  onChange={(e) => setEmpresaData({ ...empresaData, direccionFiscal: e.target.value })}
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailEmpresa">Email de la Empresa</Label>
                <Input
                  id="emailEmpresa"
                  type="email"
                  placeholder="contacto@empresa.cl"
                  value={empresaData.email}
                  onChange={(e) => setEmpresaData({ ...empresaData, email: e.target.value })}
                  maxLength={255}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  placeholder="+56912345678"
                  value={empresaData.telefono}
                  onChange={(e) => setEmpresaData({ ...empresaData, telefono: e.target.value })}
                  maxLength={20}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                  disabled={loading}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Atrás
                </Button>
                <Button
                  onClick={handleStep2Complete}
                  disabled={loading}
                  className="flex-1 bg-primary hover:bg-primary-hover"
                >
                  Completar
                  <CheckCircle2 className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6 py-8">
              <div className="flex justify-center">
                <div className="rounded-full bg-primary/10 p-6">
                  <CheckCircle2 className="h-16 w-16 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">¡Todo listo!</h3>
                <p className="text-muted-foreground">
                  Tu cuenta y empresa han sido creadas exitosamente.
                  <br />
                  Serás redirigido al panel en un momento...
                </p>
              </div>
            </div>
          )}

          {step < 3 && (
            <div className="mt-6 text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <a href="/login" className="text-primary hover:underline font-medium">
                Inicia sesión aquí
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterMultiStep;
