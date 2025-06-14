import React, { useState } from 'react';
import { ProjectOverview } from '@/components/ProjectOverview';
import { ProjectDetail } from '@/components/ProjectDetail';
import { ProjectReport } from '@/components/ProjectReport';
import { ProjectDashboard } from '@/components/ProjectDashboard';
import { UserManagement } from '@/components/UserManagement';
import { ProjectHeader } from '@/components/ProjectHeader';
import { AuthPage } from '@/components/auth/AuthPage';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { Project } from '@/types/project';

type ViewMode = 'overview' | 'detail' | 'report' | 'dashboard' | 'users';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { projects, loading: projectsLoading, createProject, updateProject, deleteProject, refetch } = useProjects();
  const { canManageUsers } = useUserPermissions();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

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

  const handleShowUserManagement = () => {
    if (canManageUsers) {
      setViewMode('users');
    }
  };

  const handleBack = () => {
    setViewMode('overview');
    setSelectedProject(null);
  };

  const handleCreateProject = async () => {
    const newProject: Omit<Project, 'id'> = {
      nome: 'Novo Projeto',
      areaNegocio: '',
      inovacaoMelhoria: 'Melhoria',
      timeTI: '',
      sponsor: '',
      productOwner: '',
      gerenteProjetos: '',
      liderProjetosTI: '',
      escopo: [],
      objetivos: [],
      etapasExecutadas: [],
      proximasEtapas: [],
      cronograma: [],
      pontosAtencao: [],
      estrategicoTatico: 'Tático'
    };
    
    try {
      await createProject(newProject);
      // O projeto será automaticamente adicionado à lista via fetchProjects
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
    }
  };

  if (viewMode === 'detail' && selectedProject) {
    return (
      <div>
        <ProjectHeader />
        <ProjectDetail 
          project={selectedProject} 
          onBack={handleBack}
          onUpdate={updateProject}
        />
      </div>
    );
  }

  if (viewMode === 'report' && selectedProject) {
    return (
      <div>
        <ProjectHeader />
        <ProjectReport
          project={selectedProject}
          onBack={handleBack}
        />
      </div>
    );
  }

  if (viewMode === 'dashboard') {
    return (
      <div>
        <ProjectHeader />
        <ProjectDashboard
          projects={projects}
          onBack={handleBack}
        />
      </div>
    );
  }

  if (viewMode === 'users') {
    return (
      <div>
        <ProjectHeader />
        <UserManagement onBack={handleBack} />
      </div>
    );
  }

  return (
    <div>
      <ProjectHeader />
      <ProjectOverview 
        projects={projects} 
        onSelectProject={handleSelectProject}
        onUpdateProjects={() => {}} // Não usado mais, useProjects gerencia o estado
        onShowReport={handleShowReport}
        onCreateProject={handleCreateProject}
        onDeleteProject={deleteProject}
        onRefreshProjects={refetch}
        loading={projectsLoading}
      />
    </div>
  );
};

export default Index;
