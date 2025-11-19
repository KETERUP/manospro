-- Crear empresa para Jorge
DO $$
DECLARE
  jorge_empresa_id uuid;
BEGIN
  -- Insertar empresa para Jorge
  INSERT INTO public.empresas (nombre, cif, direccion_fiscal, email, telefono)
  VALUES ('Empresa de Jorge', 'TEMP-JORGE', 'Por definir', 'jorge@email.com', 'Por definir')
  RETURNING id INTO jorge_empresa_id;

  -- Actualizar perfil de Jorge con empresa_id
  UPDATE public.profiles 
  SET empresa_id = jorge_empresa_id
  WHERE id = '498386de-9b58-4212-ac09-691c4a3a39b1';

  -- Asignar rol admin a Jorge
  INSERT INTO public.user_roles (user_id, empresa_id, role)
  VALUES ('498386de-9b58-4212-ac09-691c4a3a39b1', jorge_empresa_id, 'admin');
END $$;