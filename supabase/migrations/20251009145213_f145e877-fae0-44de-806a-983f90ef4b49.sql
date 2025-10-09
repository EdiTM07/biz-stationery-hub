-- Tabla de roles de usuario
CREATE TYPE public.app_role AS ENUM ('administrador', 'cajero', 'empleado');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'empleado',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Función para verificar roles (security definer para evitar recursión)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Políticas RLS para user_roles
CREATE POLICY "Los usuarios pueden ver su propio rol"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Solo administradores pueden insertar roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Solo administradores pueden actualizar roles"
ON public.user_roles FOR UPDATE
USING (public.has_role(auth.uid(), 'administrador'));

-- Tabla de perfiles de usuario
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_completo TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver todos los perfiles"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden insertar su propio perfil"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Tabla de categorías de productos
CREATE TABLE public.categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver categorías"
ON public.categorias FOR SELECT
USING (true);

CREATE POLICY "Solo administradores pueden crear categorías"
ON public.categorias FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Solo administradores pueden actualizar categorías"
ON public.categorias FOR UPDATE
USING (public.has_role(auth.uid(), 'administrador'));

CREATE POLICY "Solo administradores pueden eliminar categorías"
ON public.categorias FOR DELETE
USING (public.has_role(auth.uid(), 'administrador'));

-- Tabla de productos
CREATE TABLE public.productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria_id UUID REFERENCES public.categorias(id),
  precio_compra DECIMAL(10,2) NOT NULL DEFAULT 0,
  precio_venta DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  stock_minimo INTEGER DEFAULT 5,
  imagen_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver productos"
ON public.productos FOR SELECT
USING (true);

CREATE POLICY "Solo administradores y cajeros pueden crear productos"
ON public.productos FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'administrador') OR 
  public.has_role(auth.uid(), 'cajero')
);

CREATE POLICY "Solo administradores y cajeros pueden actualizar productos"
ON public.productos FOR UPDATE
USING (
  public.has_role(auth.uid(), 'administrador') OR 
  public.has_role(auth.uid(), 'cajero')
);

CREATE POLICY "Solo administradores pueden eliminar productos"
ON public.productos FOR DELETE
USING (public.has_role(auth.uid(), 'administrador'));

-- Tabla de clientes
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  direccion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos los usuarios autenticados pueden ver clientes"
ON public.clientes FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Todos los usuarios autenticados pueden crear clientes"
ON public.clientes FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Todos los usuarios autenticados pueden actualizar clientes"
ON public.clientes FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Solo administradores pueden eliminar clientes"
ON public.clientes FOR DELETE
USING (public.has_role(auth.uid(), 'administrador'));

-- Tabla de ventas
CREATE TABLE public.ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_factura TEXT UNIQUE NOT NULL,
  cliente_id UUID REFERENCES public.clientes(id),
  usuario_id UUID REFERENCES auth.users(id) NOT NULL,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  metodo_pago TEXT NOT NULL DEFAULT 'efectivo',
  estado TEXT NOT NULL DEFAULT 'completada',
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.ventas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos los usuarios autenticados pueden ver ventas"
ON public.ventas FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Todos los usuarios autenticados pueden crear ventas"
ON public.ventas FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Tabla de detalle de ventas
CREATE TABLE public.detalle_ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venta_id UUID REFERENCES public.ventas(id) ON DELETE CASCADE NOT NULL,
  producto_id UUID REFERENCES public.productos(id) NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.detalle_ventas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos los usuarios autenticados pueden ver detalle de ventas"
ON public.detalle_ventas FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Todos los usuarios autenticados pueden crear detalle de ventas"
ON public.detalle_ventas FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Tabla de servicios de impresión
CREATE TABLE public.servicios_impresion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id),
  tipo_servicio TEXT NOT NULL,
  descripcion TEXT,
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio DECIMAL(10,2) NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  fecha_entrega TIMESTAMP WITH TIME ZONE,
  usuario_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.servicios_impresion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos los usuarios autenticados pueden ver servicios"
ON public.servicios_impresion FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Todos los usuarios autenticados pueden crear servicios"
ON public.servicios_impresion FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Todos los usuarios autenticados pueden actualizar servicios"
ON public.servicios_impresion FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Tabla de recargas celulares
CREATE TABLE public.recargas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_telefono TEXT NOT NULL,
  operador TEXT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  comision DECIMAL(10,2) DEFAULT 0,
  usuario_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.recargas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos los usuarios autenticados pueden ver recargas"
ON public.recargas FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Todos los usuarios autenticados pueden crear recargas"
ON public.recargas FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Triggers para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_productos_updated_at
BEFORE UPDATE ON public.productos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at
BEFORE UPDATE ON public.clientes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_servicios_updated_at
BEFORE UPDATE ON public.servicios_impresion
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insertar algunas categorías por defecto
INSERT INTO public.categorias (nombre, descripcion) VALUES
  ('Papelería', 'Productos de papelería general'),
  ('Útiles Escolares', 'Material escolar y educativo'),
  ('Oficina', 'Artículos de oficina'),
  ('Impresión', 'Servicios y productos de impresión'),
  ('Tecnología', 'Productos tecnológicos y accesorios');