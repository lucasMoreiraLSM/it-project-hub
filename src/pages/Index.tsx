
import React, { useState } from 'react';
import { ProjectOverview } from '@/components/ProjectOverview';
import { ProjectDetail } from '@/components/ProjectDetail';
import { ProjectReport } from '@/components/ProjectReport';
import { ProjectDashboard } from '@/components/ProjectDashboard';
import { Project } from '@/types/project';

type ViewMode = 'overview' | 'detail' | 'report' | 'dashboard';

const Index = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
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

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setViewMode('detail');
  };

  const handleShowReport = (project: Project) => {
    setSelectedProject(project);
    setViewMode('report');
  };

  const handleShowDashboard = () => {
    setViewMode('dashboard');
  };

  const handleBack = () => {
    setViewMode('overview');
    setSelectedProject(null);
  };

  if (viewMode === 'detail' && selectedProject) {
    return (
      <ProjectDetail 
        project={selectedProject} 
        onBack={handleBack}
        onUpdate={updateProject}
      />
    );
  }

  if (viewMode === 'report' && selectedProject) {
    return (
      <ProjectReport
        project={selectedProject}
        onBack={handleBack}
      />
    );
  }

  if (viewMode === 'dashboard') {
    return (
      <ProjectDashboard
        projects={projects}
        onBack={handleBack}
      />
    );
  }

  return (
    <ProjectOverview 
      projects={projects} 
      onSelectProject={handleSelectProject}
      onUpdateProjects={setProjects}
      onShowReport={handleShowReport}
      onShowDashboard={handleShowDashboard}
    />
  );
};

export default Index;
