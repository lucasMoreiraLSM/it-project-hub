
import React, { useState } from 'react';
import { ProjectOverview } from '@/components/ProjectOverview';
import { ProjectDetail } from '@/components/ProjectDetail';
import { Project } from '@/types/project';

const Index = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      nome: 'Sistema ERP Financeiro',
      areaNegocio: 'Financeiro',
      inovacaoMelhoria: 'Inovação',
      timeTI: 'Projetos',
      sponsor: 'João Silva',
      productOwner: 'Maria Santos',
      gerenteProjetos: 'Carlos Lima',
      liderProjetosTI: 'Ana Costa',
      escopo: ['Módulo de contas a pagar', 'Módulo de contas a receber', 'Relatórios financeiros'],
      objetivos: ['Automatizar processos financeiros', 'Reduzir tempo de fechamento mensal'],
      etapasExecutadas: ['Levantamento de requisitos', 'Análise de viabilidade'],
      proximasEtapas: [
        { atividade: 'Desenvolvimento do módulo', responsavel: 'Equipe Dev', previsao: '2024-02-15' }
      ],
      cronograma: [
        {
          etapa: 'Análise e Planejamento',
          inicio: '2024-01-01',
          fim: '2024-01-31',
          percentualPrevisto: 100,
          percentualRealizado: 100
        },
        {
          etapa: 'Desenvolvimento',
          inicio: '2024-02-01',
          fim: '2024-04-30',
          percentualPrevisto: 60,
          percentualRealizado: 45
        }
      ],
      pontosAtencao: ['Dependência de aprovação orçamentária', 'Recursos limitados'],
      estrategicoTatico: 'Estratégico'
    }
  ]);

  const updateProject = (updatedProject: Project) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    setSelectedProject(updatedProject);
  };

  if (selectedProject) {
    return (
      <ProjectDetail 
        project={selectedProject} 
        onBack={() => setSelectedProject(null)}
        onUpdate={updateProject}
      />
    );
  }

  return (
    <ProjectOverview 
      projects={projects} 
      onSelectProject={setSelectedProject}
      onUpdateProjects={setProjects}
    />
  );
};

export default Index;
