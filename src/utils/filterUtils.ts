
import { Project } from '@/types/project';
import { Filters, FilterOptions } from '@/types/filters';
import { calculatePercentualPrevisto, calculatePercentualRealizado, calculateDesvio, getStatusProjeto } from '@/utils/projectCalculations';

export const getFilterOptions = (projects: Project[]): FilterOptions => {
  const lideresProjeto = [...new Set(projects.map(p => p.liderProjetosTI).filter(Boolean))];
  const gerentesProjetos = [...new Set(projects.map(p => p.gerenteProjetos).filter(Boolean))];
  const timesTI = [...new Set(projects.map(p => p.timeTI).filter(Boolean))];
  
  return {
    lideresProjeto,
    gerentesProjetos,
    timesTI
  };
};

export const filterProjects = (projects: Project[], filters: Filters): Project[] => {
  return projects.filter(project => {
    const percentualPrevisto = calculatePercentualPrevisto(project.cronograma);
    const percentualRealizado = calculatePercentualRealizado(project.cronograma);
    const desvio = calculateDesvio(percentualPrevisto, percentualRealizado);
    const statusProjeto = getStatusProjeto(desvio);
    
    if (filters.liderProjeto && project.liderProjetosTI !== filters.liderProjeto) return false;
    if (filters.gerenteProjetos && project.gerenteProjetos !== filters.gerenteProjetos) return false;
    if (filters.inovacaoMelhoria && project.inovacaoMelhoria !== filters.inovacaoMelhoria) return false;
    if (filters.statusProjeto && statusProjeto !== filters.statusProjeto) return false;
    if (filters.timeTI && project.timeTI !== filters.timeTI) return false;
    
    return true;
  });
};

export const hasActiveFilters = (filters: Filters): boolean => {
  return Object.values(filters).some(filter => filter !== '');
};

export const clearFilters = (): Filters => ({
  liderProjeto: '',
  gerenteProjetos: '',
  inovacaoMelhoria: '',
  statusProjeto: '',
  timeTI: ''
});
