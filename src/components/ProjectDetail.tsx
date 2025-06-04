
import React, { useState, useEffect } from 'react';
import { Project, EtapaExecutada } from '@/types/project';
import { useProjectLock } from '@/hooks/useProjectLock';
import { ProjectDetailHeader } from './project-detail/ProjectDetailHeader';
import { ProjectBasicInfo } from './project-detail/ProjectBasicInfo';
import { ProjectResponsibles } from './project-detail/ProjectResponsibles';
import { ProjectScope } from './project-detail/ProjectScope';
import { ProjectObjectives } from './project-detail/ProjectObjectives';
import { ProjectExecutedSteps } from './project-detail/ProjectExecutedSteps';
import { ProjectNextSteps } from './project-detail/ProjectNextSteps';
import { ProjectSchedule } from './project-detail/ProjectSchedule';
import { ProjectAttentionPoints } from './project-detail/ProjectAttentionPoints';
import { ProjectLockedView } from './project-detail/ProjectLockedView';

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
  const [editedProject, setEditedProject] = useState<Project>({
    ...project
  });
  const [canEdit, setCanEdit] = useState(false);
  
  const { isLocked, lockInfo, isOwnLock, acquireLock, releaseLock } = useProjectLock(project.id);

  useEffect(() => {
    const tryAcquireLock = async () => {
      if (!isLocked) {
        const acquired = await acquireLock();
        setCanEdit(acquired);
      } else if (isOwnLock) {
        setCanEdit(true);
      } else {
        setCanEdit(false);
      }
    };

    tryAcquireLock();
  }, [isLocked, isOwnLock, acquireLock]);

  const handleSave = async () => {
    if (!canEdit) return;
    
    try {
      await onUpdate(editedProject);
      console.log('Projeto salvo, liberando bloqueio...');
      await releaseLock();
      onBack();
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
    }
  };

  const handleBack = async () => {
    if (canEdit && isOwnLock) {
      console.log('Voltando, liberando bloqueio...');
      await releaseLock();
    }
    onBack();
  };

  const handleUpdate = (field: keyof Project, value: any) => {
    setEditedProject({
      ...editedProject,
      [field]: value
    });
  };

  const addToList = (field: keyof Project, newItem: any) => {
    const currentList = editedProject[field] as any[];
    setEditedProject({
      ...editedProject,
      [field]: [...currentList, newItem]
    });
  };

  const removeFromList = (field: keyof Project, index: number) => {
    const currentList = editedProject[field] as any[];
    setEditedProject({
      ...editedProject,
      [field]: currentList.filter((_, i) => i !== index)
    });
  };

  const updateListItem = (field: keyof Project, index: number, value: any) => {
    const currentList = editedProject[field] as any[];
    const updatedList = [...currentList];
    updatedList[index] = value;
    setEditedProject({
      ...editedProject,
      [field]: updatedList
    });
  };

  const concluirEtapa = (index: number) => {
    const proximaEtapa = editedProject.proximasEtapas[index];
    const novaEtapaExecutada: EtapaExecutada = {
      atividade: proximaEtapa.atividade,
      dataConclusao: new Date().toISOString().split('T')[0]
    };

    const novasProximasEtapas = editedProject.proximasEtapas.filter((_, i) => i !== index);
    const novasEtapasExecutadas = [...editedProject.etapasExecutadas, novaEtapaExecutada];
    
    setEditedProject({
      ...editedProject,
      proximasEtapas: novasProximasEtapas,
      etapasExecutadas: novasEtapasExecutadas
    });
  };

  if (isLocked && !isOwnLock) {
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
          canEdit={canEdit}
          onBack={handleBack}
          onSave={handleSave}
          lastUpdatedByName={project.lastUpdatedByName}
          lastUpdatedAt={project.lastUpdatedAt}
        />

        <div className="space-y-6">
          <ProjectBasicInfo
            project={editedProject}
            onUpdate={handleUpdate}
            canEdit={canEdit}
          />

          <ProjectResponsibles
            project={editedProject}
            onUpdate={handleUpdate}
            canEdit={canEdit}
          />

          <ProjectScope
            project={editedProject}
            addToList={addToList}
            removeFromList={removeFromList}
            updateListItem={updateListItem}
            canEdit={canEdit}
            onUpdate={handleUpdate}
          />

          <ProjectObjectives
            project={editedProject}
            addToList={addToList}
            removeFromList={removeFromList}
            updateListItem={updateListItem}
            canEdit={canEdit}
            onUpdate={handleUpdate}
          />

          <ProjectExecutedSteps
            project={editedProject}
            addToList={addToList}
            removeFromList={removeFromList}
            updateListItem={updateListItem}
            canEdit={canEdit}
            onUpdate={handleUpdate}
          />

          <ProjectNextSteps
            project={editedProject}
            addToList={addToList}
            removeFromList={removeFromList}
            updateListItem={updateListItem}
            onCompleteStep={concluirEtapa}
            canEdit={canEdit}
            onUpdate={handleUpdate}
          />

          <ProjectSchedule
            project={editedProject}
            addToList={addToList}
            removeFromList={removeFromList}
            updateListItem={updateListItem}
            canEdit={canEdit}
            onUpdate={handleUpdate}
          />

          <ProjectAttentionPoints
            project={editedProject}
            addToList={addToList}
            removeFromList={removeFromList}
            updateListItem={updateListItem}
            canEdit={canEdit}
            onUpdate={handleUpdate}
          />
        </div>
      </div>
    </div>
  );
};
