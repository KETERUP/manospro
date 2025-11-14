-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_completo TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create trigger function for new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre_completo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', 'Usuario')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create clientes table
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  direccion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clients" ON public.clientes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own clients" ON public.clientes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON public.clientes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON public.clientes
  FOR DELETE USING (auth.uid() = user_id);

-- Create proveedores table
CREATE TABLE public.proveedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own providers" ON public.proveedores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own providers" ON public.proveedores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own providers" ON public.proveedores
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own providers" ON public.proveedores
  FOR DELETE USING (auth.uid() = user_id);

-- Create obras table with estado enum
CREATE TYPE public.estado_obra AS ENUM ('Pendiente', 'Aprobado', 'Terminado');

CREATE TABLE public.obras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre_obra TEXT NOT NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  estado public.estado_obra DEFAULT 'Pendiente' NOT NULL,
  fecha_visita TIMESTAMP WITH TIME ZONE,
  total_presupuestado DECIMAL(12,2) DEFAULT 0 NOT NULL,
  total_gastado DECIMAL(12,2) DEFAULT 0 NOT NULL,
  ganancia_neta DECIMAL(12,2) GENERATED ALWAYS AS (total_presupuestado - total_gastado) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own obras" ON public.obras
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own obras" ON public.obras
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own obras" ON public.obras
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own obras" ON public.obras
  FOR DELETE USING (auth.uid() = user_id);

-- Create items_presupuesto table
CREATE TABLE public.items_presupuesto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID REFERENCES public.obras(id) ON DELETE CASCADE NOT NULL,
  descripcion TEXT NOT NULL,
  precio DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.items_presupuesto ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view items from own obras" ON public.items_presupuesto
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.obras 
      WHERE obras.id = items_presupuesto.obra_id 
      AND obras.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create items for own obras" ON public.items_presupuesto
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.obras 
      WHERE obras.id = items_presupuesto.obra_id 
      AND obras.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items from own obras" ON public.items_presupuesto
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.obras 
      WHERE obras.id = items_presupuesto.obra_id 
      AND obras.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from own obras" ON public.items_presupuesto
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.obras 
      WHERE obras.id = items_presupuesto.obra_id 
      AND obras.user_id = auth.uid()
    )
  );

-- Create gastos table
CREATE TABLE public.gastos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID REFERENCES public.obras(id) ON DELETE CASCADE NOT NULL,
  proveedor_id UUID REFERENCES public.proveedores(id) ON DELETE SET NULL,
  descripcion TEXT NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  foto_boleta TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.gastos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view gastos from own obras" ON public.gastos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.obras 
      WHERE obras.id = gastos.obra_id 
      AND obras.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create gastos for own obras" ON public.gastos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.obras 
      WHERE obras.id = gastos.obra_id 
      AND obras.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update gastos from own obras" ON public.gastos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.obras 
      WHERE obras.id = gastos.obra_id 
      AND obras.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete gastos from own obras" ON public.gastos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.obras 
      WHERE obras.id = gastos.obra_id 
      AND obras.user_id = auth.uid()
    )
  );

-- Function to update obra totals when items are added/updated/deleted
CREATE OR REPLACE FUNCTION update_obra_totals_from_items()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.obras
  SET total_presupuestado = (
    SELECT COALESCE(SUM(precio), 0)
    FROM public.items_presupuesto
    WHERE obra_id = COALESCE(NEW.obra_id, OLD.obra_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.obra_id, OLD.obra_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for items_presupuesto
CREATE TRIGGER update_obra_totals_after_item_insert
  AFTER INSERT ON public.items_presupuesto
  FOR EACH ROW EXECUTE FUNCTION update_obra_totals_from_items();

CREATE TRIGGER update_obra_totals_after_item_update
  AFTER UPDATE ON public.items_presupuesto
  FOR EACH ROW EXECUTE FUNCTION update_obra_totals_from_items();

CREATE TRIGGER update_obra_totals_after_item_delete
  AFTER DELETE ON public.items_presupuesto
  FOR EACH ROW EXECUTE FUNCTION update_obra_totals_from_items();

-- Function to update obra totals when gastos are added/updated/deleted
CREATE OR REPLACE FUNCTION update_obra_totals_from_gastos()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.obras
  SET total_gastado = (
    SELECT COALESCE(SUM(monto), 0)
    FROM public.gastos
    WHERE obra_id = COALESCE(NEW.obra_id, OLD.obra_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.obra_id, OLD.obra_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for gastos
CREATE TRIGGER update_obra_totals_after_gasto_insert
  AFTER INSERT ON public.gastos
  FOR EACH ROW EXECUTE FUNCTION update_obra_totals_from_gastos();

CREATE TRIGGER update_obra_totals_after_gasto_update
  AFTER UPDATE ON public.gastos
  FOR EACH ROW EXECUTE FUNCTION update_obra_totals_from_gastos();

CREATE TRIGGER update_obra_totals_after_gasto_delete
  AFTER DELETE ON public.gastos
  FOR EACH ROW EXECUTE FUNCTION update_obra_totals_from_gastos();