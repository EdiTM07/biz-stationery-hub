import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UserPlus, Shield, ShieldOff } from 'lucide-react';
import { Navigate } from 'react-router-dom';

interface UserWithRole {
  id: string;
  nombre_completo: string;
  email: string;
  telefono: string | null;
  activo: boolean;
  created_at: string;
  role: 'administrador' | 'cajero' | 'empleado' | null;
}

export default function AdminPanel() {
  const { userRole } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    nombre_completo: '',
    telefono: '',
    role: 'empleado' as 'administrador' | 'cajero' | 'empleado',
  });

  // Redirigir si no es administrador
  if (userRole && userRole !== 'administrador') {
    return <Navigate to="/perfil" replace />;
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users_with_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast.error('Error al cargar usuarios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Crear usuario en Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            nombre_completo: newUser.nombre_completo,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No se pudo crear el usuario');

      // Crear perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          nombre_completo: newUser.nombre_completo,
          email: newUser.email,
          telefono: newUser.telefono || null,
          activo: true,
        });

      if (profileError) throw profileError;

      // Asignar rol
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: newUser.role,
        });

      if (roleError) throw roleError;

      toast.success('Usuario creado exitosamente');
      setIsCreateDialogOpen(false);
      setNewUser({
        email: '',
        password: '',
        nombre_completo: '',
        telefono: '',
        role: 'empleado',
      });
      fetchUsers();
    } catch (error: any) {
      toast.error('Error al crear usuario: ' + error.message);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ activo: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      toast.success(
        `Usuario ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`
      );
      fetchUsers();
    } catch (error: any) {
      toast.error('Error al cambiar estado: ' + error.message);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'administrador' | 'cajero' | 'empleado') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Rol actualizado exitosamente');
      fetchUsers();
    } catch (error: any) {
      toast.error('Error al actualizar rol: ' + error.message);
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl">Panel de Administración</CardTitle>
              <CardDescription>
                Gestiona usuarios, roles y permisos del sistema
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Crear Usuario
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                  <DialogDescription>
                    Completa los datos para crear un nuevo usuario en el sistema
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <Label htmlFor="nombre_completo">Nombre Completo</Label>
                    <Input
                      id="nombre_completo"
                      value={newUser.nombre_completo}
                      onChange={(e) =>
                        setNewUser({ ...newUser, nombre_completo: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefono">Teléfono (opcional)</Label>
                    <Input
                      id="telefono"
                      value={newUser.telefono}
                      onChange={(e) => setNewUser({ ...newUser, telefono: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Rol</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value: 'administrador' | 'cajero' | 'empleado') =>
                        setNewUser({ ...newUser, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="empleado">Empleado</SelectItem>
                        <SelectItem value="cajero">Cajero</SelectItem>
                        <SelectItem value="administrador">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">
                    Crear Usuario
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.nombre_completo}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.telefono || '-'}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role || 'empleado'}
                      onValueChange={(value: 'administrador' | 'cajero' | 'empleado') =>
                        updateUserRole(user.id, value)
                      }
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="empleado">Empleado</SelectItem>
                        <SelectItem value="cajero">Cajero</SelectItem>
                        <SelectItem value="administrador">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.activo ? 'default' : 'secondary'}>
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleUserStatus(user.id, user.activo)}
                    >
                      {user.activo ? (
                        <>
                          <ShieldOff className="mr-2 h-4 w-4" />
                          Desactivar
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          Activar
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
