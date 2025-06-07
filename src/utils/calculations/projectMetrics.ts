
import { CronogramaItem } from '@/types/project';
import { calculateParticipacaoEtapaNormalizada, calculateRealizadoEtapa } from './participationCalculations';
import { calculatePlanejadoEtapa } from './scheduleCalculations';

export const calculatePercentualPrevisto = (cronograma: CronogramaItem[]): number => {
  if (cronograma.length === 0) return 0;
  
  // Somatória do campo "% Planejado Etapa"
  const participacoesNormalizadas = calculateParticipacaoEtapaNormalizada(cronograma);
  const totalDias = cronograma.reduce((total, item) => {
    const inicio = new Date(item.inicio);
    const hoje = new Date();
    const fim = item.percentualRealizado === 100 && item.fim ? new Date(item.fim) : hoje;
    const diffTime = fim.getTime() - inicio.getTime();
    const dias = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    return total + dias;
  }, 0);
  
  const total = cronograma.reduce((total, item, index) => {
    const planejado = calculatePlanejadoEtapa(item, participacoesNormalizadas[index], totalDias);
    return total + planejado;
  }, 0);
  
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
