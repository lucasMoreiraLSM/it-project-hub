import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Users, Mail, ArrowLeft, Trash2, AlertTriangle } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  nome: string;
  perfil: 'administrador' | 'gerencia' | 'colaborador';
  created_at: string;
}

interface UserManagementProps {
  onBack?: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ onBack }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserProfile, setNewUserProfile] = useState<'administrador' | 'gerencia' | 'colaborador'>('colaborador');
  const [inviting, setInviting] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [userDependencies, setUserDependencies] = useState<{[key: string]: { projects: number, isCreator: boolean, isLeader: boolean, isManager: boolean }} | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkUserDependencies = async (userId: string) => {
    try {
      // Check for projects where user is involved
      const [createdProjects, leaderProjects, managerProjects] = await Promise.all([
        supabase.from('projetos').select('id, nome').eq('created_by_user_id', userId),
        supabase.from('projetos').select('id, nome').eq('lider_projeto_user_id', userId),
        supabase.from('projetos').select('id, nome').eq('gerente_projetos_user_id', userId)
      ]);

      const totalProjects = new Set([
        ...(createdProjects.data || []).map(p => p.id),
        ...(leaderProjects.data || []).map(p => p.id),
        ...(managerProjects.data || []).map(p => p.id)
      ]).size;

      return {
        projects: totalProjects,
        isCreator: (createdProjects.data || []).length > 0,
        isLeader: (leaderProjects.data || []).length > 0,
        isManager: (managerProjects.data || []).length > 0
      };
    } catch (error) {
      console.error('Erro ao verificar dependências do usuário:', error);
      return { projects: 0, isCreator: false, isLeader: false, isManager: false };
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const inviteUser = async () => {
    if (!newUserEmail || !newUserName) {
      toast({
        title: "Erro",
        description: "Email e nome são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    // Check if user already exists in the local list
    const existingUser = users.find(user => user.email.toLowerCase() === newUserEmail.toLowerCase());
    if (existingUser) {
      toast({
        title: "Erro",
        description: "Um usuário com este email já existe no sistema",
        variant: "destructive",
      });
      return;
    }

    setInviting(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-tasks', {
        body: {
          action: 'invite_user',
          email: newUserEmail,
          user_metadata: {
            nome: newUserName,
            perfil: newUserProfile
          }
        }
      });

      if (error) {
        console.error('Erro na chamada da edge function:', error);
        throw new Error('Falha na comunicação com o servidor');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Sucesso",
        description: "Convite enviado com sucesso! O usuário receberá um email com instruções para acessar o sistema.",
      });

      setNewUserEmail('');
      setNewUserName('');
      setNewUserProfile('colaborador');
      await fetchUsers();
    } catch (error: any) {
      console.error('Erro ao convidar usuário:', error);
      let errorMessage = "Erro ao enviar convite";
      
      if (error.message?.includes('já está registrado') || error.message?.includes('already been registered')) {
        errorMessage = "Um usuário com este email já está registrado no sistema";
      } else if (error.message?.includes('Falha na comunicação')) {
        errorMessage = "Erro de comunicação com o servidor. Tente novamente.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setInviting(false);
    }
  };

  const updateUserProfile = async (userId: string, newProfile: 'administrador' | 'gerencia' | 'colaborador') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ perfil: newProfile })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      });

      await fetchUsers();
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil do usuário",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const dependencies = await checkUserDependencies(userId);
    setUserDependencies({[userId]: dependencies});
  };

  const confirmDeleteUser = async (userId: string) => {
    setDeletingUserId(userId);
    try {
      const { data, error } = await supabase.functions.invoke('admin-tasks', {
        body: {
          action: 'delete_user',
          user_id: userId
        }
      });

      if (error) {
        console.error('Erro na chamada da edge function:', error);
        throw new Error('Falha na comunicação com o servidor');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Sucesso",
        description: data.message || "Usuário excluído com sucesso!",
      });

      await fetchUsers();
      setUserDependencies(null);
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      let errorMessage = "Erro ao excluir usuário";
      
      if (error.message?.includes('Falha na comunicação')) {
        errorMessage = "Erro de comunicação com o servidor. Tente novamente.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setDeletingUserId(null);
    }
  };

  const getDependenciesMessage = (dependencies: { projects: number, isCreator: boolean, isLeader: boolean, isManager: boolean }) => {
    const roles = [];
    if (dependencies.isCreator) roles.push('criador');
    if (dependencies.isLeader) roles.push('líder');
    if (dependencies.isManager) roles.push('gerente');

    if (dependencies.projects === 0) {
      return "Este usuário não possui projetos associados.";
    }

    return `Este usuário está associado a ${dependencies.projects} projeto(s) como ${roles.join(', ')}. Todas as associações serão removidas automaticamente.`;
  };

  const getProfileBadgeVariant = (profile: string) => {
    switch (profile) {
      case 'administrador':
        return 'destructive';
      case 'gerencia':
        return 'default';
      case 'colaborador':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Carregando usuários...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
          </div>
          {onBack && (
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          )}
        </div>

        {/* Convidar novo usuário */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Convidar Novo Usuário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="usuario@exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label htmlFor="profile">Perfil</Label>
                <Select value={newUserProfile} onValueChange={(value: any) => setNewUserProfile(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="colaborador">Colaborador</SelectItem>
                    <SelectItem value="gerencia">Gerência</SelectItem>
                    <SelectItem value="administrador">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={inviteUser} disabled={inviting} className="w-full flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {inviting ? 'Enviando...' : 'Enviar Convite'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de usuários */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Perfil Atual</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead>Alterar Perfil</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nome || 'Nome não informado'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getProfileBadgeVariant(user.perfil)}>
                        {user.perfil === 'administrador' ? 'Administrador' : 
                         user.perfil === 'gerencia' ? 'Gerência' : 'Colaborador'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={user.perfil} 
                        onValueChange={(value: any) => updateUserProfile(user.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="colaborador">Colaborador</SelectItem>
                          <SelectItem value="gerencia">Gerência</SelectItem>
                          <SelectItem value="administrador">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <AlertDialog 
                        open={userDependencies && userDependencies[user.id] !== undefined} 
                        onOpenChange={(open) => !open && setUserDependencies(null)}
                      >
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={deletingUserId === user.id}
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-amber-500" />
                              Confirmar exclusão
                            </AlertDialogTitle>
                            <AlertDialogDescription className="space-y-3">
                              <p>
                                Tem certeza que deseja excluir o usuário <strong>{user.nome || user.email}</strong>?
                              </p>
                              {userDependencies && userDependencies[user.id] && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                                  <p className="text-sm text-amber-800">
                                    <strong>Aviso:</strong> {getDependenciesMessage(userDependencies[user.id])}
                                  </p>
                                </div>
                              )}
                              <p className="text-sm text-gray-600">
                                Esta ação não pode ser desfeita e todos os dados do usuário serão removidos permanentemente.
                              </p>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => confirmDeleteUser(user.id)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={deletingUserId === user.id}
                            >
                              {deletingUserId === user.id ? 'Excluindo...' : 'Excluir Usuário'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
