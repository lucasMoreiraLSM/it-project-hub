
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Project } from '@/types/project';
import { 
  calculatePercentualPrevisto, 
  calculatePercentualRealizado, 
  getStatusGeral,
  getFarolStatus,
  calculateDesvio
} from '@/utils/projectCalculations';
import { ArrowLeft } from 'lucide-react';
import { DashboardFilters } from './dashboard/DashboardFilters';
import { DashboardKPIs } from './dashboard/DashboardKPIs';
import { DashboardCharts } from './dashboard/DashboardCharts';

interface ProjectDashboardProps {
  projects: Project[];
  onBack: () => void;
}

interface Filters {
  tiposProjeto: string[];
  classificacoes: string[];
  timesProjetos: string[];
  gerentesProjeto: string[];
  statusGeral: string[];
  areasNegocio: string[];
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ projects, onBack }) => {
  const [filters, setFilters] = useState<Filters>({
    tiposProjeto: [],
    classificacoes: [],
    timesProjetos: [],
    gerentesProjeto: [],
    statusGeral: [],
    areasNegocio: []
  });

  const [searchGerente, setSearchGerente] = useState('');

  // Extrair opções únicas dos projetos
  const filterOptions = useMemo(() => {
    return {
      tiposProjeto: [...new Set(projects.map(p => p.inovacaoMelhoria).filter(Boolean))],
      classificacoes: [...new Set(projects.map(p => p.estrategicoTatico).filter(Boolean))],
      timesProjetos: [...new Set(projects.map(p => p.timeTI).filter(Boolean))],
      gerentesProjeto: [...new Set(projects.map(p => p.gerenteProjetos).filter(Boolean))],
      statusGeral: ['Não Iniciado', 'Em Andamento', 'Concluído', 'Atrasado'],
      areasNegocio: [...new Set(projects.map(p => p.areaNegocio).filter(Boolean))]
    };
  }, [projects]);

  // Filtrar projetos com base nos filtros selecionados
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const status = getStatusGeral(project.cronograma);
      
      if (filters.tiposProjeto.length > 0 && !filters.tiposProjeto.includes(project.inovacaoMelhoria)) return false;
      if (filters.classificacoes.length > 0 && !filters.classificacoes.includes(project.estrategicoTatico)) return false;
      if (filters.timesProjetos.length > 0 && !filters.timesProjetos.includes(project.timeTI)) return false;
      if (filters.gerentesProjeto.length > 0 && !filters.gerentesProjeto.includes(project.gerenteProjetos)) return false;
      if (filters.statusGeral.length > 0 && !filters.statusGeral.includes(status)) return false;
      if (filters.areasNegocio.length > 0 && !filters.areasNegocio.includes(project.areaNegocio)) return false;
      
      return true;
    });
  }, [projects, filters]);

  // Função para atualizar filtros
  const updateFilter = (filterType: keyof Filters, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: checked 
        ? [...prev[filterType], value]
        : prev[filterType].filter(item => item !== value)
    }));
  };

  // Função para resetar filtros
  const resetFilters = () => {
    setFilters({
      tiposProjeto: [],
      classificacoes: [],
      timesProjetos: [],
      gerentesProjeto: [],
      statusGeral: [],
      areasNegocio: []
    });
    setSearchGerente('');
  };

  // Dados para os gráficos
  const chartData = useMemo(() => {
    // Projetos por Classificação
    const classificacaoData = filterOptions.classificacoes.map(classificacao => {
      const count = filteredProjects.filter(p => p.estrategicoTatico === classificacao).length;
      return { name: classificacao, value: count, color: classificacao === 'Estratégico' ? '#3B82F6' : '#10B981' };
    });

    // Projetos por Tipo
    const tipoData = filterOptions.tiposProjeto.map(tipo => {
      const count = filteredProjects.filter(p => p.inovacaoMelhoria === tipo).length;
      return { name: tipo, value: count, color: tipo === 'Inovação' ? '#8B5CF6' : '#06B6D4' };
    });

    // Projetos por Área de Negócio
    const areaData = filterOptions.areasNegocio.map(area => {
      const count = filteredProjects.filter(p => p.areaNegocio === area).length;
      return { name: area.length > 15 ? area.substring(0, 15) + '...' : area, fullName: area, value: count };
    });

    // Top 10 Gerentes de Projeto
    const gerenteData = filterOptions.gerentesProjeto
      .map(gerente => {
        const count = filteredProjects.filter(p => p.gerenteProjetos === gerente).length;
        return { name: gerente.length > 20 ? gerente.substring(0, 20) + '...' : gerente, fullName: gerente, value: count };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Distribuição por Status Geral
    const statusData = filterOptions.statusGeral.map(status => {
      const count = filteredProjects.filter(p => getStatusGeral(p.cronograma) === status).length;
      let color = '#6B7280';
      if (status === 'Concluído') color = '#10B981';
      if (status === 'Em Andamento') color = '#3B82F6';
      if (status === 'Não Iniciado') color = '#F59E0B';
      if (status === 'Atrasado') color = '#EF4444';
      return { name: status, value: count, color };
    });

    // Projetos por Líder de Projetos TI
    const liderTIData = [...new Set(filteredProjects.map(p => p.liderProjetosTI).filter(Boolean))]
      .map(lider => {
        const count = filteredProjects.filter(p => p.liderProjetosTI === lider).length;
        return { name: lider.length > 25 ? lider.substring(0, 25) + '...' : lider, fullName: lider, value: count };
      })
      .sort((a, b) => b.value - a.value);

    return { classificacaoData, tipoData, areaData, gerenteData, statusData, liderTIData };
  }, [filteredProjects, filterOptions]);

  // KPIs
  const kpis = useMemo(() => {
    const total = filteredProjects.length;
    const emAndamento = filteredProjects.filter(p => getStatusGeral(p.cronograma) === 'Em Andamento').length;
    const concluidos = filteredProjects.filter(p => getStatusGeral(p.cronograma) === 'Concluído').length;
    const percentualConclusao = total > 0 ? Math.round((concluidos / total) * 100) : 0;

    // Calcular projetos atrasados usando status geral
    const atrasados = filteredProjects.filter(p => getStatusGeral(p.cronograma) === 'Atrasado').length;

    return { total, emAndamento, atrasados, percentualConclusao };
  }, [filteredProjects]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Projetos</h1>
        </div>

        {/* Filtros */}
        <DashboardFilters
          filters={filters}
          filterOptions={filterOptions}
          searchGerente={searchGerente}
          onUpdateFilter={updateFilter}
          onResetFilters={resetFilters}
          onSearchGerenteChange={setSearchGerente}
        />

        {/* KPI Cards */}
        <DashboardKPIs kpis={kpis} />

        {/* Gráficos */}
        <DashboardCharts chartData={chartData} />
      </div>
    </div>
  );
};
