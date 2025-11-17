-- MANOSPRO DATABASE MIGRATION (simplificado)

-- 1. ENUMS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'trabajador');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_proyecto') THEN
    CREATE TYPE public.estado_proyecto AS ENUM ('PENDIENTE', 'APROBADO', 'EN_PROGRESO', 'TERMINADO', 'RECHAZADO');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_presupuesto') THEN
    CREATE TYPE public.estado_presupuesto AS ENUM ('PENDIENTE', 'ACEPTADO', 'RECHAZADO');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_factura') THEN
    CREATE TYPE public.estado_factura AS ENUM ('PAGADA', 'PENDIENTE');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_evento') THEN
    CREATE TYPE public.tipo_evento AS ENUM ('CITA', 'REUNION', 'INICIO_OBRA', 'FIN_OBRA', 'VISITA');
  END IF;
END $$;

-- 2. EMPRESAS
CREATE TABLE IF NOT EXISTS public.empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  cif TEXT NOT NULL UNIQUE,
  direccion_fiscal TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT NOT NULL,
  iva_por_defecto NUMERIC NOT NULL DEFAULT 21,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id) ON DELETE SET NULL;

-- 3. USER_ROLES
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, empresa_id)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. FUNCIONES SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.get_user_empresa_id(_user_id UUID)
RETURNS UUID LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT empresa_id FROM public.profiles WHERE id = _user_id
$$;

-- 5. ELIMINAR POLÍTICAS ANTIGUAS
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can create own clients" ON public.clientes;
  DROP POLICY IF EXISTS "Users can delete own clients" ON public.clientes;
  DROP POLICY IF EXISTS "Users can update own clients" ON public.clientes;
  DROP POLICY IF EXISTS "Users can view own clients" ON public.clientes;
  DROP POLICY IF EXISTS "Users can create own providers" ON public.proveedores;
  DROP POLICY IF EXISTS "Users can delete own providers" ON public.proveedores;
  DROP POLICY IF EXISTS "Users can update own providers" ON public.proveedores;
  DROP POLICY IF EXISTS "Users can view own providers" ON public.proveedores;
  DROP POLICY IF EXISTS "Users can create own obras" ON public.obras;
  DROP POLICY IF EXISTS "Users can delete own obras" ON public.obras;
  DROP POLICY IF EXISTS "Users can update own obras" ON public.obras;
  DROP POLICY IF EXISTS "Users can view own obras" ON public.obras;
  DROP POLICY IF EXISTS "Users can create gastos for own obras" ON public.gastos;
  DROP POLICY IF EXISTS "Users can delete gastos from own obras" ON public.gastos;
  DROP POLICY IF EXISTS "Users can update gastos from own obras" ON public.gastos;
  DROP POLICY IF EXISTS "Users can view gastos from own obras" ON public.gastos;
  DROP POLICY IF EXISTS "Users can create items for own obras" ON public.items_presupuesto;
  DROP POLICY IF EXISTS "Users can delete items from own obras" ON public.items_presupuesto;
  DROP POLICY IF EXISTS "Users can update items from own obras" ON public.items_presupuesto;
  DROP POLICY IF EXISTS "Users can view items from own obras" ON public.items_presupuesto;
END $$;

-- 6. ACTUALIZAR CLIENTES
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS nif_cif TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.clientes DROP COLUMN IF EXISTS user_id;

-- 7. ACTUALIZAR PROVEEDORES
ALTER TABLE public.proveedores ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE;
ALTER TABLE public.proveedores ADD COLUMN IF NOT EXISTS direccion TEXT;
ALTER TABLE public.proveedores ADD COLUMN IF NOT EXISTS cif TEXT;
ALTER TABLE public.proveedores ADD COLUMN IF NOT EXISTS tipo_material TEXT;
ALTER TABLE public.proveedores ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.proveedores DROP COLUMN IF EXISTS user_id;

