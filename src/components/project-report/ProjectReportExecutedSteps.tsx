
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Project } from '@/types/project';

interface ProjectReportExecutedStepsProps {
  project: Project;
}

export const ProjectReportExecutedSteps: React.FC<ProjectReportExecutedStepsProps> = ({ project }) => {
  return (
    <Card className="mx-0 px-0 py-0 my-[10px]">
      <CardHeader className="my-0 mx-[33px]">
        <CardTitle>✅ Etapas Executadas</CardTitle>
      </CardHeader>
      <CardContent>
        {project.etapasExecutadas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 p-2 text-left">Atividade</th>
                  <th className="border border-gray-200 p-2 text-left">Data de Conclusão</th>
                </tr>
              </thead>
              <tbody>
                {project.etapasExecutadas.map((etapa, index) => (
                  <tr key={index}>
                    <td className="border border-gray-200 p-2">{etapa.atividade}</td>
                    <td className="border border-gray-200 p-2">
                      {etapa.dataConclusao ? new Date(etapa.dataConclusao).toLocaleDateString('pt-BR') : 'Não informado'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Nenhuma etapa executada</p>
        )}
      </CardContent>
    </Card>
  );
};
