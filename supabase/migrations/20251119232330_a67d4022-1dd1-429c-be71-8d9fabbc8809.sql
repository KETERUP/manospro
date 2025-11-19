-- Primero eliminar el trigger existente si hay problemas
DROP TRIGGER IF EXISTS update_ganancia_neta_trigger ON obras;

-- Recrear la función del trigger con mejor lógica
CREATE OR REPLACE FUNCTION update_ganancia_neta()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular ganancia_neta = monto_total - total_gastado
  -- Usar COALESCE para manejar valores NULL
  NEW.ganancia_neta = COALESCE(NEW.monto_total, 0) - COALESCE(NEW.total_gastado, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recrear el trigger
CREATE TRIGGER update_ganancia_neta_trigger
BEFORE INSERT OR UPDATE OF monto_total, total_gastado ON obras
FOR EACH ROW
EXECUTE FUNCTION update_ganancia_neta();

-- Forzar actualización de todos los proyectos existentes
-- Actualizar un campo para disparar el trigger
UPDATE obras SET monto_total = COALESCE(monto_total, 0) WHERE true;