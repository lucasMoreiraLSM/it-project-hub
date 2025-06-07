
import { CronogramaItem } from '@/types/project';
import { calculateTotalDias, calculateParticipacaoEtapaNormalizada, getDiasNaEtapa } from './participationCalculations';
import { getStatusCronograma } from './statusCalculations';

export const calculatePlanejadoEtapa = (item: CronogramaItem, participacao: number, totalDias: number): number => {
  const status = getStatusCronograma(item);
  
  switch (status) {
    case 'Não Iniciado':
      return 0;
    case 'Concluído':
    case 'Atrasado':
      return participacao;
    case 'Em Andamento':
      if (totalDias === 0) return 0;
      const diasNaEtapa = getDiasNaEtapa(item.inicio, item.fim, item.percentualRealizado);
      return (diasNaEtapa / totalDias) * 100;
    default:
      return 0;
  }
};

// Função para calcular % Planejado Etapa
export const calculatePlanejadoEtapas = (cronograma: CronogramaItem[]): number[] => {
  if (cronograma.length === 0) return [];
  
  const participacoesNormalizadas = calculateParticipacaoEtapaNormalizada(cronograma);
  const totalDias = calculateTotalDias(cronograma);
  
  return cronograma.map((item, index) => {
    return calculatePlanejadoEtapa(item, participacoesNormalizadas[index], totalDias);
  });
};

export const getDataFimPrevista = (cronograma: CronogramaItem[]): string => {
  if (cronograma.length === 0) return '-';
  
  const ultimaEtapa = cronograma.reduce((ultima, atual) => {
    const fimAtual = new Date(atual.fim);
    const fimUltima = new Date(ultima.fim);
    return fimAtual > fimUltima ? atual : ultima;
  });
  
  return new Date(ultimaEtapa.fim).toLocaleDateString('pt-BR');
};
