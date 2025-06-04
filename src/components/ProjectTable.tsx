import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  return <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Lista de Projetos
          <span className="text-sm font-normal text-gray-500">
            {projects.length} de {totalProjects} projetos
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 w-full">
        <div className="w-full">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px] min-w-[150px]">Projeto</TableHead>
                <TableHead className="w-[80px] text-center">% Prev.</TableHead>
                <TableHead className="w-[80px] text-center">% Real.</TableHead>
                <TableHead className="w-[80px] text-center">% Desv.</TableHead>
                <TableHead className="w-[60px] text-center">Status</TableHead>
                <TableHead className="w-[100px] text-center">Data Fim</TableHead>
                <TableHead className="w-[90px] text-center">Status Geral</TableHead>
                <TableHead className="w-[120px] px-[25px]">Áreas</TableHead>
                <TableHead className="w-[100px]">Time TI</TableHead>
                <TableHead className="w-[120px]">Líder TI</TableHead>
                <TableHead className="w-[120px]">Gerente Proj.</TableHead>
                <TableHead className="w-[90px] text-center">Inov/Melh</TableHead>
                <TableHead className="w-[90px] text-center">St. Geral</TableHead>
                <TableHead className="w-[90px] text-center">Estr/Tát</TableHead>
                <TableHead className="w-[120px] text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map(project => <ProjectTableRow key={project.id} project={project} onSelectProject={onSelectProject} onShowReport={onShowReport} onDeleteProject={onDeleteProject} />)}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>;
};