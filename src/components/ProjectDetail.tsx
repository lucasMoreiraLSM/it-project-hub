import React from 'react';
import { Project } from '@/types/project';
import { ProjectDetailHeader } from './project-detail/ProjectDetailHeader';
import { ProjectLockedView } from './project-detail/ProjectLockedView';
import { ProjectDetailTabs } from './project-detail/ProjectDetailTabs';
import { useProjectDetailLogic } from './project-detail/ProjectDetailLogic';

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

  // Se o projeto está bloqueado por outro usuário e tentamos editar
  if (isLocked && !isOwnLock && isEditMode) {
    return (
      <ProjectLockedView 
        project={project} 
        lockInfo={lockInfo} 
        onBack={onBack} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <ProjectDetailHeader
          isOwnLock={isOwnLock}
          isLoading={isLoading}
          onBack={handleBack}
          onSave={handleSave}
          onEdit={handleEditClick}
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
