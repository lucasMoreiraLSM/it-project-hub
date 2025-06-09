
import React from 'react';
import { ProjectHistoryView } from '../project-history/ProjectHistoryView';
import { ProjectHistoryForm } from '../project-history/ProjectHistoryForm';
import { Project } from '@/types/project';

interface ProjectHistoryTabProps {
  project: Project;
  onCreateHistory: (data: any) => Promise<void>;
  onDeleteHistory: (id: string) => Promise<void>;
  history: any[];
  loading: boolean;
}

export const ProjectHistoryTab: React.FC<ProjectHistoryTabProps> = ({
  project,
  onCreateHistory,
  onDeleteHistory,
  history,
  loading
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <ProjectHistoryForm
          projectId={project.id}
          project={project}
          onSubmit={onCreateHistory}
          loading={loading}
        />
      </div>
      <div className="lg:col-span-2">
        <ProjectHistoryView
          history={history}
          loading={loading}
          onDelete={onDeleteHistory}
        />
      </div>
    </div>
  );
};
