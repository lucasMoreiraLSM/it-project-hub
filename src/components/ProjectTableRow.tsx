import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/types/project';
import { BarChart, Trash2 } from 'lucide-react';
import { calculatePercentualPrevisto, calculatePercentualRealizado, calculateDesvio, getStatusProjeto, getStatusOrcamento, getStatusOrcamentoColor, getStatusGeral, getDataFimPrevista } from '@/utils/projectCalculations';

interface ProjectTableRowProps {
  project: Project;
  onSelectProject: (project: Project) => void;
  onShowReport: (project: Project, event: React.MouseEvent) => void;
  onDeleteProject: (projectId: string, event: React.MouseEvent) => void;
}

export const ProjectTableRow: React.FC<ProjectTableRowProps> = ({
  project,
  onSelectProject,
  onShowReport,
  onDeleteProject
}) => {
  const percentualPrevisto = calculatePercentualPrevisto(project.cronograma);
  const percentualRealizado = calculatePercentualRealizado(project.cronograma);
  const desvio = calculateDesvio(percentualPrevisto, percentualRealizado);
  const statusProjeto = getStatusProjeto(desvio);
  const statusOrcamento = getStatusOrcamento(project.cronograma);
  const statusGeral = getStatusGeral(project.cronograma);
  const dataFimPrevista = getDataFimPrevista(project.cronograma);

  return (
    <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => onSelectProject(project)}>
      <td className="p-3 border-b font-medium text-blue-600 hover:text-blue-800 py-[12px] px-[12px] mx-0 rounded-sm">
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
          <Button variant="outline" size="sm" onClick={e => onShowReport(project, e)} className="flex items-center gap-1 font-bold rounded-md bg-slate-200 hover:bg-slate-100">
            <BarChart className="h-3 w-3" />
            Report
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1 text-red-600 hover:text-red-700" onClick={e => onDeleteProject(project.id, e)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </td>
    </tr>
  );
};
