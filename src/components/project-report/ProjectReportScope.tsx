
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Project } from '@/types/project';

interface ProjectReportScopeProps {
  project: Project;
}

export const ProjectReportScope: React.FC<ProjectReportScopeProps> = ({ project }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>📝 Escopo do Projeto</CardTitle>
      </CardHeader>
      <CardContent>
        {project.escopo.length > 0 ? (
          <ul className="list-disc list-inside space-y-1">
            {project.escopo.map((item, index) => (
              <li key={index} className="text-gray-700">{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Nenhum item de escopo definido</p>
        )}
      </CardContent>
    </Card>
  );
};
