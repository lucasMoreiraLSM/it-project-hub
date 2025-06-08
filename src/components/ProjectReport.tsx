import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/types/project';
import { calculatePercentualPrevisto, calculatePercentualRealizado, calculateDesvio, getFarolStatus, getDiasNaEtapa, getStatusCronograma, getStatusCronogramaStyle } from '@/utils/projectCalculations';
import { ArrowLeft } from 'lucide-react';

interface ProjectReportProps {
  project: Project;
  onBack: () => void;
}

export const ProjectReport: React.FC<ProjectReportProps> = ({
  project,
  onBack
}) => {
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

  return <div className="min-h-screen bg-gray-50 p-6 py-[14px]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Relatório do Projeto</h1>
        </div>

        <div className="space-y-6">
          {/* Dados do Projeto */}
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

          {/* Cronograma de Atividades */}
          <Card className="mx-0 my-[10px]">
            <CardHeader className="mx-0">
              <CardTitle>📊 Cronograma de Atividades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 p-2 text-left">Etapa</th>
                      <th className="border border-gray-200 p-2 text-left">Início</th>
                      <th className="border border-gray-200 p-2 text-left">Fim</th>
                      <th className="border border-gray-200 p-2 text-left">Status</th>
                      <th className="border border-gray-200 p-2 text-left">% Previsto</th>
                      <th className="border border-gray-200 p-2 text-left">% Realizado</th>
                      <th className="border border-gray-200 p-2 text-left">Dias na Etapa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.cronograma.map((item, index) => {
                    const diasNaEtapa = getDiasNaEtapa(item.inicio, item.fim, item.percentualRealizado);
                    const status = getStatusCronograma(item);
                    return <tr key={index}>
                          <td className="border border-gray-200 p-2">{item.etapa}</td>
                          <td className="border border-gray-200 p-2">
                            {new Date(item.inicio).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="border border-gray-200 p-2">
                            {new Date(item.fim).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="border border-gray-200 p-2">
                            <span className={`px-2 py-1 rounded text-xs ${getStatusCronogramaStyle(status)}`}>
                              {status}
                            </span>
                          </td>
                          <td className="border border-gray-200 p-2 text-center">{item.percentualPrevisto}%</td>
                          <td className="border border-gray-200 p-2 text-center">{item.percentualRealizado}%</td>
                          <td className="border border-gray-200 p-2 text-center">{diasNaEtapa}</td>
                        </tr>;
                  })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Etapas Executadas */}
          <Card className="mx-0 px-0 py-0 my-[10px]">
            <CardHeader className="my-0 mx-[33px]">
              <CardTitle>✅ Etapas Executadas</CardTitle>
            </CardHeader>
            <CardContent>
              {project.etapasExecutadas.length > 0 ? <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 p-2 text-left">Atividade</th>
                        <th className="border border-gray-200 p-2 text-left">Data de Conclusão</th>
                      </tr>
                    </thead>
                    <tbody>
                      {project.etapasExecutadas.map((etapa, index) => <tr key={index}>
                          <td className="border border-gray-200 p-2">{etapa.atividade}</td>
                          <td className="border border-gray-200 p-2">
                            {etapa.dataConclusao ? new Date(etapa.dataConclusao).toLocaleDateString('pt-BR') : 'Não informado'}
                          </td>
                        </tr>)}
                    </tbody>
                  </table>
                </div> : <p className="text-gray-500">Nenhuma etapa executada</p>}
            </CardContent>
          </Card>

          {/* Próximas Etapas */}
          <Card className="mx-0 my-[10px]">
            <CardHeader className="mx-0">
              <CardTitle>🗓️ Próximas Etapas</CardTitle>
            </CardHeader>
            <CardContent>
              {project.proximasEtapas.length > 0 ? <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 p-2 text-left">Atividade</th>
                        <th className="border border-gray-200 p-2 text-left">Responsável</th>
                        <th className="border border-gray-200 p-2 text-left">Previsão</th>
                      </tr>
                    </thead>
                    <tbody>
                      {project.proximasEtapas.map((etapa, index) => <tr key={index}>
                          <td className="border border-gray-200 p-2">{etapa.atividade}</td>
                          <td className="border border-gray-200 p-2">{etapa.responsavel}</td>
                          <td className="border border-gray-200 p-2">
                            {new Date(etapa.previsao).toLocaleDateString('pt-BR')}
                          </td>
                        </tr>)}
                    </tbody>
                  </table>
                </div> : <p className="text-gray-500">Nenhuma próxima etapa definida</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};
