import { Project, CronogramaItem } from '@/types/project';

export const calculatePercentualPrevistoItem = (dataInicio: string, dataFim: string): number => {
  const hoje = new Date();
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  
  // Normalizar todas as datas para considerar apenas o dia (sem horário)
  // Usar a mesma lógica da coluna "Dia Atual" que mostra hoje.toLocaleDateString('pt-BR')
  const dataHoje = new Date(hoje.toLocaleDateString('pt-BR').split('/').reverse().join('-'));
  const dataInicioPadrao = new Date(inicio.toISOString().split('T')[0]);
  const dataFimPadrao = new Date(fim.toISOString().split('T')[0]);
  
  // Se não iniciou ainda, percentual previsto é 0
  if (dataHoje < dataInicioPadrao) return 0;
  
  // Se já passou da data fim, percentual previsto é 100
  if (dataHoje > dataFimPadrao) return 100;
  
  // Calcular percentual baseado no tempo decorrido
  const totalDias = Math.floor((dataFimPadrao.getTime() - dataInicioPadrao.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const diasDecorridos = Math.floor((dataHoje.getTime() - dataInicioPadrao.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  if (totalDias <= 0) return 100;
  
  // Se estamos exatamente na data fim, consideramos 100%
  if (dataHoje.getTime() === dataFimPadrao.getTime()) return 100;
  
  const percentual = Math.round((diasDecorridos / totalDias) * 100);
  return Math.min(100, Math.max(0, percentual));
};

export const calculatePercentualPrevisto = (cronograma: CronogramaItem[]): number => {
  if (cronograma.length === 0) return 0; 
   
   const soma = cronograma.reduce((total, item) => total + item.percentualPrevisto, 0);
   return Math.round(soma / cronograma.length);
   
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
  // Verde quando o % Desvio < 5%
  if (desvio <= 5) return 'Verde';
  // Amarelo quando % Desvio >= 5% e <= 10%
  if (desvio > 5 && desvio <= 10) return 'Amarelo';
  // Vermelho quando % Desvio > 10%
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

export const getDiasNaEtapa = (dataInicio: string, dataFim?: string, percentualRealizado?: number): number => {
  const inicio = new Date(dataInicio);
  
  // Se percentual realizado é 100%, calcular entre início e fim
  if (percentualRealizado === 100 && dataFim) {
    const fim = new Date(dataFim);
    const diffTime = fim.getTime() - inicio.getTime();
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
  }
  
  // Se percentual realizado é menor que 100%, calcular entre início e data atual
  const hoje = new Date();
  const diffTime = hoje.getTime() - inicio.getTime();
  return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
};

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
  const percentualPrevisto  = calculatePercentualPrevisto(cronograma);
  const desvio = percentualPrevisto - percentualRealizado;
  
  //if (percentualRealizado === 0 && percentualPrevisto === 0 ) return 'Não Iniciado';
  if (desvio > 10 ) return 'Atrasado';
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
