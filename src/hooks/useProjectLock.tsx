
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ProjectLock {
  id: string;
  project_id: string;
  user_id: string;
  user_name: string;
  locked_at: string;
  expires_at: string;
}

export const useProjectLock = (projectId: string) => {
  const [isLocked, setIsLocked] = useState(false);
  const [lockInfo, setLockInfo] = useState<ProjectLock | null>(null);
  const [isOwnLock, setIsOwnLock] = useState(false);
  const [lockId, setLockId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const checkLock = useCallback(async () => {
    if (!projectId) return;

    try {
      setIsLoading(true);
      
      // Primeiro, limpar bloqueios expirados
      await supabase.rpc('cleanup_expired_locks');

      // Verificar se existe bloqueio ativo
      const { data: locks, error } = await supabase
        .from('project_locks')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao verificar bloqueio:', error);
        return;
      }

      if (locks) {
        setIsLocked(true);
        setLockInfo(locks);
        setIsOwnLock(locks.user_id === user?.id);
        if (locks.user_id === user?.id) {
          setLockId(locks.id);
        }
      } else {
        setIsLocked(false);
        setLockInfo(null);
        setIsOwnLock(false);
        setLockId(null);
      }
    } catch (error) {
      console.error('Erro ao verificar bloqueio:', error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, user?.id]);

  const acquireLock = useCallback(async (): Promise<boolean> => {
    if (!user || !projectId) return false;

    try {
      setIsLoading(true);
      
      // Primeiro, limpar bloqueios expirados
      await supabase.rpc('cleanup_expired_locks');

      // Tentar criar o bloqueio
      const { data, error } = await supabase
        .from('project_locks')
        .insert({
          project_id: projectId,
          user_id: user.id,
          user_name: user.email || 'Usuário Desconhecido'
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Violação de chave única - projeto já bloqueado
          await checkLock();
          toast({
            title: "Projeto já bloqueado",
            description: "Este projeto está sendo editado por outro usuário.",
            variant: "destructive",
          });
          return false;
        }
        throw error;
      }

      setIsLocked(true);
      setIsOwnLock(true);
      setLockId(data.id);
      setLockInfo(data);
      
      toast({
        title: "Projeto bloqueado",
        description: "Você agora tem controle exclusivo para editar este projeto.",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao adquirir bloqueio:', error);
      toast({
        title: "Erro",
        description: "Não foi possível bloquear o projeto para edição.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, projectId, checkLock, toast]);

  const releaseLock = useCallback(async (showToast: boolean = true) => {
    if (!lockId) return;

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('project_locks')
        .delete()
        .eq('id', lockId);

      if (error) throw error;

      setIsLocked(false);
      setLockInfo(null);
      setIsOwnLock(false);
      setLockId(null);
      
      if (showToast) {
        toast({
          title: "Projeto desbloqueado",
          description: "O projeto foi liberado para edição por outros usuários.",
        });
      }
      
      console.log('Bloqueio liberado com sucesso');
    } catch (error) {
      console.error('Erro ao liberar bloqueio:', error);
      if (showToast) {
        toast({
          title: "Erro",
          description: "Erro ao liberar bloqueio do projeto.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [lockId, toast]);

  const forceUnlock = useCallback(async () => {
    if (!user || !projectId || !isOwnLock) return false;

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('project_locks')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', user.id);

      if (error) throw error;

      setIsLocked(false);
      setLockInfo(null);
      setIsOwnLock(false);
      setLockId(null);
      
      toast({
        title: "Bloqueio removido",
        description: "Você removeu seu próprio bloqueio do projeto.",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao forçar desbloqueio:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover bloqueio do projeto.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, projectId, isOwnLock, toast]);

  const renewLock = useCallback(async () => {
    if (!lockId) return;

    try {
      const { error } = await supabase
        .from('project_locks')
        .update({
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutos a partir de agora
        })
        .eq('id', lockId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao renovar bloqueio:', error);
    }
  }, [lockId]);

  // Verificar bloqueio com menos frequência para melhorar performance
  useEffect(() => {
    if (!projectId) return;

    checkLock();
    const interval = setInterval(checkLock, 45000); // Verificar a cada 45 segundos

    return () => clearInterval(interval);
  }, [checkLock, projectId]);

  // Renovar bloqueio automaticamente se for nosso
  useEffect(() => {
    if (!isOwnLock || !lockId) return;

    const interval = setInterval(renewLock, 5 * 60 * 1000); // Renovar a cada 5 minutos

    return () => clearInterval(interval);
  }, [isOwnLock, lockId, renewLock]);

  // Liberar bloqueio quando sair da página ou recarregar
  useEffect(() => {
    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      if (lockId) {
        // Para beforeunload, usar sendBeacon para garantir que a requisição seja enviada
        const deletePayload = {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrZHJrZnd5bW1nc3NsdWhha3dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NDgwOTYsImV4cCI6MjA2MTQyNDA5Nn0.Hez1eKgXjBTQvY7qi3WxN5ZZDiGAdvTKathEeO0ZCb8'
          },
          body: JSON.stringify({})
        };
        
        navigator.sendBeacon(
          `https://skdrkfwymmgssluhakwl.supabase.co/rest/v1/project_locks?id=eq.${lockId}`,
          JSON.stringify(deletePayload)
        );
      }
    };

    // Adicionar listener para beforeunload
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup quando o componente for desmontado
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Liberar bloqueio de forma assíncrona quando o componente for desmontado
      if (lockId) {
        releaseLock(false); // Não mostrar toast ao desmontar
      }
    };
  }, [lockId, releaseLock]);

  return {
    isLocked,
    lockInfo,
    isOwnLock,
    isLoading,
    acquireLock,
    releaseLock,
    forceUnlock,
    checkLock
  };
};
