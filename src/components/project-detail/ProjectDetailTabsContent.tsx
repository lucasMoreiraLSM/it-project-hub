
import React from 'react';
import { Project } from '@/types/project';
import { ProjectBasicInfo } from './ProjectBasicInfo';
import { ProjectResponsibles } from './ProjectResponsibles';
import { ProjectScope } from './ProjectScope';
import { ProjectObjectives } from './ProjectObjectives';
import { ProjectExecutedSteps } from './ProjectExecutedSteps';
import { ProjectNextSteps } from './ProjectNextSteps';
import { ProjectSchedule } from './ProjectSchedule';
import { ProjectAttentionPoints } from './ProjectAttentionPoints';

interface ProjectDetailTabsContentProps {
  project: Project;
  isEditMode: boolean;
  onUpdate: (field: keyof Project, value: any) => void;
  addToList: (field: keyof Project, newItem: any) => void;
  removeFromList: (field: keyof Project, index: number) => void;
  updateListItem: (field: keyof Project, index: number, value: any) => void;
  onCompleteStep: (index: number) => void;
}

export const ProjectDetailTabsContent: React.FC<ProjectDetailTabsContentProps> = ({
  project,
  isEditMode,
  onUpdate,
  addToList,
  removeFromList,
  updateListItem,
  onCompleteStep
}) => {
  return (
    <>
      <ProjectBasicInfo
        project={project}
        onUpdate={onUpdate}
        canEdit={isEditMode}
      />

      <ProjectResponsibles
        project={project}
        onUpdate={onUpdate}
        canEdit={isEditMode}
      />

      <ProjectScope
        project={project}
        addToList={addToList}
        removeFromList={removeFromList}
        updateListItem={updateListItem}
        canEdit={isEditMode}
        onUpdate={onUpdate}
      />

      <ProjectObjectives
        project={project}
        addToList={addToList}
        removeFromList={removeFromList}
        updateListItem={updateListItem}
        canEdit={isEditMode}
        onUpdate={onUpdate}
      />

      <ProjectExecutedSteps
        project={project}
        addToList={addToList}
        removeFromList={removeFromList}
        updateListItem={updateListItem}
        canEdit={isEditMode}
        onUpdate={onUpdate}
      />

      <ProjectNextSteps
        project={project}
        addToList={addToList}
        removeFromList={removeFromList}
        updateListItem={updateListItem}
        onCompleteStep={onCompleteStep}
        canEdit={isEditMode}
        onUpdate={onUpdate}
      />

      <ProjectSchedule
        project={project}
        addToList={addToList}
        removeFromList={removeFromList}
        updateListItem={updateListItem}
        canEdit={isEditMode}
        onUpdate={onUpdate}
      />

      <ProjectAttentionPoints
        project={project}
        addToList={addToList}
        removeFromList={removeFromList}
        updateListItem={updateListItem}
        canEdit={isEditMode}
        onUpdate={onUpdate}
      />
    </>
  );
};
