
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Project } from '@/types/project';
import { getDiasNaEtapa, getStatusCronograma, getStatusCronogramaStyle } from '@/utils/projectCalculations';

interface ProjectReportScheduleProps {
  project: Project;
}

export const ProjectReportSchedule: React.FC<ProjectReportScheduleProps> = ({ project }) => {
  return (
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
                return (
                  <tr key={index}>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
