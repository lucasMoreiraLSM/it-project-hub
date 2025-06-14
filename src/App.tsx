import React, { useState, useEffect } from 'react';
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
import { SetPasswordModal } from '@/components/auth/SetPasswordModal';
import { useToast } from '@/hooks/use-toast';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './components/AppSidebar';

type AppView = 'overview' | 'detail' | 'report' | 'dashboard' | 'users';

const ProtectedRoute: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
  const { projects, loading: projectsLoading, createProject, updateProject, deleteProject, refetch } = useProjects();
  const { canManageUsers } = useUserPermissions();
  const { toast } = useToast();
  
  const [currentView, setCurrentView] = useState<AppView>('overview');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    if (user && !loading && user.profile?.password_set === false) {
      setShowSetPasswordModal(true);
    }
  }, [user, loading]);

  const handlePasswordSet = () => {
    setShowSetPasswordModal(false);
  };

  const handleModalClose = () => {
    signOut();
  };

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

  const handleCreateProject = async () => {
    const newProjectData: Omit<Project, 'id' | 'lastUpdatedByName' | 'lastUpdatedAt'> = {
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
      estrategicoTatico: 'Tático',
    };

    try {
      await createProject(newProjectData);
      toast({
        title: "Sucesso!",
        description: "Um novo projeto foi criado e adicionado à lista.",
      });
    } catch (error) {
      console.error("Falha ao criar o projeto:", error);
    }
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
            onCreateProject={handleCreateProject}
            onDeleteProject={deleteProject}
            onRefreshProjects={refetch}
            loading={projectsLoading}
          />
        );
    }
  };

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

  return (
    <>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-gray-50">
          <AppSidebar
            onShowDashboard={handleShowDashboard}
            onShowUserManagement={handleShowUserManagement}
            canManageUsers={canManageUsers}
            currentView={currentView}
          />
          <SidebarInset>
            <ProjectHeader />
            <div className="p-4 sm:p-6">
              {renderCurrentView()}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
      <SetPasswordModal 
        isOpen={showSetPasswordModal}
        onClose={handleModalClose}
        onSuccess={handlePasswordSet}
      />
    </>
  );
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
