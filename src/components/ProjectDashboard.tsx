
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Project } from '@/types/project';
import { 
  calculatePercentualPrevisto, 
  calculatePercentualRealizado, 
  getStatusGeral,
  getFarolStatus,
  calculateDesvio
} from '@/utils/projectCalculations';
import { ArrowLeft, RotateCcw, ChevronDown } from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

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
      statusGeral: ['Não Iniciado', 'Em Andamento', 'Concluído'],
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

    // Top 10 Líderes de Projeto
    const liderData = filterOptions.gerentesProjeto
      .map(gerente => {
        const count = filteredProjects.filter(p => p.gerenteProjetos === gerente).length;
        return { name: gerente.length > 20 ? gerente.substring(0, 20) + '...' : gerente, fullName: gerente, value: count };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Distribuição por Status
    const statusData = filterOptions.statusGeral.map(status => {
      const count = filteredProjects.filter(p => getStatusGeral(p.cronograma) === status).length;
      let color = '#6B7280';
      if (status === 'Concluído') color = '#10B981';
      if (status === 'Em Andamento') color = '#3B82F6';
      if (status === 'Não Iniciado') color = '#F59E0B';
      return { name: status, value: count, color };
    });

    return { classificacaoData, tipoData, areaData, liderData, statusData };
  }, [filteredProjects, filterOptions]);

  // KPIs
  const kpis = useMemo(() => {
    const total = filteredProjects.length;
    const emAndamento = filteredProjects.filter(p => getStatusGeral(p.cronograma) === 'Em Andamento').length;
    const concluidos = filteredProjects.filter(p => getStatusGeral(p.cronograma) === 'Concluído').length;
    const percentualConclusao = total > 0 ? Math.round((concluidos / total) * 100) : 0;

    // Calcular projetos atrasados (farol vermelho)
    const atrasados = filteredProjects.filter(project => {
      const percentualPrevisto = calculatePercentualPrevisto(project.cronograma);
      const percentualRealizado = calculatePercentualRealizado(project.cronograma);
      const desvio = calculateDesvio(percentualPrevisto, percentualRealizado);
      return getFarolStatus(desvio) === 'Vermelho';
    }).length;

    return { total, emAndamento, atrasados, percentualConclusao };
  }, [filteredProjects]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${label}: ${payload[0].value}`}</p>
          {payload[0].payload.fullName && (
            <p className="text-sm text-gray-600">{payload[0].payload.fullName}</p>
          )}
        </div>
      );
    }
    return null;
  };

  const gerentesFiltrados = filterOptions.gerentesProjeto.filter(gerente => 
    gerente.toLowerCase().includes(searchGerente.toLowerCase())
  );

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
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filtros</CardTitle>
              <Button onClick={resetFilters} variant="outline" size="sm" className="flex items-center gap-2">
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Tipo de Projeto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Projeto</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {filters.tiposProjeto.length > 0 ? `${filters.tiposProjeto.length} selecionados` : 'Todos'}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {filterOptions.tiposProjeto.map(tipo => (
                      <DropdownMenuCheckboxItem
                        key={tipo}
                        checked={filters.tiposProjeto.includes(tipo)}
                        onCheckedChange={(checked) => updateFilter('tiposProjeto', tipo, checked)}
                      >
                        {tipo}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Classificação */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Classificação</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {filters.classificacoes.length > 0 ? `${filters.classificacoes.length} selecionados` : 'Todos'}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {filterOptions.classificacoes.map(classificacao => (
                      <DropdownMenuCheckboxItem
                        key={classificacao}
                        checked={filters.classificacoes.includes(classificacao)}
                        onCheckedChange={(checked) => updateFilter('classificacoes', classificacao, checked)}
                      >
                        {classificacao}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Time de Projetos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time TI</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {filters.timesProjetos.length > 0 ? `${filters.timesProjetos.length} selecionados` : 'Todos'}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {filterOptions.timesProjetos.map(time => (
                      <DropdownMenuCheckboxItem
                        key={time}
                        checked={filters.timesProjetos.includes(time)}
                        onCheckedChange={(checked) => updateFilter('timesProjetos', time, checked)}
                      >
                        {time}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Gerente de Projeto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gerente de Projeto</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {filters.gerentesProjeto.length > 0 ? `${filters.gerentesProjeto.length} selecionados` : 'Todos'}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <div className="p-2">
                      <Input
                        placeholder="Buscar gerente..."
                        value={searchGerente}
                        onChange={(e) => setSearchGerente(e.target.value)}
                        className="mb-2"
                      />
                    </div>
                    {gerentesFiltrados.map(gerente => (
                      <DropdownMenuCheckboxItem
                        key={gerente}
                        checked={filters.gerentesProjeto.includes(gerente)}
                        onCheckedChange={(checked) => updateFilter('gerentesProjeto', gerente, checked)}
                      >
                        {gerente}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Status Geral */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Geral</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {filters.statusGeral.length > 0 ? `${filters.statusGeral.length} selecionados` : 'Todos'}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {filterOptions.statusGeral.map(status => (
                      <DropdownMenuCheckboxItem
                        key={status}
                        checked={filters.statusGeral.includes(status)}
                        onCheckedChange={(checked) => updateFilter('statusGeral', status, checked)}
                      >
                        {status}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Área de Negócio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Área de Negócio</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {filters.areasNegocio.length > 0 ? `${filters.areasNegocio.length} selecionados` : 'Todos'}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {filterOptions.areasNegocio.map(area => (
                      <DropdownMenuCheckboxItem
                        key={area}
                        checked={filters.areasNegocio.includes(area)}
                        onCheckedChange={(checked) => updateFilter('areasNegocio', area, checked)}
                      >
                        {area}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{kpis.total}</div>
                <div className="text-sm text-gray-600">Total de Projetos</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">{kpis.emAndamento}</div>
                <div className="text-sm text-gray-600">Em Andamento</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500">{kpis.atrasados}</div>
                <div className="text-sm text-gray-600">Atrasados</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{kpis.percentualConclusao}%</div>
                <div className="text-sm text-gray-600">Taxa de Conclusão</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Projetos por Classificação */}
          <Card>
            <CardHeader>
              <CardTitle>Projetos por Classificação</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.classificacaoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Projetos por Tipo */}
          <Card>
            <CardHeader>
              <CardTitle>Projetos por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.tipoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Projetos por Área de Negócio */}
          <Card>
            <CardHeader>
              <CardTitle>Projetos por Área de Negócio</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.areaData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top 10 Líderes de Projeto */}
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Gerentes de Projeto</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.liderData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#06B6D4" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribuição por Status */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Distribuição por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
