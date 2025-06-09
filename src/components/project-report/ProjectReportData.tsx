
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/types/project';
import { calculatePercentualPrevisto, calculatePercentualRealizado, calculateDesvio, getFarolStatus, getDiasNaEtapa } from '@/utils/projectCalculations';

interface ProjectReportDataProps {
  project: Project;
}

export const ProjectReportData: React.FC<ProjectReportDataProps> = ({ project }) => {
  const percentualPrevisto = calculatePercentualPrevisto(project.cronograma);
  const percentualRealizado = calculatePercentualRealizado(project.cronograma);
  const desvio = calculateDesvio(percentualPrevisto, percentualRealizado);
  const farol = getFarolStatus(desvio);

  // Calcular o total de dias
  const totalDias = project.cronograma.reduce((total, item) => {
    const diasNaEtapa = getDiasNaEtapa(item.inicio, item.fim, item.percentualRealizado);
    return total + diasNaEtapa;
  }, 0);

  const getFarolColor = (status: string) => {
    switch (status) {
      case 'Verde':
        return 'bg-green-500';
      case 'Amarelo':
        return 'bg-yellow-500';
      case 'Vermelho':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>📌 Dados do Projeto</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <strong>Nome do Projeto:</strong> {project.nome}
          </div>
          <div>
            <strong>Área de Negócio:</strong> {project.areaNegocio}
          </div>
          <div>
            <strong>Tipo:</strong> 
            <Badge variant={project.inovacaoMelhoria === 'Inovação' ? 'default' : 'secondary'} className="ml-2">
              {project.inovacaoMelhoria}
            </Badge>
          </div>
          <div>
            <strong>Time TI:</strong> {project.timeTI}
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="text-sm font-medium text-gray-600">% Previsto</div>
            <div className="text-2xl font-bold text-blue-600">{percentualPrevisto}%</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600">% Realizado</div>
            <div className="text-2xl font-bold text-green-600">{percentualRealizado}%</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600">% Desvio</div>
            <div className={`text-2xl font-bold ${desvio > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {desvio > 0 ? '+' : ''}{desvio}%
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600">Total de Dias</div>
            <div className="text-2xl font-bold text-purple-600">{totalDias}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600">Farol</div>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${getFarolColor(farol)}`}></div>
              <span className="font-medium">{farol}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <strong>Sponsor:</strong> {project.sponsor}
          </div>
          <div>
            <strong>Product Owner:</strong> {project.productOwner}
          </div>
          <div>
            <strong>Gerente de Projetos:</strong> {project.gerenteProjetos}
          </div>
          <div>
            <strong>Líder Projetos TI:</strong> {project.liderProjetosTI}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
