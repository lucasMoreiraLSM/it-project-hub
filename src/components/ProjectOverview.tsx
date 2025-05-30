
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/types/project';
import { 
  calculatePercentualPrevisto, 
  calculatePercentualRealizado, 
  calculateDesvio,
  getStatusProjeto,
  getStatusOrcamento,
  getStatusOrcamentoColor,
  getStatusGeral,
  getDataFimPrevista
} from '@/utils/projectCalculations';
import { BarChart, Plus } from 'lucide-react';

interface ProjectOverviewProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onUpdateProjects: (projects: Project[]) => void;
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({ 
  projects, 
  onSelectProject,
  onUpdateProjects 
}) => {
  const createNewProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      nome: 'Novo Projeto',
      areaNegocio: '',
      inovacaoMelhoria: 'Melhoria',
      timeTI: '',
      sponsor: '',
      productOwner: '',
      gerenteProjetos: '',
      liderProjetosTI: '',
      escopo: [],
      objetivos: [],
      etapasExecutadas: [],
      proximasEtapas: [],
      cronograma: [],
      pontosAtencao: [],
      estrategicoTatico: 'Tático'
    };
    
    const updatedProjects = [...projects, newProject];
    onUpdateProjects(updatedProjects);
    onSelectProject(newProject);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Visão Geral dos Projetos</h1>
          <Button onClick={createNewProject} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Projeto
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Projetos</CardTitle>
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
                  {projects.map((project) => {
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
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <BarChart className="h-3 w-3" />
                            Gráficos
                          </Button>
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
