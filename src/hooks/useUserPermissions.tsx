import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export type UserProfile = 'administrador' | 'gerencia' | 'colaborador';

interface UserPermissions {
  profile: UserProfile | null;
  canDeleteProjects: boolean;
  canManageUsers: boolean;
  loading: boolean;
}

export const useUserPermissions = (): UserPermissions => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('perfil')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setProfile(data?.perfil || 'colaborador');
      } catch (error: any) {
        console.error('Erro ao buscar perfil do usuário:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar perfil do usuário",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, toast]);

  return {
    profile,
    canDeleteProjects: profile === 'administrador' || profile === 'gerencia',
    canManageUsers: profile === 'administrador',
    loading
  };
};
