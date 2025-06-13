import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { ProjectOverview } from '@/components/ProjectOverview';
import { ProjectDetail } from '@/components/ProjectDetail';
import { ProjectReport } from '@/components/ProjectReport';
import { ProjectDashboard } from '@/components/ProjectDashboard';
import { UserManagement } from '@/components/UserManagement';
import { AuthPage } from '@/components/auth/AuthPage';
import { ProjectHeader } from '@/components/ProjectHeader';
import { Project } from '@/types/project';
import { Toaster } from '@/components/ui/toaster';

type AppView = 'overview' | 'detail' | 'report' | 'dashboard' | 'users' | 'create';

const App: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { projects, loading: projectsLoading, createProject, updateProject, deleteProject, refetch } = useProjects();
  const { canManageUsers } = useUserPermissions();
  
  const [currentView, setCurrentView] = useState<AppView>('overview');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setCurrentView('detail');
  };

  const handleShowReport = (project: Project) => {
    setSelectedProject(project);
    setCurrentView('report');
  };

  const handleBack = () => {
    setSelectedProject(null);
    setCurrentView('overview');
  };

  const handleUpdateProject = async (project: Project) => {
    await updateProject(project);
    if (selectedProject && selectedProject.id === project.id) {
      setSelectedProject(project);
    }
  };

  const handleShowDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleShowUserManagement = () => {
    if (canManageUsers) {
      setCurrentView('users');
    }
  };

  const handleCreateProject = () => {
    setCurrentView('create');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'detail':
        return selectedProject ? (
          <ProjectDetail
            project={selectedProject}
            onBack={handleBack}
            onUpdate={handleUpdateProject}
          />
        ) : null;
      
      case 'report':
        return selectedProject ? (
          <ProjectReport
            project={selectedProject}
            onBack={handleBack}
          />
        ) : null;
      
      case 'dashboard':
        return <ProjectDashboard projects={projects} onBack={handleBack} />;
      
      case 'users':
        return canManageUsers ? <UserManagement onBack={handleBack} /> : null;
      
      case 'overview':
      default:
        return (
          <ProjectOverview
            projects={projects}
            onSelectProject={handleSelectProject}
            onUpdateProjects={() => {}}
            onShowReport={handleShowReport}
            onShowDashboard={handleShowDashboard}
            onCreateProject={handleCreateProject}
            onDeleteProject={deleteProject}
            onRefreshProjects={refetch}
            onShowUserManagement={handleShowUserManagement}
            loading={projectsLoading}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectHeader />
      {renderCurrentView()}
      <Toaster />
    </div>
  );
};

export default App;
