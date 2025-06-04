
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
  if (!projectId) return { hasLock: false, lockInfo: null };

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
      console.log('Nenhum bloqueio encontrado');
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
  try {
    console.log('Criando novo bloqueio...');
    const { data, error } = await supabase
      .from('project_locks')
      .insert({
        project_id: projectId,
        user_id: userId,
        user_name: userEmail || 'Usuário Desconhecido'
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
    return { success: false, error: 'Erro desconhecido' };
  }
};

export const deleteProjectLock = async (lockId: string): Promise<boolean> => {
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
  
  try {
    fetch(`${SUPABASE_URL}/rest/v1/project_locks?id=eq.${lockId}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
  } catch (error) {
    console.error('Erro ao liberar bloqueio no beforeunload:', error);
  }
};
