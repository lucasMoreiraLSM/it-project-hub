
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import ResetPassword from '@/pages/ResetPassword';
import AcceptInvite from '@/pages/AcceptInvite';

type AppView = 'overview' | 'detail' | 'report' | 'dashboard' | 'users' | 'create';

const MainApp: React.FC = () => {
  const { projects, loading: projectsLoading, createProject, updateProject, deleteProject, refetch } = useProjects();
  const { canManageUsers } = useUserPermissions();
  
  const [currentView, setCurrentView] = useState<AppView>('overview');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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
    </div>
  );
};

const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <MainApp />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route path="/*" element={<ProtectedRoute />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
};

export default App;
