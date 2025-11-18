import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoIcon from "@/assets/logo-icon-manospro.png";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPWA = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Detectar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Guardar el evento de instalación
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src={logoIcon} alt="ManosPro" className="h-24 w-24" />
            </div>
            <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
            <CardTitle className="text-2xl">¡App Instalada!</CardTitle>
            <CardDescription>
              ManosPro ya está instalada en tu dispositivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="w-full"
              size="lg"
            >
              Ir al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logoIcon} alt="ManosPro" className="h-24 w-24" />
          </div>
          <CardTitle className="text-2xl">Instalar ManosPro</CardTitle>
          <CardDescription>
            Instala ManosPro en tu dispositivo para acceder rápidamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
            <Smartphone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium mb-1">Funciona sin conexión</p>
              <p className="text-muted-foreground">
                Accede a tus proyectos incluso sin internet
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
            <Download className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium mb-1">Acceso instantáneo</p>
              <p className="text-muted-foreground">
                Abre la app desde tu pantalla de inicio
              </p>
            </div>
          </div>

          {isIOS ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Para instalar en iOS:
              </p>
              <ol className="text-sm space-y-2 text-muted-foreground">
                <li>1. Toca el botón de compartir (
                  <svg className="inline w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
                  </svg>
                  )</li>
                <li>2. Selecciona "Añadir a pantalla de inicio"</li>
                <li>3. Confirma pulsando "Añadir"</li>
              </ol>
              <Button 
                onClick={() => navigate('/dashboard')} 
                className="w-full"
                size="lg"
              >
                Continuar a la App
              </Button>
            </div>
          ) : deferredPrompt ? (
            <Button 
              onClick={handleInstallClick} 
              className="w-full"
              size="lg"
            >
              <Download className="h-5 w-5 mr-2" />
              Instalar App
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Tu navegador no soporta la instalación automática
              </p>
              <Button 
                onClick={() => navigate('/dashboard')} 
                className="w-full"
                size="lg"
                variant="outline"
              >
                Continuar a la App
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InstallPWA;
