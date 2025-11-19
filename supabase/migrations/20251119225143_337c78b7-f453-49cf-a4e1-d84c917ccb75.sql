-- Agregar campos financieros a la tabla obras
ALTER TABLE public.obras 
ADD COLUMN IF NOT EXISTS monto_total NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS monto_adelantado NUMERIC DEFAULT 0;

-- Agregar comentarios descriptivos
COMMENT ON COLUMN public.obras.monto_total IS 'Valor total acordado del proyecto';
COMMENT ON COLUMN public.obras.monto_adelantado IS 'Monto que el cliente ya ha pagado (adelanto)';
COMMENT ON COLUMN public.obras.total_gastado IS 'Total gastado por el maestro en materiales y mano de obra';
COMMENT ON COLUMN public.obras.ganancia_neta IS 'Ganancia calculada: monto_total - total_gastado';

-- Función para actualizar ganancia_neta automáticamente
CREATE OR REPLACE FUNCTION public.update_ganancia_neta()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.ganancia_neta = COALESCE(NEW.monto_total, 0) - COALESCE(NEW.total_gastado, 0);
  RETURN NEW;
END;
$$;

-- Trigger que se ejecuta antes de INSERT o UPDATE
DROP TRIGGER IF EXISTS trigger_update_ganancia_neta ON public.obras;
CREATE TRIGGER trigger_update_ganancia_neta
BEFORE INSERT OR UPDATE OF monto_total, total_gastado ON public.obras
FOR EACH ROW
EXECUTE FUNCTION public.update_ganancia_neta();