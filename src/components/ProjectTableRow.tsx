import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
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
  return <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => onSelectProject(project)}>
      <TableCell className="font-medium text-blue-600 hover:text-blue-800 max-w-[200px] truncate">
        <div className="truncate" title={project.nome}>
          {project.nome}
        </div>
      </TableCell>
      <TableCell className="text-center text-sm">{percentualPrevisto}%</TableCell>
      <TableCell className="text-center text-sm">{percentualRealizado}%</TableCell>
      <TableCell className="text-center text-sm">
        <span className={desvio >= 0 ? 'text-green-600' : 'text-red-600'}>
          {desvio > 0 ? '+' : ''}{desvio}%
        </span>
      </TableCell>
      <TableCell className="text-center">
        <div className={`w-3 h-3 rounded-full bg-${statusProjeto}-500 mx-auto`}></div>
      </TableCell>
      <TableCell className="text-center text-sm">{dataFimPrevista}</TableCell>
      <TableCell className="text-center text-sm">
        <span className={getStatusOrcamentoColor(statusOrcamento)}>
          {statusOrcamento}
        </span>
      </TableCell>
      <TableCell className="text-sm max-w-[120px] truncate" title={project.areaNegocio}>
        {project.areaNegocio}
      </TableCell>
      <TableCell className="text-sm max-w-[100px] truncate" title={project.timeTI}>
        {project.timeTI}
      </TableCell>
      <TableCell className="text-sm max-w-[120px] truncate" title={project.liderProjetosTI}>
        {project.liderProjetosTI}
      </TableCell>
      <TableCell className="text-sm max-w-[120px] truncate" title={project.gerenteProjetos}>
        {project.gerenteProjetos}
      </TableCell>
      <TableCell className="text-center px-0">
        <Badge variant={project.inovacaoMelhoria === 'Inovação' ? 'default' : 'secondary'} className="text-xs mx-0 px-[25px]">
          {project.inovacaoMelhoria === 'Inovação' ? 'Inov' : 'Melh'}
        </Badge>
      </TableCell>
      <TableCell className="text-center text-sm">{statusGeral}</TableCell>
      <TableCell className="text-center">
        <Badge variant={project.estrategicoTatico === 'Estratégico' ? 'default' : 'outline'} className="text-xs px-[20px]">
          {project.estrategicoTatico === 'Estratégico' ? 'Estr' : 'Tát'}
        </Badge>
      </TableCell>
      <TableCell className="text-center">
        <div className="flex gap-1 justify-center">
          <Button variant="outline" size="sm" onClick={e => onShowReport(project, e)} className="text-xs px-2 py-1 h-7">
            <BarChart className="h-3 w-3 mr-1" />
            Report
          </Button>
          <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-7 text-red-600 hover:text-red-700" onClick={e => onDeleteProject(project.id, e)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>;
};