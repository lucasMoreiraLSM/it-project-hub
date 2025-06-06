
import { supabase } from '@/integrations/supabase/client';
import { ProjectLock, LockCheckResult } from '@/types/projectLock';
import { SUPABASE_URL, SUPABASE_KEY } from './lockConstants';

export const cleanupExpiredLocks = async (): Promise<void> => {
  try {
    const { error } = await supabase.rpc('cleanup_expired_locks');
    if (error) {
      console.error('Erro ao limpar bloqueios expirados:', error);
    }
  } catch (error) {
    console.error('Erro ao limpar bloqueios expirados:', error);
  }
};

export const checkProjectLock = async (projectId: string): Promise<LockCheckResult> => {
  if (!projectId) {
    console.log('Project ID não fornecido');
    return { hasLock: false, lockInfo: null };
  }

  try {
    console.log('Verificando bloqueio existente para projeto:', projectId);
    
    // Limpar bloqueios expirados primeiro
    await cleanupExpiredLocks();

    // Verificar se existe bloqueio ativo
    const { data: locks, error } = await supabase
      .from('project_locks')
      .select('*')
      .eq('project_id', projectId)
      .maybeSingle();

    if (error) {
      console.error('Erro ao verificar bloqueio:', error);
      return { hasLock: false, lockInfo: null };
    }

    if (locks) {
      console.log('Bloqueio encontrado:', locks);
      return { hasLock: true, lockInfo: locks };
    } else {
      console.log('Nenhum bloqueio encontrado para projeto:', projectId);
      return { hasLock: false, lockInfo: null };
    }
  } catch (error) {
    console.error('Erro ao verificar bloqueio:', error);
    return { hasLock: false, lockInfo: null };
  }
};

export const createProjectLock = async (
  projectId: string, 
  userId: string, 
  userEmail: string
): Promise<{ success: boolean; lock?: ProjectLock; error?: string }> => {
  if (!projectId || !userId) {
    console.error('Project ID ou User ID não fornecido');
    return { success: false, error: 'Project ID ou User ID não fornecido' };
  }

  try {
    console.log('Criando novo bloqueio para projeto:', projectId, 'usuário:', userId);
    
    // Primeiro, limpar bloqueios expirados
    await cleanupExpiredLocks();
    
    // Verificar se já existe bloqueio ativo para este projeto
    const existingLock = await checkProjectLock(projectId);
    if (existingLock.hasLock) {
      if (existingLock.lockInfo?.user_id === userId) {
        console.log('Usuário já possui bloqueio ativo');
        return { success: true, lock: existingLock.lockInfo };
      } else {
        console.log('Projeto já bloqueado por outro usuário');
        return { 
          success: false, 
          error: `Projeto bloqueado por ${existingLock.lockInfo?.user_name}` 
        };
      }
    }

    const { data, error } = await supabase
      .from('project_locks')
      .insert({
        project_id: projectId,
        user_id: userId,
        user_name: userEmail || 'Usuário Desconhecido',
        locked_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutos
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar bloqueio:', error);
      return { success: false, error: error.message };
    }

    console.log('Bloqueio criado com sucesso:', data);
    return { success: true, lock: data };
  } catch (error) {
    console.error('Erro ao criar bloqueio:', error);
    return { success: false, error: 'Erro desconhecido ao criar bloqueio' };
  }
};

export const deleteProjectLock = async (lockId: string): Promise<boolean> => {
  if (!lockId) {
    console.log('Lock ID não fornecido');
    return false;
  }

  try {
    console.log('Liberando bloqueio:', lockId);
    
    const { error } = await supabase
      .from('project_locks')
      .delete()
      .eq('id', lockId);

    if (error) {
      console.error('Erro ao liberar bloqueio:', error);
      return false;
    }

    console.log('Bloqueio liberado com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao liberar bloqueio:', error);
    return false;
  }
};

export const renewProjectLock = async (lockId: string): Promise<boolean> => {
  if (!lockId) {
    console.log('Lock ID não fornecido para renovação');
    return false;
  }

  try {
    console.log('Renovando bloqueio:', lockId);
    const { error } = await supabase
      .from('project_locks')
      .update({
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
      })
      .eq('id', lockId);

    if (error) {
      console.error('Erro ao renovar bloqueio:', error);
      return false;
    } else {
      console.log('Bloqueio renovado com sucesso');
      return true;
    }
  } catch (error) {
    console.error('Erro ao renovar bloqueio:', error);
    return false;
  }
};

export const releaseLockOnPageUnload = (lockId: string): void => {
  console.log('Página sendo fechada, liberando bloqueio via fetch');
  
  if (!lockId) {
    console.log('Lock ID não fornecido para liberação');
    return;
  }
  
  try {
    fetch(`${SUPABASE_URL}/rest/v1/project_locks?id=eq.${lockId}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      keepalive: true
    });
  } catch (error) {
    console.error('Erro ao liberar bloqueio no beforeunload:', error);
  }
};
