-- Eliminar la vista con SECURITY DEFINER y crear una vista normal
DROP VIEW IF EXISTS public.users_with_roles;

-- Crear vista sin SECURITY DEFINER (esto respeta las políticas RLS)
CREATE VIEW public.users_with_roles AS
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