-- 8. MATERIALES
CREATE TABLE IF NOT EXISTS public.materiales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
  proveedor_id UUID REFERENCES public.proveedores(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  coste_unitario NUMERIC NOT NULL DEFAULT 0,
  stock_actual NUMERIC NOT NULL DEFAULT 0,
  unidad_medida TEXT DEFAULT 'unidad',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.materiales ENABLE ROW LEVEL SECURITY;

-- 9. ACTUALIZAR OBRAS - Conversión completa a TEXT primero
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE;
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS trabajador_asignado_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS fecha_inicio DATE;
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS fecha_fin DATE;
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS direccion_obra TEXT;
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS latitud NUMERIC;
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS longitud NUMERIC;
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS descripcion TEXT;

-- Cambiar estado: 1) quitar default, 2) pasar a TEXT, 3) Actualizar valores, 4) Convertir a nuevo enum
ALTER TABLE public.obras ALTER COLUMN estado DROP DEFAULT;
ALTER TABLE public.obras ALTER COLUMN estado TYPE TEXT USING estado::TEXT;
UPDATE public.obras SET estado = UPPER(estado) WHERE estado IS NOT NULL;
ALTER TABLE public.obras ALTER COLUMN estado TYPE public.estado_proyecto USING estado::public.estado_proyecto;
ALTER TABLE public.obras ALTER COLUMN estado SET DEFAULT 'PENDIENTE'::public.estado_proyecto;

ALTER TABLE public.obras DROP COLUMN IF EXISTS user_id;

