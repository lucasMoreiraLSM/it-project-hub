
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
    if (!projectId) return { hasLock: false, lockInfo: null };

    try {
      console.log('Verificando bloqueio existente para projeto:', projectId);
      
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
        return { hasLock: false, lockInfo: null };
      }

      if (locks) {
        console.log('Bloqueio encontrado:', locks);
        setIsLocked(true);
        setLockInfo(locks);
        setIsOwnLock(locks.user_id === user?.id);
        if (locks.user_id === user?.id) {
          setLockId(locks.id);
        }
        
        return { hasLock: true, lockInfo: locks };
      } else {
        console.log('Nenhum bloqueio encontrado');
        setIsLocked(false);
        setLockInfo(null);
        setIsOwnLock(false);
        setLockId(null);
        return { hasLock: false, lockInfo: null };
      }
    } catch (error) {
      console.error('Erro ao verificar bloqueio:', error);
      return { hasLock: false, lockInfo: null };
    }
  }, [projectId, user?.id]);

  const acquireLock = useCallback(async (): Promise<boolean> => {
    if (!user || !projectId) {
      console.log('Usuário ou projeto não definido');
      return false;
    }

    try {
      setIsLoading(true);
      console.log('Tentando adquirir bloqueio para projeto:', projectId, 'usuário:', user.id);
      
      // Limpar bloqueios expirados primeiro
      await supabase.rpc('cleanup_expired_locks');

      // Verificar se já existe bloqueio ativo
      const { data: existingLock, error: checkError } = await supabase
        .from('project_locks')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Erro ao verificar bloqueio existente:', checkError);
        throw checkError;
      }

      if (existingLock) {
        if (existingLock.user_id === user.id) {
          // Já é nosso bloqueio
          console.log('Bloqueio já pertence ao usuário atual');
          setIsLocked(true);
          setIsOwnLock(true);
          setLockId(existingLock.id);
          setLockInfo(existingLock);
          return true;
        } else {
          // Projeto bloqueado por outro usuário
          console.log('Projeto bloqueado por outro usuário:', existingLock.user_name);
          toast({
            title: "Projeto em edição",
            description: `Este projeto está sendo editado por ${existingLock.user_name}`,
            variant: "destructive",
          });
          setIsLocked(true);
          setIsOwnLock(false);
          setLockInfo(existingLock);
          return false;
        }
      }

      // Tentar criar o bloqueio
      console.log('Criando novo bloqueio...');
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
        console.error('Erro ao criar bloqueio:', error);
        if (error.code === '23505') { // Violação de chave única
          // Verificar novamente se alguém criou o bloqueio no meio tempo
          const recheck = await checkLock();
          if (recheck.hasLock && recheck.lockInfo?.user_id !== user.id) {
            toast({
              title: "Projeto em edição",
              description: `Este projeto está sendo editado por ${recheck.lockInfo?.user_name}`,
              variant: "destructive",
            });
          }
          return false;
        }
        toast({
          title: "Erro",
          description: "Não foi possível bloquear o projeto para edição.",
          variant: "destructive",
        });
        return false;
      }

      // Bloqueio criado com sucesso
      console.log('Bloqueio criado com sucesso:', data);
      setIsLocked(true);
      setIsOwnLock(true);
      setLockId(data.id);
      setLockInfo(data);
      
      toast({
        title: "Modo de edição ativo",
        description: "Você agora pode editar este projeto.",
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
    if (!lockId) {
      console.log('Nenhum bloqueio para liberar');
      return true;
    }

    try {
      setIsLoading(true);
      console.log('Liberando bloqueio:', lockId);
      
      const { error } = await supabase
        .from('project_locks')
        .delete()
        .eq('id', lockId);

      if (error) {
        console.error('Erro ao liberar bloqueio:', error);
        throw error;
      }

      console.log('Bloqueio liberado com sucesso');
      setIsLocked(false);
      setLockInfo(null);
      setIsOwnLock(false);
      setLockId(null);
      
      if (showToast) {
        toast({
          title: "Edição finalizada",
          description: "O projeto foi liberado para edição por outros usuários.",
        });
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao liberar bloqueio:', error);
      if (showToast) {
        toast({
          title: "Erro",
          description: "Erro ao liberar bloqueio do projeto.",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [lockId, toast]);

  const renewLock = useCallback(async () => {
    if (!lockId) return;

    try {
      console.log('Renovando bloqueio:', lockId);
      const { error } = await supabase
        .from('project_locks')
        .update({
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
        })
        .eq('id', lockId);

      if (error) throw error;
      console.log('Bloqueio renovado com sucesso');
    } catch (error) {
      console.error('Erro ao renovar bloqueio:', error);
    }
  }, [lockId]);

  // Verificar bloqueio inicial quando o componente monta
  useEffect(() => {
    if (projectId) {
      checkLock();
    }
  }, [projectId, checkLock]);

  // Renovar bloqueio automaticamente se for nosso
  useEffect(() => {
    if (!isOwnLock || !lockId) return;

    const interval = setInterval(renewLock, 5 * 60 * 1000); // Renovar a cada 5 minutos

    return () => clearInterval(interval);
  }, [isOwnLock, lockId, renewLock]);

  // Liberar bloqueio quando sair da página ou recarregar
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (lockId) {
        console.log('Página sendo fechada, liberando bloqueio via beacon');
        const url = `https://skdrkfwymmgssluhakwl.supabase.co/rest/v1/project_locks?id=eq.${lockId}`;
        const headers = {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrZHJrZnd5bW1nc3NsdWhha3dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NDgwOTYsImV4cCI6MjA2MTQyNDA5Nn0.Hez1eKgXjBTQvY7qi3WxN5ZZDiGAdvTKathEeO0ZCb8',
          'Content-Type': 'application/json'
        };
        
        try {
          fetch(url, {
            method: 'DELETE',
            headers: headers,
            keepalive: true
          });
        } catch (error) {
          console.error('Erro ao liberar bloqueio no beforeunload:', error);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && lockId) {
        console.log('Página ficou oculta, liberando bloqueio');
        releaseLock(false);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (lockId) {
        releaseLock(false);
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
    checkLock
  };
};
