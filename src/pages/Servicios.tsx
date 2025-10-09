import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer } from 'lucide-react';

export default function Servicios() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Servicios de Impresión</h1>
        <p className="text-muted-foreground">Gestión de servicios</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Módulo en Desarrollo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Printer className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              El módulo de servicios de impresión estará disponible próximamente
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
