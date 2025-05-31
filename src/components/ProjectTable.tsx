
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Project } from '@/types/project';
import { ProjectTableRow } from './ProjectTableRow';

interface ProjectTableProps {
  projects: Project[];
  totalProjects: number;
  onSelectProject: (project: Project) => void;
  onShowReport: (project: Project, event: React.MouseEvent) => void;
  onDeleteProject: (projectId: string, event: React.MouseEvent) => void;
}

export const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  totalProjects,
  onSelectProject,
  onShowReport,
  onDeleteProject
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Lista de Projetos
          <span className="text-sm font-normal text-gray-500">
            {projects.length} de {totalProjects} projetos
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 border-b font-semibold">Projeto</th>
                <th className="text-left p-3 border-b font-semibold">% Previsto</th>
                <th className="text-left p-3 border-b font-semibold">% Realizado</th>
                <th className="text-left p-3 border-b font-semibold">% Desvio</th>
                <th className="text-left p-3 border-b font-semibold">Status Projeto</th>
                <th className="text-left p-3 border-b font-semibold">Data Fim Prevista</th>
                <th className="text-left p-3 border-b font-semibold">Status Orçamento</th>
                <th className="text-left p-3 border-b font-semibold">Áreas</th>
                <th className="text-left p-3 border-b font-semibold">Time TI</th>
                <th className="text-left p-3 border-b font-semibold">Líder Projeto TI</th>
                <th className="text-left p-3 border-b font-semibold">Gerente de Projetos</th>
                <th className="text-left p-3 border-b font-semibold">Inovação/Melhoria</th>
                <th className="text-left p-3 border-b font-semibold">Status Geral</th>
                <th className="text-left p-3 border-b font-semibold">Estratégico/Tático</th>
                <th className="text-left p-3 border-b font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <ProjectTableRow
                  key={project.id}
                  project={project}
                  onSelectProject={onSelectProject}
                  onShowReport={onShowReport}
                  onDeleteProject={onDeleteProject}
                />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
