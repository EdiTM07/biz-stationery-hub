# Papelería Pro - Sistema de Gestión Integral

Sistema completo de gestión para papelerías con dashboard profesional, autenticación de usuarios, control de roles y módulos para inventario, ventas, clientes, facturación, servicios de impresión y recargas celulares.

## 🚀 Características Principales

- **Dashboard Administrativo**: Vista general con KPIs y métricas en tiempo real
- **Gestión de Inventario**: CRUD completo de productos con alertas de stock bajo
- **Punto de Venta (POS)**: Sistema de ventas rápido y eficiente
- **Gestión de Clientes**: Registro y seguimiento de clientes
- **Facturación**: Generación automática de facturas
- **Servicios de Impresión**: Control de trabajos de impresión
- **Recargas Celulares**: Registro de transacciones de recargas
- **Sistema de Roles**: Administrador, Cajero y Empleado
- **Autenticación Segura**: Login/registro con Lovable Cloud
- **Diseño Responsivo**: Funciona en escritorio, tablet y móvil

## 🛠️ Tecnologías

- **Frontend**: React 18 + Vite + TypeScript
- **Estilos**: TailwindCSS + Shadcn/ui
- **Backend**: Lovable Cloud (Supabase)
- **Base de Datos**: PostgreSQL
- **Autenticación**: Lovable Cloud Authentication
- **Despliegue**: Lovable Hosting

## 📦 Instalación Local

```bash
# Clonar el repositorio
git clone <YOUR_GIT_URL>

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## 🎯 Uso

1. **Registro de Usuario**: Crear una cuenta en `/auth`
2. **Inicio de Sesión**: Acceder con credenciales
3. **Dashboard**: Ver métricas y estadísticas principales
4. **Gestión de Módulos**: Navegar por inventario, ventas, clientes, etc.

## 👥 Roles de Usuario

- **Administrador**: Acceso completo al sistema
- **Cajero**: Gestión de ventas e inventario
- **Empleado**: Acceso limitado según permisos

## 🔒 Seguridad

- Autenticación con correo y contraseña
- Row Level Security (RLS) en todas las tablas
- Validación de entrada con Zod
- Protección de rutas sensibles
- Roles almacenados en tabla separada

## 📊 Base de Datos

El sistema utiliza Lovable Cloud con las siguientes tablas:

- `user_roles`: Roles de usuarios
- `profiles`: Perfiles de usuario
- `categorias`: Categorías de productos
- `productos`: Inventario de productos
- `clientes`: Registro de clientes
- `ventas`: Transacciones de venta
- `detalle_ventas`: Detalles de cada venta
- `servicios_impresion`: Servicios de impresión
- `recargas`: Recargas celulares

## 🎨 Personalización

El sistema utiliza un sistema de diseño basado en tokens CSS definidos en `src/index.css`. Para personalizar colores y estilos, edita las variables CSS en ese archivo.

## 📱 Despliegue

Para desplegar tu aplicación:

1. Haz clic en el botón "Publish" en Lovable
2. Tu app estará disponible en tu URL personalizada

## 🤝 Soporte

Para soporte y preguntas, visita la documentación de Lovable en https://docs.lovable.dev
