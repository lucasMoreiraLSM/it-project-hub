
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project, EtapaExecutada } from '@/types/project';
import { useToast } from '@/hooks/use-toast';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
        estrategicoTatico: projeto.estrategico_tatico as 'Estratégico' | 'Tático'
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

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
          escopo: project.escopo,
          objetivos: project.objetivos,
          etapas_executadas: project.etapasExecutadas,
          proximas_etapas: project.proximasEtapas as any,
          cronograma: project.cronograma as any,
          pontos_atencao: project.pontosAtencao,
          estrategico_tatico: project.estrategicoTatico,
          user_id: user.id
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
          escopo: project.escopo,
          objetivos: project.objetivos,
          etapas_executadas: project.etapasExecutadas,
          proximas_etapas: project.proximasEtapas as any,
          cronograma: project.cronograma as any,
          pontos_atencao: project.pontosAtencao,
          estrategico_tatico: project.estrategicoTatico,
          updated_at: new Date().toISOString()
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
