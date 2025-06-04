
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
  const { user } = useAuth();
  const { toast } = useToast();

  const checkLock = useCallback(async () => {
    if (!projectId) return;

    try {
      // Primeiro, limpar bloqueios expirados
      await supabase.rpc('cleanup_expired_locks');

      // Verificar se existe bloqueio ativo
      const { data: locks, error } = await supabase
        .from('project_locks')
        .select('*')
        .eq('project_id', projectId)
        .single();

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
    }
  }, [projectId, user?.id]);

  const acquireLock = useCallback(async (): Promise<boolean> => {
    if (!user || !projectId) return false;

    try {
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
          return false;
        }
        throw error;
      }

      setIsLocked(true);
      setIsOwnLock(true);
      setLockId(data.id);
      setLockInfo(data);
      return true;
    } catch (error) {
      console.error('Erro ao adquirir bloqueio:', error);
      return false;
    }
  }, [user, projectId, checkLock]);

  const releaseLock = useCallback(async () => {
    if (!lockId) return;

    try {
      const { error } = await supabase
        .from('project_locks')
        .delete()
        .eq('id', lockId);

      if (error) throw error;

      setIsLocked(false);
      setLockInfo(null);
      setIsOwnLock(false);
      setLockId(null);
    } catch (error) {
      console.error('Erro ao liberar bloqueio:', error);
    }
  }, [lockId]);

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

  // Verificar bloqueio periodicamente
  useEffect(() => {
    if (!projectId) return;

    checkLock();
    const interval = setInterval(checkLock, 30000); // Verificar a cada 30 segundos

    return () => clearInterval(interval);
  }, [checkLock, projectId]);

  // Renovar bloqueio automaticamente se for nosso
  useEffect(() => {
    if (!isOwnLock || !lockId) return;

    const interval = setInterval(renewLock, 5 * 60 * 1000); // Renovar a cada 5 minutos

    return () => clearInterval(interval);
  }, [isOwnLock, lockId, renewLock]);

  // Liberar bloqueio quando sair da página
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (lockId) {
        // Usar navigator.sendBeacon para garantir que a requisição seja enviada
        navigator.sendBeacon(
          `https://skdrkfwymmgssluhakwl.supabase.co/rest/v1/project_locks?id=eq.${lockId}`,
          JSON.stringify({})
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      releaseLock();
    };
  }, [lockId, releaseLock]);

  return {
    isLocked,
    lockInfo,
    isOwnLock,
    acquireLock,
    releaseLock,
    checkLock
  };
};
