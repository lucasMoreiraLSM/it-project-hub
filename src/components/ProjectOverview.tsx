
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/types/project';
import { Filters } from '@/types/filters';
import { ProjectFilters } from './ProjectFilters';
import { ProjectTable } from './ProjectTable';
import { getFilterOptions, filterProjects, hasActiveFilters, clearFilters } from '@/utils/filterUtils';
import { PieChart, Filter, Plus, RefreshCw } from 'lucide-react';

interface ProjectOverviewProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onUpdateProjects: (projects: Project[]) => void;
  onShowReport: (project: Project) => void;
  onShowDashboard: () => void;
  onCreateProject: () => void;
  onDeleteProject: (projectId: string) => void;
  onRefreshProjects: () => void;
  loading: boolean;
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  projects,
  onSelectProject,
  onShowReport,
  onShowDashboard,
  onCreateProject,
  onDeleteProject,
  onRefreshProjects,
  loading
}) => {
  const [filters, setFilters] = useState<Filters>(clearFilters());
  const [showFilters, setShowFilters] = useState(false);

  const filterOptions = useMemo(() => getFilterOptions(projects), [projects]);
  const filteredProjects = useMemo(() => filterProjects(projects, filters), [projects, filters]);

  const clearAllFilters = () => {
    setFilters(clearFilters());
  };

  const hasActiveFiltersState = hasActiveFilters(filters);

  const deleteProject = (projectId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      onDeleteProject(projectId);
    }
  };

  const showReport = (project: Project, event: React.MouseEvent) => {
    event.stopPropagation();
    onShowReport(project);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Carregando projetos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-slate-200">
      <div className="w-full max-w-none mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Visão Geral dos Projetos</h1>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowFilters(!showFilters)} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
              {hasActiveFiltersState && (
                <Badge variant="secondary" className="ml-1">
                  {Object.values(filters).filter(f => f !== '').length}
                </Badge>
              )}
            </Button>
            <Button 
              onClick={onRefreshProjects} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
            <Button 
              onClick={onShowDashboard} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <PieChart className="h-4 w-4" />
              Painel de Gráficos
            </Button>
            <Button 
              onClick={onCreateProject} 
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Novo Projeto
            </Button>
          </div>
        </div>

        {showFilters && (
          <ProjectFilters 
            filters={filters} 
            filterOptions={filterOptions} 
            onFiltersChange={setFilters} 
            onClearFilters={clearAllFilters} 
          />
        )}

        <ProjectTable 
          projects={filteredProjects} 
          totalProjects={projects.length} 
          onSelectProject={onSelectProject} 
          onShowReport={showReport} 
          onDeleteProject={deleteProject} 
        />
      </div>
    </div>
  );
};
