
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Project } from '@/types/project';
import { 
  calculatePercentualPrevisto, 
  calculatePercentualRealizado, 
  getStatusGeral,
  getFarolStatus,
  calculateDesvio
} from '@/utils/projectCalculations';
import { ArrowLeft } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProjectDashboardProps {
  projects: Project[];
  onBack: () => void;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ projects, onBack }) => {
  // Dados para gráfico de status geral
  const statusData = projects.reduce((acc, project) => {
    const status = getStatusGeral(project.cronograma);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusChartData = Object.entries(statusData).map(([status, count]) => ({
    name: status,
    value: count
  }));

  // Dados para gráfico de farol
  const farolData = projects.reduce((acc, project) => {
    const percentualPrevisto = calculatePercentualPrevisto(project.cronograma);
    const percentualRealizado = calculatePercentualRealizado(project.cronograma);
    const desvio = calculateDesvio(percentualPrevisto, percentualRealizado);
    const farol = getFarolStatus(desvio);
    acc[farol] = (acc[farol] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const farolChartData = Object.entries(farolData).map(([farol, count]) => ({
    name: farol,
    value: count
  }));

  // Dados para gráfico de desempenho por projeto
  const performanceData = projects.map(project => {
    const percentualPrevisto = calculatePercentualPrevisto(project.cronograma);
    const percentualRealizado = calculatePercentualRealizado(project.cronograma);
    return {
      name: project.nome.length > 20 ? project.nome.substring(0, 20) + '...' : project.nome,
      'Previsto': percentualPrevisto,
      'Realizado': percentualRealizado
    };
  });

  // Dados para gráfico de inovação vs melhoria
  const tipoData = projects.reduce((acc, project) => {
    acc[project.inovacaoMelhoria] = (acc[project.inovacaoMelhoria] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const tipoChartData = Object.entries(tipoData).map(([tipo, count]) => ({
    name: tipo,
    value: count
  }));

  const COLORS = {
    'Verde': '#10B981',
    'Amarelo': '#F59E0B',
    'Vermelho': '#EF4444',
    'Em Andamento': '#3B82F6',
    'Concluído': '#10B981',
    'Não Iniciado': '#6B7280',
    'Inovação': '#8B5CF6',
    'Melhoria': '#06B6D4'
  };

  const getColor = (name: string, index: number) => {
    return COLORS[name as keyof typeof COLORS] || `hsl(${index * 137.5}, 70%, 50%)`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Painel de Gráficos - Todos os Projetos</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Status Geral dos Projetos */}
          <Card>
            <CardHeader>
              <CardTitle>Status Geral dos Projetos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColor(entry.name, index)} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status do Farol */}
          <Card>
            <CardHeader>
              <CardTitle>Status do Farol</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={farolChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {farolChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColor(entry.name, index)} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Inovação vs Melhoria */}
          <Card>
            <CardHeader>
              <CardTitle>Inovação vs Melhoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={tipoChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tipoChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColor(entry.name, index)} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Resumo Numérico */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo Numérico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{projects.length}</div>
                  <div className="text-sm text-gray-600">Total de Projetos</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {statusData['Concluído'] || 0}
                  </div>
                  <div className="text-sm text-gray-600">Projetos Concluídos</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-3xl font-bold text-yellow-600">
                    {statusData['Em Andamento'] || 0}
                  </div>
                  <div className="text-sm text-gray-600">Em Andamento</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-600">
                    {statusData['Não Iniciado'] || 0}
                  </div>
                  <div className="text-sm text-gray-600">Não Iniciados</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Desempenho por Projeto */}
        <Card>
          <CardHeader>
            <CardTitle>Desempenho por Projeto (% Previsto vs % Realizado)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Previsto" fill="#3B82F6" />
                <Bar dataKey="Realizado" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
