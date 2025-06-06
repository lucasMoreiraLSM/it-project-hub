
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

  // Verificar se o usuário e projectId estão disponíveis
  const isReady = Boolean(user?.id && projectId);

  console.log('useProjectLock - Estado atual:', {
    projectId,
    userId: user?.id,
    userEmail: user?.email,
    isReady,
    isLocked,
    isOwnLock,
    lockId
  });

  const checkLock = useCallback(async () => {
    if (!isReady) {
      console.log('useProjectLock - Não está pronto para verificar bloqueio:', { projectId, userId: user?.id });
      return { hasLock: false, lockInfo: null };
    }

    console.log('useProjectLock - Verificando bloqueio para:', { projectId, userId: user?.id });
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
  }, [projectId, user?.id, isReady]);

  const acquireLock = useCallback(async (): Promise<boolean> => {
    if (!isReady) {
      console.error('useProjectLock - Não é possível adquirir bloqueio, dados incompletos:', {
        projectId,
        userId: user?.id,
        userEmail: user?.email
      });
      toast({
        title: "Erro",
        description: "Usuário não autenticado ou projeto não definido.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsLoading(true);
      console.log('useProjectLock - Tentando adquirir bloqueio:', {
        projectId,
        userId: user!.id,
        userEmail: user!.email
      });
      
      // Verificar se já existe bloqueio ativo
      const lockCheck = await checkLock();
      
      if (lockCheck.hasLock) {
        if (lockCheck.lockInfo?.user_id === user!.id) {
          // Já é nosso bloqueio
          console.log('useProjectLock - Bloqueio já pertence ao usuário atual');
          toast({
            title: "Modo de edição ativo",
            description: "Você já está editando este projeto.",
          });
          return true;
        } else {
          // Projeto bloqueado por outro usuário
          console.log('useProjectLock - Projeto bloqueado por outro usuário:', lockCheck.lockInfo?.user_name);
          toast({
            title: "Projeto em edição",
            description: `Este projeto está sendo editado por ${lockCheck.lockInfo?.user_name}`,
            variant: "destructive",
          });
          return false;
        }
      }

      // Tentar criar o bloqueio
      console.log('useProjectLock - Criando novo bloqueio...');
      const result = await createProjectLock(projectId, user!.id, user!.email || 'Usuário Desconhecido');
      
      if (!result.success) {
        console.error('useProjectLock - Falha ao criar bloqueio:', result.error);
        toast({
          title: "Erro",
          description: result.error || "Não foi possível bloquear o projeto para edição.",
          variant: "destructive",
        });
        return false;
      }

      // Bloqueio criado com sucesso
      if (result.lock) {
        console.log('useProjectLock - Bloqueio criado com sucesso:', result.lock);
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
      console.error('useProjectLock - Erro ao adquirir bloqueio:', error);
      toast({
        title: "Erro",
        description: "Não foi possível bloquear o projeto para edição.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, projectId, checkLock, toast, isReady]);

  const releaseLock = useCallback(async (showToast: boolean = true) => {
    if (!lockId) {
      console.log('useProjectLock - Nenhum bloqueio para liberar');
      return true;
    }

    try {
      setIsLoading(true);
      console.log('useProjectLock - Liberando bloqueio:', lockId);
      
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
      console.error('useProjectLock - Erro ao liberar bloqueio:', error);
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
    console.log('useProjectLock - Renovando bloqueio:', lockId);
    const success = await renewProjectLock(lockId);
    if (!success) {
      console.warn('useProjectLock - Falha ao renovar bloqueio');
    }
  }, [lockId]);

  // Verificar bloqueio inicial quando o componente monta
  useEffect(() => {
    if (isReady) {
      console.log('useProjectLock - Verificando bloqueio inicial para projeto:', projectId);
      checkLock();
    }
  }, [isReady, checkLock]);

  // Renovar bloqueio automaticamente se for nosso
  useEffect(() => {
    if (!isOwnLock || !lockId) return;

    console.log('useProjectLock - Iniciando renovação automática do bloqueio');
    const interval = setInterval(renewLock, LOCK_RENEWAL_INTERVAL);
    return () => {
      console.log('useProjectLock - Parando renovação automática do bloqueio');
      clearInterval(interval);
    };
  }, [isOwnLock, lockId, renewLock]);

  // Liberar bloqueio quando sair da página ou recarregar
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (lockId) {
        console.log('useProjectLock - beforeunload: liberando bloqueio');
        releaseLockOnPageUnload(lockId);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && lockId) {
        console.log('useProjectLock - Página ficou oculta, liberando bloqueio');
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
        console.log('useProjectLock - Componente desmontado, liberando bloqueio');
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
