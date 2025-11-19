-- Eliminar la columna generada actual
ALTER TABLE obras 
DROP COLUMN IF EXISTS ganancia_neta;

-- Recrear ganancia_neta como columna generada usando monto_total
ALTER TABLE obras 
ADD COLUMN ganancia_neta NUMERIC 
GENERATED ALWAYS AS (COALESCE(monto_total, 0) - COALESCE(total_gastado, 0)) STORED;

-- Eliminar el trigger anterior ya que ahora usamos columna generada
DROP TRIGGER IF EXISTS update_ganancia_neta_trigger ON obras;