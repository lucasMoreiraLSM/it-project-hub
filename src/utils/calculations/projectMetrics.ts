
import { CronogramaItem } from '@/types/project';
import { calculateParticipacaoEtapaNormalizada, calculateRealizadoEtapa } from './participationCalculations';
import { calculatePlanejadoEtapas } from './scheduleCalculations';

export const calculatePercentualPrevisto = (cronograma: CronogramaItem[]): number => {
  if (cronograma.length === 0) return 0;
  
  // Somatória do campo "% Planejado Etapa"
  const planejados = calculatePlanejadoEtapas(cronograma);
  const total = planejados.reduce((total, planejado) => total + planejado, 0);
  
  // Garantir que não ultrapasse 100%
  return Math.min(100, Math.round(total));
};

export const calculatePercentualRealizado = (cronograma: CronogramaItem[]): number => {
  if (cronograma.length === 0) return 0;
  
  // Somatória do campo "% Realizado Etapa"
  const participacoesNormalizadas = calculateParticipacaoEtapaNormalizada(cronograma);
  const total = cronograma.reduce((total, item, index) => {
    const realizado = calculateRealizadoEtapa(item.percentualRealizado, participacoesNormalizadas[index]);
    return total + realizado;
  }, 0);
  
  return Math.round(total);
};

export const calculateDesvio = (previsto: number, realizado: number): number => {
  return previsto - realizado;
};

export const getFarolStatus = (desvio: number): 'Verde' | 'Amarelo' | 'Vermelho' => {
  const desvioAbs = Math.abs(desvio);
  if (desvioAbs < 5) return 'Verde';
  if (desvioAbs <= 8) return 'Amarelo';
  return 'Vermelho';
};

export const getStatusProjeto = (desvio: number): 'green' | 'yellow' | 'red' => {
  const farol = getFarolStatus(desvio);
  switch (farol) {
    case 'Verde': return 'green';
    case 'Amarelo': return 'yellow';
    case 'Vermelho': return 'red';
  }
};
