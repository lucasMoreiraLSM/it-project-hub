
import { CronogramaItem } from '@/types/project';

export const getStatusCronograma = (item: CronogramaItem): string => {
  const hoje = new Date();
  const fimPrevisto = new Date(item.fim);
  
  // Concluído: % Realizado igual a 100
  if (item.percentualRealizado === 100) return 'Concluído';
  
  // Não iniciado: % Previsto igual a 0 e % Realizado menor ou igual a 0
  if (item.percentualPrevisto === 0 && item.percentualRealizado <= 0) return 'Não Iniciado';
  
  // Atrasado: Quando a "data fim" é maior que a "data atual" e % realizado é menor que 100
  if (fimPrevisto < hoje && item.percentualRealizado < 100) return 'Atrasado';
  
  // Em andamento: % Realizado > 0 e % Previsto < 100
  if (item.percentualRealizado > 0 && item.percentualPrevisto < 100) return 'Em Andamento';
  
  return 'Não Iniciado';
};

export const getStatusGeral = (cronograma: CronogramaItem[]): string => {
  if (cronograma.length === 0) return 'Não Iniciado';
  
  const percentualRealizado = calculatePercentualRealizado(cronograma);
  
  if (percentualRealizado === 0) return 'Não Iniciado';
  if (percentualRealizado === 100) return 'Concluído';
  return 'Em Andamento';
};

export const getStatusOrcamento = (cronograma: CronogramaItem[]): 'Em Andamento' | 'Atrasado' | 'Concluído' => {
  const hoje = new Date();
  const percentualRealizado = calculatePercentualRealizado(cronograma);
  
  if (percentualRealizado === 100) return 'Concluído';
  
  const atrasado = cronograma.some(item => {
    const fimPrevisto = new Date(item.fim);
    return fimPrevisto < hoje && item.percentualRealizado < 100;
  });
  
  return atrasado ? 'Atrasado' : 'Em Andamento';
};

export const getStatusOrcamentoColor = (status: string): string => {
  switch (status) {
    case 'Em Andamento': return 'text-blue-500';
    case 'Atrasado': return 'text-red-500';
    case 'Concluído': return 'text-green-500';
    default: return 'text-gray-500';
  }
};

export const getStatusCronogramaBadgeVariant = (status: string): 'default' | 'destructive' | 'secondary' | 'outline' => {
  switch (status) {
    case 'Concluído': return 'default';
    case 'Atrasado': return 'destructive';
    case 'Em Andamento': return 'secondary';
    case 'Não Iniciado': return 'outline';
    default: return 'outline';
  }
};

export const getStatusCronogramaStyle = (status: string): string => {
  switch (status) {
    case 'Não Iniciado': return 'bg-[#F5F2F0] text-black font-bold';
    case 'Em Andamento': return 'bg-[#5D9AF5] text-white font-bold';
    case 'Atrasado': return 'bg-[#F04D58] text-white font-bold';
    case 'Concluído': return 'bg-[#59F0A7] text-black font-bold';
    default: return 'bg-gray-500 text-white font-bold';
  }
};

// Import needed for circular dependency resolution
import { calculatePercentualRealizado } from './projectMetrics';
