
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project, EtapaExecutada } from '@/types/project';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projetos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProjects: Project[] = data.map(projeto => ({
        id: projeto.id,
        nome: projeto.nome,
        areaNegocio: projeto.area_negocio || '',
        inovacaoMelhoria: projeto.inovacao_melhoria as 'Inovação' | 'Melhoria',
        timeTI: projeto.time_ti || '',
        sponsor: projeto.sponsor || '',
        productOwner: projeto.product_owner || '',
        gerenteProjetos: projeto.gerente_projetos || '',
        liderProjetosTI: projeto.lider_projetos_ti || '',
        escopo: Array.isArray(projeto.escopo) ? projeto.escopo as string[] : [],
        objetivos: Array.isArray(projeto.objetivos) ? projeto.objetivos as string[] : [],
        etapasExecutadas: Array.isArray(projeto.etapas_executadas) ? 
          projeto.etapas_executadas.map((etapa: any) => {
            if (typeof etapa === 'string') {
              return { atividade: etapa, dataConclusao: '' };
            }
            return etapa as EtapaExecutada;
          }) : [],
        proximasEtapas: Array.isArray(projeto.proximas_etapas) ? projeto.proximas_etapas as any[] : [],
        cronograma: Array.isArray(projeto.cronograma) ? projeto.cronograma as any[] : [],
        pontosAtencao: Array.isArray(projeto.pontos_atencao) ? projeto.pontos_atencao as string[] : [],
        estrategicoTatico: projeto.estrategico_tatico as 'Estratégico' | 'Tático',
        lastUpdatedByName: projeto.last_updated_by_name || '',
        lastUpdatedAt: projeto.last_updated_at || projeto.updated_at
      }));

      setProjects(formattedProjects);
    } catch (error: any) {
      console.error('Erro ao carregar projetos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar projetos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (project: Omit<Project, 'id'>) => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Usuário não autenticado');

      // Buscar o perfil do usuário para determinar se pode ser líder
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('perfil')
        .eq('id', currentUser.id)
        .single();

      const { data, error } = await supabase
        .from('projetos')
        .insert({
          nome: project.nome,
          area_negocio: project.areaNegocio,
          inovacao_melhoria: project.inovacaoMelhoria,
          time_ti: project.timeTI,
          sponsor: project.sponsor,
          product_owner: project.productOwner,
          gerente_projetos: project.gerenteProjetos,
          lider_projetos_ti: project.liderProjetosTI,
          escopo: project.escopo as any,
          objetivos: project.objetivos as any,
          etapas_executadas: project.etapasExecutadas as any,
          proximas_etapas: project.proximasEtapas as any,
          cronograma: project.cronograma as any,
          pontos_atencao: project.pontosAtencao as any,
          estrategico_tatico: project.estrategicoTatico,
          user_id: currentUser.id,
          created_by_user_id: currentUser.id,
          lider_projeto_user_id: currentUser.id, // O criador automaticamente se torna líder
          last_updated_by_name: currentUser.email || 'Usuário Desconhecido',
          last_updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      await fetchProjects();
      return data;
    } catch (error: any) {
      console.error('Erro ao criar projeto:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar projeto",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProject = async (project: Project) => {
    try {
      const { error } = await supabase
        .from('projetos')
        .update({
          nome: project.nome,
          area_negocio: project.areaNegocio,
          inovacao_melhoria: project.inovacaoMelhoria,
          time_ti: project.timeTI,
          sponsor: project.sponsor,
          product_owner: project.productOwner,
          gerente_projetos: project.gerenteProjetos,
          lider_projetos_ti: project.liderProjetosTI,
          escopo: project.escopo as any,
          objetivos: project.objetivos as any,
          etapas_executadas: project.etapasExecutadas as any,
          proximas_etapas: project.proximasEtapas as any,
          cronograma: project.cronograma as any,
          pontos_atencao: project.pontosAtencao as any,
          estrategico_tatico: project.estrategicoTatico,
          updated_at: new Date().toISOString(),
          last_updated_by_name: user?.email || 'Usuário Desconhecido',
          last_updated_at: new Date().toISOString()
        })
        .eq('id', project.id);

      if (error) throw error;

      await fetchProjects();
    } catch (error: any) {
      console.error('Erro ao atualizar projeto:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar projeto",
        variant: "destructive",
      });
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      // Verificar se o usuário tem permissão para excluir
      if (!user) throw new Error('Usuário não autenticado');

      const { data: canDelete, error: permissionError } = await supabase.rpc('can_delete_project', {
        project_id: projectId,
        user_id: user.id
      });

      if (permissionError) throw permissionError;
      if (!canDelete) {
        toast({
          title: "Erro",
          description: "Você não tem permissão para excluir este projeto",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('projetos')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      await fetchProjects();
      
      toast({
        title: "Sucesso",
        description: "Projeto excluído com sucesso",
      });
    } catch (error: any) {
      console.error('Erro ao excluir projeto:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir projeto",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects
  };
};
