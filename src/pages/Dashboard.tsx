import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProductos: 0,
    totalClientes: 0,
    ventasHoy: 0,
    serviciosPendientes: 0,
    productosStockBajo: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [productos, clientes, ventas, servicios, stockBajo] = await Promise.all([
        supabase.from('productos').select('id', { count: 'exact', head: true }),
        supabase.from('clientes').select('id', { count: 'exact', head: true }),
        supabase
          .from('ventas')
          .select('total')
          .gte('created_at', today.toISOString()),
        supabase
          .from('servicios_impresion')
          .select('id', { count: 'exact', head: true })
          .eq('estado', 'pendiente'),
        supabase.from('productos').select('id, stock, stock_minimo'),
      ]);

      const totalVentas = ventas.data?.reduce((sum, v) => sum + Number(v.total), 0) || 0;
      const productosConStockBajo = stockBajo.data?.filter(p => p.stock <= p.stock_minimo) || [];

      setStats({
        totalProductos: productos.count || 0,
        totalClientes: clientes.count || 0,
        ventasHoy: totalVentas,
        serviciosPendientes: servicios.count || 0,
        productosStockBajo: productosConStockBajo.length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Productos',
      value: stats.totalProductos,
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Clientes',
      value: stats.totalClientes,
      icon: Users,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Ventas Hoy',
      value: `$${stats.ventasHoy.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Servicios Pendientes',
      value: stats.serviciosPendientes,
      icon: TrendingUp,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido al sistema de gestión</p>
      </div>

      {/* Alert for low stock */}
      {stats.productosStockBajo > 0 && (
        <Card className="border-warning bg-warning/5">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <AlertCircle className="h-6 w-6 text-warning" />
            <div>
              <CardTitle className="text-lg">Alerta de Stock Bajo</CardTitle>
              <p className="text-sm text-muted-foreground">
                Hay {stats.productosStockBajo} productos con stock por debajo del mínimo
              </p>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <button className="flex flex-col items-center justify-center rounded-lg border border-border p-6 transition-colors hover:bg-secondary">
              <ShoppingCart className="mb-2 h-8 w-8 text-primary" />
              <span className="font-medium">Nueva Venta</span>
            </button>
            <button className="flex flex-col items-center justify-center rounded-lg border border-border p-6 transition-colors hover:bg-secondary">
              <Package className="mb-2 h-8 w-8 text-primary" />
              <span className="font-medium">Agregar Producto</span>
            </button>
            <button className="flex flex-col items-center justify-center rounded-lg border border-border p-6 transition-colors hover:bg-secondary">
              <Users className="mb-2 h-8 w-8 text-primary" />
              <span className="font-medium">Nuevo Cliente</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