-- 10. RESTO DE TABLAS NUEVAS
CREATE TABLE IF NOT EXISTS public.proyecto_materiales (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), proyecto_id UUID REFERENCES public.obras(id) ON DELETE CASCADE NOT NULL, material_id UUID REFERENCES public.materiales(id) ON DELETE CASCADE NOT NULL, cantidad NUMERIC NOT NULL, coste_total NUMERIC NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.proyecto_materiales ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.presupuestos (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL, cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL, proyecto_id UUID REFERENCES public.obras(id) ON DELETE SET NULL, numero_presupuesto TEXT UNIQUE NOT NULL, titulo TEXT NOT NULL, descripcion TEXT, subtotal NUMERIC NOT NULL DEFAULT 0, iva NUMERIC NOT NULL DEFAULT 21, total NUMERIC NOT NULL DEFAULT 0, estado public.estado_presupuesto NOT NULL DEFAULT 'PENDIENTE', fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE, fecha_validez DATE, firma_cliente BOOLEAN DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.presupuestos ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.items_presupuesto_detalle (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), presupuesto_id UUID REFERENCES public.presupuestos(id) ON DELETE CASCADE NOT NULL, concepto TEXT NOT NULL, cantidad NUMERIC NOT NULL, precio_unitario NUMERIC NOT NULL, precio_total NUMERIC NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.items_presupuesto_detalle ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.facturas (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL, proyecto_id UUID REFERENCES public.obras(id) ON DELETE SET NULL, cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL, numero_factura TEXT UNIQUE NOT NULL, fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE, base_imponible NUMERIC NOT NULL DEFAULT 0, iva NUMERIC NOT NULL DEFAULT 21, total NUMERIC NOT NULL DEFAULT 0, estado public.estado_factura NOT NULL DEFAULT 'PENDIENTE', created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.facturas ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.items_factura (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), factura_id UUID REFERENCES public.facturas(id) ON DELETE CASCADE NOT NULL, concepto TEXT NOT NULL, cantidad NUMERIC NOT NULL, precio_unitario NUMERIC NOT NULL, precio_total NUMERIC NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.items_factura ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.agenda_eventos (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL, user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, tipo_evento public.tipo_evento NOT NULL, titulo TEXT NOT NULL, descripcion TEXT, fecha_inicio TIMESTAMPTZ NOT NULL, fecha_fin TIMESTAMPTZ, cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL, proyecto_id UUID REFERENCES public.obras(id) ON DELETE SET NULL, recordatorio_minutos INTEGER, notificado BOOLEAN DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.agenda_eventos ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.checklist (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), proyecto_id UUID REFERENCES public.obras(id) ON DELETE CASCADE NOT NULL, titulo TEXT NOT NULL, descripcion TEXT, completado BOOLEAN DEFAULT false, orden INTEGER DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.checklist ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.fotos_proyecto (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), proyecto_id UUID REFERENCES public.obras(id) ON DELETE CASCADE NOT NULL, url TEXT NOT NULL, descripcion TEXT, tipo TEXT DEFAULT 'progreso', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.fotos_proyecto ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.documentos (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), proyecto_id UUID REFERENCES public.obras(id) ON DELETE CASCADE NOT NULL, nombre TEXT NOT NULL, url TEXT NOT NULL, tipo_documento TEXT, tamanio_bytes BIGINT, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.horas_trabajadas (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), proyecto_id UUID REFERENCES public.obras(id) ON DELETE CASCADE NOT NULL, user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, fecha DATE NOT NULL, horas NUMERIC NOT NULL, descripcion TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.horas_trabajadas ENABLE ROW LEVEL SECURITY;

-- 11. POLÍTICAS RLS
CREATE POLICY "Ver empresa" ON public.empresas FOR SELECT USING (id = public.get_user_empresa_id(auth.uid()));
CREATE POLICY "Admins actualizan empresa" ON public.empresas FOR UPDATE USING (id = public.get_user_empresa_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Insertar empresa" ON public.empresas FOR INSERT WITH CHECK (true);

CREATE POLICY "Ver roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins gestionan roles" ON public.user_roles FOR ALL USING (empresa_id = public.get_user_empresa_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Ver clientes" ON public.clientes FOR SELECT USING (empresa_id = public.get_user_empresa_id(auth.uid()));
CREATE POLICY "Admins clientes" ON public.clientes FOR ALL USING (empresa_id = public.get_user_empresa_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Ver proveedores" ON public.proveedores FOR SELECT USING (empresa_id = public.get_user_empresa_id(auth.uid()));
CREATE POLICY "Admins proveedores" ON public.proveedores FOR ALL USING (empresa_id = public.get_user_empresa_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Ver materiales" ON public.materiales FOR SELECT USING (empresa_id = public.get_user_empresa_id(auth.uid()));
CREATE POLICY "Admins materiales" ON public.materiales FOR ALL USING (empresa_id = public.get_user_empresa_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins ven proyectos" ON public.obras FOR SELECT USING (empresa_id = public.get_user_empresa_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Trabajadores ven asignados" ON public.obras FOR SELECT USING (empresa_id = public.get_user_empresa_id(auth.uid()) AND trabajador_asignado_id = auth.uid());
CREATE POLICY "Admins gestionan obras" ON public.obras FOR ALL USING (empresa_id = public.get_user_empresa_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Trabajadores actualizan" ON public.obras FOR UPDATE USING (empresa_id = public.get_user_empresa_id(auth.uid()) AND trabajador_asignado_id = auth.uid());

CREATE POLICY "Ver gastos" ON public.gastos FOR SELECT USING (EXISTS (SELECT 1 FROM public.obras WHERE obras.id = gastos.obra_id AND obras.empresa_id = public.get_user_empresa_id(auth.uid())));
CREATE POLICY "Gestionar gastos" ON public.gastos FOR ALL USING (EXISTS (SELECT 1 FROM public.obras WHERE obras.id = gastos.obra_id AND (obras.trabajador_asignado_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));

CREATE POLICY "Ver items presup" ON public.items_presupuesto FOR SELECT USING (EXISTS (SELECT 1 FROM public.obras WHERE obras.id = items_presupuesto.obra_id AND obras.empresa_id = public.get_user_empresa_id(auth.uid())));
CREATE POLICY "Gestionar items presup" ON public.items_presupuesto FOR ALL USING (EXISTS (SELECT 1 FROM public.obras WHERE obras.id = items_presupuesto.obra_id AND (obras.trabajador_asignado_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));

CREATE POLICY "Ver presupuestos" ON public.presupuestos FOR SELECT USING (empresa_id = public.get_user_empresa_id(auth.uid()));
CREATE POLICY "Admins presupuestos" ON public.presupuestos FOR ALL USING (empresa_id = public.get_user_empresa_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Ver facturas" ON public.facturas FOR SELECT USING (empresa_id = public.get_user_empresa_id(auth.uid()));
CREATE POLICY "Admins facturas" ON public.facturas FOR ALL USING (empresa_id = public.get_user_empresa_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Ver eventos" ON public.agenda_eventos FOR SELECT USING (empresa_id = public.get_user_empresa_id(auth.uid()));
CREATE POLICY "Crear eventos" ON public.agenda_eventos FOR INSERT WITH CHECK (empresa_id = public.get_user_empresa_id(auth.uid()) AND user_id = auth.uid());
CREATE POLICY "Actualizar eventos" ON public.agenda_eventos FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Eliminar eventos" ON public.agenda_eventos FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Gestionar checklist" ON public.checklist FOR ALL USING (EXISTS (SELECT 1 FROM public.obras WHERE obras.id = checklist.proyecto_id AND obras.empresa_id = public.get_user_empresa_id(auth.uid()) AND (obras.trabajador_asignado_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));
CREATE POLICY "Gestionar fotos" ON public.fotos_proyecto FOR ALL USING (EXISTS (SELECT 1 FROM public.obras WHERE obras.id = fotos_proyecto.proyecto_id AND obras.empresa_id = public.get_user_empresa_id(auth.uid()) AND (obras.trabajador_asignado_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));
CREATE POLICY "Gestionar documentos" ON public.documentos FOR ALL USING (EXISTS (SELECT 1 FROM public.obras WHERE obras.id = documentos.proyecto_id AND obras.empresa_id = public.get_user_empresa_id(auth.uid()) AND (obras.trabajador_asignado_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));

CREATE POLICY "Ver horas" ON public.horas_trabajadas FOR SELECT USING (EXISTS (SELECT 1 FROM public.obras WHERE obras.id = horas_trabajadas.proyecto_id AND obras.empresa_id = public.get_user_empresa_id(auth.uid())));
CREATE POLICY "Registrar horas" ON public.horas_trabajadas FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Actualizar horas" ON public.horas_trabajadas FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Ver items presup det" ON public.items_presupuesto_detalle FOR SELECT USING (EXISTS (SELECT 1 FROM public.presupuestos WHERE presupuestos.id = items_presupuesto_detalle.presupuesto_id AND presupuestos.empresa_id = public.get_user_empresa_id(auth.uid())));
CREATE POLICY "Gestionar items presup det" ON public.items_presupuesto_detalle FOR ALL USING (EXISTS (SELECT 1 FROM public.presupuestos WHERE presupuestos.id = items_presupuesto_detalle.presupuesto_id AND presupuestos.empresa_id = public.get_user_empresa_id(auth.uid()) AND public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Ver items fact" ON public.items_factura FOR SELECT USING (EXISTS (SELECT 1 FROM public.facturas WHERE facturas.id = items_factura.factura_id AND facturas.empresa_id = public.get_user_empresa_id(auth.uid())));
CREATE POLICY "Gestionar items fact" ON public.items_factura FOR ALL USING (EXISTS (SELECT 1 FROM public.facturas WHERE facturas.id = items_factura.factura_id AND facturas.empresa_id = public.get_user_empresa_id(auth.uid()) AND public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Ver proy mat" ON public.proyecto_materiales FOR SELECT USING (EXISTS (SELECT 1 FROM public.obras WHERE obras.id = proyecto_materiales.proyecto_id AND obras.empresa_id = public.get_user_empresa_id(auth.uid())));
CREATE POLICY "Gestionar proy mat" ON public.proyecto_materiales FOR ALL USING (EXISTS (SELECT 1 FROM public.obras WHERE obras.id = proyecto_materiales.proyecto_id AND (obras.trabajador_asignado_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));

-- 12. TRIGGERS
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_emp_upd BEFORE UPDATE ON public.empresas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_cli_upd BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_prov_upd BEFORE UPDATE ON public.proveedores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mat_upd BEFORE UPDATE ON public.materiales FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_obr_upd BEFORE UPDATE ON public.obras FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_pres_upd BEFORE UPDATE ON public.presupuestos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_fact_upd BEFORE UPDATE ON public.facturas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_agen_upd BEFORE UPDATE ON public.agenda_eventos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_check_upd BEFORE UPDATE ON public.checklist FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();