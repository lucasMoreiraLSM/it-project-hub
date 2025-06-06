
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ProjectLock } from '@/types/projectLock';
import { LOCK_RENEWAL_INTERVAL } from '@/utils/lockConstants';
import {
  checkProjectLock,
  createProjectLock,
  deleteProjectLock,
  renewProjectLock,
  releaseLockOnPageUnload
} from '@/utils/lockOperations';

export const useProjectLock = (projectId: string) => {
  const [isLocked, setIsLocked] = useState(false);
  const [lockInfo, setLockInfo] = useState<ProjectLock | null>(null);
  const [isOwnLock, setIsOwnLock] = useState(false);
  const [lockId, setLockId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const checkLock = useCallback(async () => {
    if (!projectId) {
      console.log('Project ID não fornecido para verificação');
      return { hasLock: false, lockInfo: null };
    }

    const result = await checkProjectLock(projectId);
    
    if (result.hasLock && result.lockInfo) {
      setIsLocked(true);
      setLockInfo(result.lockInfo);
      setIsOwnLock(result.lockInfo.user_id === user?.id);
      if (result.lockInfo.user_id === user?.id) {
        setLockId(result.lockInfo.id);
      }
    } else {
      setIsLocked(false);
      setLockInfo(null);
      setIsOwnLock(false);
      setLockId(null);
    }
    
    return result;
  }, [projectId, user?.id]);

  const acquireLock = useCallback(async (): Promise<boolean> => {
    if (!user || !projectId) {
      console.log('Usuário ou projeto não definido');
      toast({
        title: "Erro",
        description: "Usuário não autenticado ou projeto não definido.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsLoading(true);
      console.log('Tentando adquirir bloqueio para projeto:', projectId, 'usuário:', user.id);
      
      // Verificar se já existe bloqueio ativo
      const lockCheck = await checkLock();
      
      if (lockCheck.hasLock) {
        if (lockCheck.lockInfo?.user_id === user.id) {
          // Já é nosso bloqueio
          console.log('Bloqueio já pertence ao usuário atual');
          toast({
            title: "Modo de edição ativo",
            description: "Você já está editando este projeto.",
          });
          return true;
        } else {
          // Projeto bloqueado por outro usuário
          console.log('Projeto bloqueado por outro usuário:', lockCheck.lockInfo?.user_name);
          toast({
            title: "Projeto em edição",
            description: `Este projeto está sendo editado por ${lockCheck.lockInfo?.user_name}`,
            variant: "destructive",
          });
          return false;
        }
      }

      // Tentar criar o bloqueio
      const result = await createProjectLock(projectId, user.id, user.email || 'Usuário Desconhecido');
      
      if (!result.success) {
        console.error('Falha ao criar bloqueio:', result.error);
        toast({
          title: "Erro",
          description: result.error || "Não foi possível bloquear o projeto para edição.",
          variant: "destructive",
        });
        return false;
      }

      // Bloqueio criado com sucesso
      if (result.lock) {
        setIsLocked(true);
        setIsOwnLock(true);
        setLockId(result.lock.id);
        setLockInfo(result.lock);
        
        toast({
          title: "Modo de edição ativo",
          description: "Você agora pode editar este projeto.",
        });
        
        return true;
      }
      
      return false;
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
      
      const success = await deleteProjectLock(lockId);
      
      if (!success) {
        if (showToast) {
          toast({
            title: "Erro",
            description: "Erro ao liberar bloqueio do projeto.",
            variant: "destructive",
          });
        }
        return false;
      }

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
    const success = await renewProjectLock(lockId);
    if (!success) {
      console.warn('Falha ao renovar bloqueio');
    }
  }, [lockId]);

  // Verificar bloqueio inicial quando o componente monta
  useEffect(() => {
    if (projectId && user) {
      console.log('Verificando bloqueio inicial para projeto:', projectId);
      checkLock();
    }
  }, [projectId, user, checkLock]);

  // Renovar bloqueio automaticamente se for nosso
  useEffect(() => {
    if (!isOwnLock || !lockId) return;

    console.log('Iniciando renovação automática do bloqueio');
    const interval = setInterval(renewLock, LOCK_RENEWAL_INTERVAL);
    return () => {
      console.log('Parando renovação automática do bloqueio');
      clearInterval(interval);
    };
  }, [isOwnLock, lockId, renewLock]);

  // Liberar bloqueio quando sair da página ou recarregar
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (lockId) {
        console.log('beforeunload: liberando bloqueio');
        releaseLockOnPageUnload(lockId);
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
      
      // Liberar bloqueio ao desmontar o componente
      if (lockId) {
        console.log('Componente desmontado, liberando bloqueio');
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
