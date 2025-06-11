
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProjectHistory, CreateProjectHistoryData } from '@/types/projectHistory';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const useProjectHistory = (projectId?: string) => {
  const [history, setHistory] = useState<ProjectHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchHistory = async (id?: string) => {
    try {
      let query = supabase
        .from('project_history')
        .select('*')
        .order('data_atualizacao', { ascending: false });
      
      if (id) {
        query = query.eq('project_id', id);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data to match our types
      const transformedData: ProjectHistory[] = (data || []).map(item => ({
        ...item,
        farol: item.farol as 'Verde' | 'Amarelo' | 'Vermelho'
      }));

      setHistory(transformedData);
    } catch (error: any) {
      console.error('Erro ao carregar histórico:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar histórico do projeto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createHistoryEntry = async (historyData: CreateProjectHistoryData): Promise<void> => {
    try {
      if (!user) throw new Error('Usuário não autenticado');

      // Ensure the date is saved exactly as provided, without timezone conversion
      const dataAtualizacao = historyData.data_atualizacao || new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('project_history')
        .insert({
          ...historyData,
          user_id: user.id,
          data_atualizacao: dataAtualizacao
        })
        .select()
        .single();

      if (error) throw error;

      await fetchHistory(historyData.project_id);
      
      toast({
        title: "Sucesso",
        description: "Histórico criado com sucesso",
      });
    } catch (error: any) {
      console.error('Erro ao criar histórico:', error);
      toast({
        title: "Erro",
        description: error.message.includes('Já existe um registro') 
          ? error.message 
          : "Erro ao criar histórico",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateHistoryEntry = async (id: string, historyData: Partial<CreateProjectHistoryData>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('project_history')
        .update({
          ...historyData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await fetchHistory(projectId);
      
      toast({
        title: "Sucesso",
        description: "Histórico atualizado com sucesso",
      });
    } catch (error: any) {
      console.error('Erro ao atualizar histórico:', error);
      toast({
        title: "Erro",
        description: error.message.includes('Já existe um registro') 
          ? error.message 
          : "Erro ao atualizar histórico",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteHistoryEntry = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('project_history')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchHistory(projectId);
      
      toast({
        title: "Sucesso",
        description: "Histórico excluído com sucesso",
      });
    } catch (error: any) {
      console.error('Erro ao excluir histórico:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir histórico",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchHistory(projectId);
    }
  }, [projectId]);

  return {
    history,
    loading,
    createHistoryEntry,
    updateHistoryEntry,
    deleteHistoryEntry,
    refetch: () => fetchHistory(projectId)
  };
};
