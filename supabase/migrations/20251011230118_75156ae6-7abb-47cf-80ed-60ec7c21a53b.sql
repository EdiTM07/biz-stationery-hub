-- Agregar campo activo a profiles
ALTER TABLE public.profiles ADD COLUMN activo boolean NOT NULL DEFAULT true;

-- Crear índice para búsquedas más rápidas
CREATE INDEX idx_profiles_activo ON public.profiles(activo);

-- Crear políticas RLS para administración de usuarios
CREATE POLICY "Solo administradores pueden ver todos los perfiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id OR 
  has_role(auth.uid(), 'administrador'::app_role)
);

-- Permitir a administradores actualizar el estado activo de usuarios
CREATE POLICY "Solo administradores pueden actualizar perfiles de otros usuarios"
ON public.profiles
FOR UPDATE
USING (
  auth.uid() = id OR 
  has_role(auth.uid(), 'administrador'::app_role)
);

-- Crear vista para facilitar consultas de usuarios con roles
CREATE OR REPLACE VIEW public.users_with_roles AS
SELECT 
  p.id,
  p.nombre_completo,
  p.email,
  p.telefono,
  p.avatar_url,
  p.activo,
  p.created_at,
  ur.role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id;

-- Dar permisos de lectura a la vista
GRANT SELECT ON public.users_with_roles TO authenticated;