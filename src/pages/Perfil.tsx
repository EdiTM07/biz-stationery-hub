import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { User, Mail, Phone, Calendar, Shield } from 'lucide-react';

interface Profile {
  id: string;
  nombre_completo: string;
  email: string;
  telefono: string | null;
  activo: boolean;
  created_at: string;
}

export default function Perfil() {
  const { user, userRole } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre_completo: '',
    telefono: '',
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setFormData({
        nombre_completo: data.nombre_completo,
        telefono: data.telefono || '',
      });
    } catch (error: any) {
      toast.error('Error al cargar perfil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nombre_completo: formData.nombre_completo,
          telefono: formData.telefono || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Perfil actualizado exitosamente');
      setIsEditing(false);
      fetchProfile();
    } catch (error: any) {
      toast.error('Error al actualizar perfil: ' + error.message);
    }
  };

  const getRoleBadge = (role: string | null) => {
    const roleMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
      administrador: { label: 'Administrador', variant: 'destructive' },
      cajero: { label: 'Cajero', variant: 'default' },
      empleado: { label: 'Empleado', variant: 'secondary' },
    };

    const roleInfo = role ? roleMap[role] : { label: 'Sin rol', variant: 'secondary' as const };
    return <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No se pudo cargar el perfil</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Mi Perfil</CardTitle>
          <CardDescription>
            Visualiza y actualiza tu información personal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Información de solo lectura */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <Label>Nombre Completo</Label>
              </div>
              {isEditing ? (
                <Input
                  value={formData.nombre_completo}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre_completo: e.target.value })
                  }
                  required
                />
              ) : (
                <p className="text-lg font-medium">{profile.nombre_completo}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <Label>Email</Label>
              </div>
              <p className="text-lg font-medium">{profile.email}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <Label>Teléfono</Label>
              </div>
              {isEditing ? (
                <Input
                  value={formData.telefono}
                  onChange={(e) =>
                    setFormData({ ...formData, telefono: e.target.value })
                  }
                  placeholder="Agregar teléfono"
                />
              ) : (
                <p className="text-lg font-medium">{profile.telefono || 'No especificado'}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-4 w-4" />
                <Label>Rol</Label>
              </div>
              <div>{getRoleBadge(userRole)}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <Label>Miembro desde</Label>
              </div>
              <p className="text-lg font-medium">
                {new Date(profile.created_at).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <div>
                <Badge variant={profile.activo ? 'default' : 'secondary'}>
                  {profile.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-4 pt-4">
            {isEditing ? (
              <>
                <Button onClick={handleSubmit}>Guardar Cambios</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      nombre_completo: profile.nombre_completo,
                      telefono: profile.telefono || '',
                    });
                  }}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Editar Perfil</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
