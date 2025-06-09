
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectDetailTabsContent } from './ProjectDetailTabsContent';
import { ProjectHistoryTab } from './ProjectHistoryTab';
import { Project } from '@/types/project';

interface ProjectDetailTabsProps {
  project: Project;
  editedProject: Project;
  isEditMode: boolean;
  onUpdate: (field: keyof Project, value: any) => void;
  addToList: (field: keyof Project, newItem: any) => void;
  removeFromList: (field: keyof Project, index: number) => void;
  updateListItem: (field: keyof Project, index: number, value: any) => void;
  onCompleteStep: (index: number) => void;
  historyLoading: boolean;
  onCreateHistory: (data: any) => Promise<void>;
  onDeleteHistory: (id: string) => Promise<void>;
  history: any[];
}

export const ProjectDetailTabs: React.FC<ProjectDetailTabsProps> = ({
  project,
  editedProject,
  isEditMode,
  onUpdate,
  addToList,
  removeFromList,
  updateListItem,
  onCompleteStep,
  historyLoading,
  onCreateHistory,
  onDeleteHistory,
  history
}) => {
  return (
    <Tabs defaultValue="details" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="details">Detalhes do Projeto</TabsTrigger>
        <TabsTrigger value="history">Histórico</TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="space-y-6">
        <ProjectDetailTabsContent
          project={editedProject}
          isEditMode={isEditMode}
          onUpdate={onUpdate}
          addToList={addToList}
          removeFromList={removeFromList}
          updateListItem={updateListItem}
          onCompleteStep={onCompleteStep}
        />
      </TabsContent>

      <TabsContent value="history" className="space-y-6">
        <ProjectHistoryTab
          project={project}
          onCreateHistory={onCreateHistory}
          onDeleteHistory={onDeleteHistory}
          history={history}
          loading={historyLoading}
        />
      </TabsContent>
    </Tabs>
  );
};
