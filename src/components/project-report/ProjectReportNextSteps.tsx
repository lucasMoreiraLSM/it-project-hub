
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Project } from '@/types/project';

interface ProjectReportNextStepsProps {
  project: Project;
}

export const ProjectReportNextSteps: React.FC<ProjectReportNextStepsProps> = ({ project }) => {
  return (
    <Card className="mx-0 my-[10px]">
      <CardHeader className="mx-0">
        <CardTitle>🗓️ Próximas Etapas</CardTitle>
      </CardHeader>
      <CardContent>
        {project.proximasEtapas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 p-2 text-left">Atividade</th>
                  <th className="border border-gray-200 p-2 text-left">Responsável</th>
                  <th className="border border-gray-200 p-2 text-left">Previsão</th>
                </tr>
              </thead>
              <tbody>
                {project.proximasEtapas.map((etapa, index) => (
                  <tr key={index}>
                    <td className="border border-gray-200 p-2">{etapa.atividade}</td>
                    <td className="border border-gray-200 p-2">{etapa.responsavel}</td>
                    <td className="border border-gray-200 p-2">
                      {new Date(etapa.previsao).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Nenhuma próxima etapa definida</p>
        )}
      </CardContent>
    </Card>
  );
};
