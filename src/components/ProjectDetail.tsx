
import React, { useState, useEffect } from 'react';
import { Project, EtapaExecutada } from '@/types/project';
import { useProjectLock } from '@/hooks/useProjectLock';
import { useProjectHistory } from '@/hooks/useProjectHistory';
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
import { ProjectHistoryView } from './project-history/ProjectHistoryView';
import { ProjectHistoryForm } from './project-history/ProjectHistoryForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [isEditMode, setIsEditMode] = useState(false);
  
  const { 
    isLocked, 
    lockInfo, 
    isOwnLock, 
    isLoading, 
    acquireLock, 
    releaseLock,
    checkLock
  } = useProjectLock(project.id);

  const {
    history,
    loading: historyLoading,
    createHistoryEntry
  } = useProjectHistory(project.id);

  const handleEditClick = async () => {
    if (isEditMode) {
      // Se já está editando, parar edição e liberar bloqueio
      console.log('Parando edição, liberando bloqueio...');
      const success = await releaseLock();
      if (success) {
        setIsEditMode(false);
      }
    } else {
      // Tentar adquirir bloqueio para edição
      console.log('Tentando adquirir bloqueio para edição...');
      const acquired = await acquireLock();
      if (acquired) {
        setIsEditMode(true);
        console.log('Bloqueio adquirido, modo de edição ativado');
      } else {
        console.log('Não foi possível adquirir bloqueio');
      }
    }
  };

  const handleSave = async () => {
    if (!isEditMode) return;
    
    try {
      console.log('Salvando projeto...');
      await onUpdate(editedProject);
      console.log('Projeto salvo, liberando bloqueio...');
      await releaseLock();
      setIsEditMode(false);
      onBack();
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
    }
  };

  const handleBack = async () => {
    if (isEditMode && isOwnLock) {
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
          canEdit={isEditMode}
          isOwnLock={isOwnLock}
          isLoading={isLoading}
          onBack={handleBack}
          onSave={handleSave}
          onEdit={handleEditClick}
          isEditMode={isEditMode}
          lastUpdatedByName={project.lastUpdatedByName}
          lastUpdatedAt={project.lastUpdatedAt}
        />

        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Detalhes do Projeto</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <ProjectBasicInfo
              project={editedProject}
              onUpdate={handleUpdate}
              canEdit={isEditMode}
            />

            <ProjectResponsibles
              project={editedProject}
              onUpdate={handleUpdate}
              canEdit={isEditMode}
            />

            <ProjectScope
              project={editedProject}
              addToList={addToList}
              removeFromList={removeFromList}
              updateListItem={updateListItem}
              canEdit={isEditMode}
              onUpdate={handleUpdate}
            />

            <ProjectObjectives
              project={editedProject}
              addToList={addToList}
              removeFromList={removeFromList}
              updateListItem={updateListItem}
              canEdit={isEditMode}
              onUpdate={handleUpdate}
            />

            <ProjectExecutedSteps
              project={editedProject}
              addToList={addToList}
              removeFromList={removeFromList}
              updateListItem={updateListItem}
              canEdit={isEditMode}
              onUpdate={handleUpdate}
            />

            <ProjectNextSteps
              project={editedProject}
              addToList={addToList}
              removeFromList={removeFromList}
              updateListItem={updateListItem}
              onCompleteStep={concluirEtapa}
              canEdit={isEditMode}
              onUpdate={handleUpdate}
            />

            <ProjectSchedule
              project={editedProject}
              addToList={addToList}
              removeFromList={removeFromList}
              updateListItem={updateListItem}
              canEdit={isEditMode}
              onUpdate={handleUpdate}
            />

            <ProjectAttentionPoints
              project={editedProject}
              addToList={addToList}
              removeFromList={removeFromList}
              updateListItem={updateListItem}
              canEdit={isEditMode}
              onUpdate={handleUpdate}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <ProjectHistoryForm
                  projectId={project.id}
                  onSubmit={createHistoryEntry}
                  loading={historyLoading}
                />
              </div>
              <div className="lg:col-span-2">
                <ProjectHistoryView
                  history={history}
                  loading={historyLoading}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
