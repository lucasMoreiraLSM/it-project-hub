
import { useState, useEffect } from 'react';
import { Project, EtapaExecutada } from '@/types/project';
import { useProjectLock } from '@/hooks/useProjectLock';
import { useProjectHistory } from '@/hooks/useProjectHistory';

interface UseProjectDetailLogicProps {
  project: Project;
  onUpdate: (project: Project) => void;
  onBack: () => void;
}

export const useProjectDetailLogic = ({ project, onUpdate, onBack }: UseProjectDetailLogicProps) => {
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
    releaseLock
  } = useProjectLock(project.id);

  const {
    history,
    loading: historyLoading,
    createHistoryEntry
  } = useProjectHistory(project.id);

  const handleEditClick = async () => {
    if (isEditMode) {
      console.log('Parando edição, liberando bloqueio...');
      const success = await releaseLock();
      if (success) {
        setIsEditMode(false);
      }
    } else {
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

  return {
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
    createHistoryEntry
  };
};
