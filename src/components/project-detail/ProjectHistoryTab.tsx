
import React from 'react';
import { ProjectHistoryView } from '../project-history/ProjectHistoryView';
import { ProjectHistoryForm } from '../project-history/ProjectHistoryForm';

interface ProjectHistoryTabProps {
  projectId: string;
  onCreateHistory: (data: any) => Promise<void>;
  history: any[];
  loading: boolean;
}

export const ProjectHistoryTab: React.FC<ProjectHistoryTabProps> = ({
  projectId,
  onCreateHistory,
  history,
  loading
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <ProjectHistoryForm
          projectId={projectId}
          onSubmit={onCreateHistory}
          loading={loading}
        />
      </div>
      <div className="lg:col-span-2">
        <ProjectHistoryView
          history={history}
          loading={loading}
        />
      </div>
    </div>
  );
};
