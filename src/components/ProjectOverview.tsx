
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Project } from '@/types/project';
import { calculatePercentualPrevisto, calculatePercentualRealizado, calculateDesvio, getStatusProjeto, getStatusOrcamento, getStatusOrcamentoColor, getStatusGeral, getDataFimPrevista } from '@/utils/projectCalculations';
import { BarChart, Plus, Trash2, PieChart, Filter, X } from 'lucide-react';

interface ProjectOverviewProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onUpdateProjects: (projects: Project[]) => void;
  onShowReport: (project: Project) => void;
  onShowDashboard: () => void;
  onCreateProject: () => void;
  onDeleteProject: (projectId: string) => void;
  loading: boolean;
}

interface Filters {
  liderProjeto: string;
  gerenteProjetos: string;
  inovacaoMelhoria: string;
  statusProjeto: string;
  timeTI: string;
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  projects,
  onSelectProject,
  onShowReport,
  onShowDashboard,
  onCreateProject,
  onDeleteProject,
  loading
}) => {
  const [filters, setFilters] = useState<Filters>({
    liderProjeto: '',
    gerenteProjetos: '',
    inovacaoMelhoria: '',
    statusProjeto: '',
    timeTI: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Extrair valores únicos para os filtros
  const filterOptions = useMemo(() => {
    const lideresProjeto = [...new Set(projects.map(p => p.liderProjetosTI).filter(Boolean))];
    const gerentesProjetos = [...new Set(projects.map(p => p.gerenteProjetos).filter(Boolean))];
    const timesTI = [...new Set(projects.map(p => p.timeTI).filter(Boolean))];
    
    return {
      lideresProjeto,
      gerentesProjetos,
      timesTI
    };
  }, [projects]);

  // Filtrar projetos baseado nos filtros ativos
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const percentualPrevisto = calculatePercentualPrevisto(project.cronograma);
      const percentualRealizado = calculatePercentualRealizado(project.cronograma);
      const desvio = calculateDesvio(percentualPrevisto, percentualRealizado);
      const statusProjeto = getStatusProjeto(desvio);
      
      if (filters.liderProjeto && project.liderProjetosTI !== filters.liderProjeto) return false;
      if (filters.gerenteProjetos && project.gerenteProjetos !== filters.gerenteProjetos) return false;
      if (filters.inovacaoMelhoria && project.inovacaoMelhoria !== filters.inovacaoMelhoria) return false;
      if (filters.statusProjeto && statusProjeto !== filters.statusProjeto) return false;
      if (filters.timeTI && project.timeTI !== filters.timeTI) return false;
      
      return true;
    });
  }, [projects, filters]);

  const clearAllFilters = () => {
    setFilters({
      liderProjeto: '',
      gerenteProjetos: '',
      inovacaoMelhoria: '',
      statusProjeto: '',
      timeTI: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(filter => filter !== '');

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
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
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1">
                  {Object.values(filters).filter(f => f !== '').length}
                </Badge>
              )}
            </Button>
            <Button onClick={onShowDashboard} variant="outline" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Painel de Gráficos
            </Button>
            <Button onClick={onCreateProject} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Projeto
            </Button>
          </div>
        </div>

        {showFilters && (
          <Card className="mb-6 bg-white border shadow-sm relative z-10">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Filtros</CardTitle>
                {hasActiveFilters && (
                  <Button 
                    onClick={clearAllFilters} 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2"
                  >
                    <X className="h-3 w-3" />
                    Limpar Filtros
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Líder Projeto TI
                  </label>
                  <Select 
                    value={filters.liderProjeto} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, liderProjeto: value }))}
                  >
                    <SelectTrigger className="relative z-50">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent className="relative z-50 bg-white border shadow-lg">
                      <SelectItem value="">Todos</SelectItem>
                      {filterOptions.lideresProjeto.map(lider => (
                        <SelectItem key={lider} value={lider}>{lider}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gerente de Projetos
                  </label>
                  <Select 
                    value={filters.gerenteProjetos} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, gerenteProjetos: value }))}
                  >
                    <SelectTrigger className="relative z-50">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent className="relative z-50 bg-white border shadow-lg">
                      <SelectItem value="">Todos</SelectItem>
                      {filterOptions.gerentesProjetos.map(gerente => (
                        <SelectItem key={gerente} value={gerente}>{gerente}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo
                  </label>
                  <Select 
                    value={filters.inovacaoMelhoria} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, inovacaoMelhoria: value }))}
                  >
                    <SelectTrigger className="relative z-50">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent className="relative z-50 bg-white border shadow-lg">
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="Inovação">Inovação</SelectItem>
                      <SelectItem value="Melhoria">Melhoria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status do Projeto
                  </label>
                  <Select 
                    value={filters.statusProjeto} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, statusProjeto: value }))}
                  >
                    <SelectTrigger className="relative z-50">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent className="relative z-50 bg-white border shadow-lg">
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="green">Verde (No prazo)</SelectItem>
                      <SelectItem value="yellow">Amarelo (Atenção)</SelectItem>
                      <SelectItem value="red">Vermelho (Atrasado)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time TI
                  </label>
                  <Select 
                    value={filters.timeTI} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, timeTI: value }))}
                  >
                    <SelectTrigger className="relative z-50">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent className="relative z-50 bg-white border shadow-lg">
                      <SelectItem value="">Todos</SelectItem>
                      {filterOptions.timesTI.map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Lista de Projetos
              <span className="text-sm font-normal text-gray-500">
                {filteredProjects.length} de {projects.length} projetos
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
                  {filteredProjects.map(project => {
                    const percentualPrevisto = calculatePercentualPrevisto(project.cronograma);
                    const percentualRealizado = calculatePercentualRealizado(project.cronograma);
                    const desvio = calculateDesvio(percentualPrevisto, percentualRealizado);
                    const statusProjeto = getStatusProjeto(desvio);
                    const statusOrcamento = getStatusOrcamento(project.cronograma);
                    const statusGeral = getStatusGeral(project.cronograma);
                    const dataFimPrevista = getDataFimPrevista(project.cronograma);

                    return (
                      <tr 
                        key={project.id} 
                        className="hover:bg-gray-50 cursor-pointer" 
                        onClick={() => onSelectProject(project)}
                      >
                        <td className="p-3 border-b font-medium text-blue-600 hover:text-blue-800">
                          {project.nome}
                        </td>
                        <td className="p-3 border-b">{percentualPrevisto}%</td>
                        <td className="p-3 border-b">{percentualRealizado}%</td>
                        <td className="p-3 border-b">
                          <span className={desvio >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {desvio > 0 ? '+' : ''}{desvio}%
                          </span>
                        </td>
                        <td className="p-3 border-b">
                          <div className={`w-4 h-4 rounded-full bg-${statusProjeto}-500`}></div>
                        </td>
                        <td className="p-3 border-b">{dataFimPrevista}</td>
                        <td className="p-3 border-b">
                          <span className={getStatusOrcamentoColor(statusOrcamento)}>
                            {statusOrcamento}
                          </span>
                        </td>
                        <td className="p-3 border-b">{project.areaNegocio}</td>
                        <td className="p-3 border-b">{project.timeTI}</td>
                        <td className="p-3 border-b">{project.liderProjetosTI}</td>
                        <td className="p-3 border-b">{project.gerenteProjetos}</td>
                        <td className="p-3 border-b">
                          <Badge variant={project.inovacaoMelhoria === 'Inovação' ? 'default' : 'secondary'}>
                            {project.inovacaoMelhoria}
                          </Badge>
                        </td>
                        <td className="p-3 border-b">{statusGeral}</td>
                        <td className="p-3 border-b">
                          <Badge variant={project.estrategicoTatico === 'Estratégico' ? 'default' : 'outline'}>
                            {project.estrategicoTatico}
                          </Badge>
                        </td>
                        <td className="p-3 border-b">
                          <div className="flex gap-1">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={(e) => showReport(project, e)} 
                              className="flex items-center gap-1 font-bold rounded-md bg-slate-200 hover:bg-slate-100"
                            >
                              <BarChart className="h-3 w-3" />
                              Gráficos
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex items-center gap-1 text-red-600 hover:text-red-700" 
                              onClick={(e) => deleteProject(project.id, e)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
