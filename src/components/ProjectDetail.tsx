
import React, { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { ProjectDetailHeader } from './project-detail/ProjectDetailHeader';
import { ProjectLockedView } from './project-detail/ProjectLockedView';
import { ProjectDetailTabs } from './project-detail/ProjectDetailTabs';
import { useProjectDetailLogic } from './project-detail/ProjectDetailLogic';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onUpdate: (project: Project) => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onBack,
  onUpdate
}) => {
  const {
    editedProject,
    isEditMode,
    isLocked,
    lockInfo,
    isOwnLock,
    isLoading,
    history,
    historyLoading,
    handleEditClick,
    handleSave,
    handleBack,
    handleUpdate,
    addToList,
    removeFromList,
    updateListItem,
    concluirEtapa,
    createHistoryEntry,
    deleteHistoryEntry
  } = useProjectDetailLogic({ project, onUpdate, onBack });

  const { user } = useAuth();
  const { toast } = useToast();
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      if (!user || !project) {
        setCanEdit(false);
        return;
      }
      const { data, error } = await supabase.rpc('can_edit_project', {
        project_id: project.id,
        user_id: user.id
      });

      if (error) {
        console.error("Error checking edit permissions:", error);
        setCanEdit(false);
      } else {
        setCanEdit(data);
      }
    };
    checkPermissions();
  }, [user, project]);

  // If the project is locked by another user and we try to edit
  if (isLocked && !isOwnLock && isEditMode) {
    return (
      <ProjectLockedView 
        project={project} 
        lockInfo={lockInfo} 
        onBack={onBack} 
      />
    );
  }

  const handleAttemptEdit = () => {
    if (canEdit) {
      handleEditClick();
    } else {
      toast({
        title: "Permissão Negada",
        description: "Você não tem permissão para editar este projeto.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <ProjectDetailHeader
          isOwnLock={isOwnLock}
          isLoading={isLoading}
          onBack={handleBack}
          onSave={handleSave}
          onEdit={handleAttemptEdit}
          isEditMode={isEditMode}
          lastUpdatedByName={project.lastUpdatedByName}
          lastUpdatedAt={project.lastUpdatedAt}
        />

        <ProjectDetailTabs
          project={project}
          editedProject={editedProject}
          isEditMode={isEditMode}
          onUpdate={handleUpdate}
          addToList={addToList}
          removeFromList={removeFromList}
          updateListItem={updateListItem}
          onCompleteStep={concluirEtapa}
          historyLoading={historyLoading}
          onCreateHistory={createHistoryEntry}
          onDeleteHistory={deleteHistoryEntry}
          history={history}
        />
      </div>
    </div>
  );
};
