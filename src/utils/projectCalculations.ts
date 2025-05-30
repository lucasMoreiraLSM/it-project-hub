
import { Project, CronogramaItem } from '@/types/project';

export const calculatePercentualPrevisto = (cronograma: CronogramaItem[]): number => {
  if (cronograma.length === 0) return 0;
  
  const totalDias = cronograma.reduce((total, item) => {
    const inicio = new Date(item.inicio);
    const fim = new Date(item.fim);
    const dias = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
    return total + dias;
  }, 0);

  const diasPrevistosCompletados = cronograma.reduce((total, item) => {
    const inicio = new Date(item.inicio);
    const fim = new Date(item.fim);
    const dias = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
    const diasNaEtapa = getDiasNaEtapa(item.inicio);
    const diasParaCalcular = Math.min(diasNaEtapa, dias);
    return total + diasParaCalcular;
  }, 0);

  return totalDias > 0 ? Math.round((diasPrevistosCompletados / totalDias) * 100) : 0;
};

export const calculatePercentualRealizado = (cronograma: CronogramaItem[]): number => {
  if (cronograma.length === 0) return 0;
  
  const soma = cronograma.reduce((total, item) => total + item.percentualRealizado, 0);
  return Math.round(soma / cronograma.length);
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

export const getDiasNaEtapa = (dataInicio: string): number => {
  const inicio = new Date(dataInicio);
  const hoje = new Date();
  const diffTime = hoje.getTime() - inicio.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

export const getStatusCronograma = (item: CronogramaItem): string => {
  const hoje = new Date();
  const fimPrevisto = new Date(item.fim);
  
  if (item.percentualRealizado === 100) return 'Concluído';
  if (item.percentualRealizado <= 0) return 'Não Iniciado';
  if (fimPrevisto < hoje && item.percentualRealizado < 100) return 'Atrasado';
  if (item.percentualPrevisto > 0) return 'Em Andamento';
  return 'Não Iniciado';
};

export const getStatusGeral = (cronograma: CronogramaItem[]): string => {
  if (cronograma.length === 0) return 'Não Iniciado';
  
  const percentualRealizado = calculatePercentualRealizado(cronograma);
  
  if (percentualRealizado === 0) return 'Não Iniciado';
  if (percentualRealizado === 100) return 'Concluído';
  return 'Em Andamento';
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
