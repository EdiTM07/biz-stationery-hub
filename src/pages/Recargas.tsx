import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone } from 'lucide-react';

export default function Recargas() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recargas Celulares</h1>
        <p className="text-muted-foreground">Gestión de recargas</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Módulo en Desarrollo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Smartphone className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              El módulo de recargas celulares estará disponible próximamente
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
