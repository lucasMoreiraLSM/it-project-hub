import { Project, CronogramaItem } from '@/types/project';

export const calculateTotalDias = (cronograma: CronogramaItem[]): number => {
  return cronograma.reduce((total, item) => {
    const diasNaEtapa = getDiasNaEtapa(item.inicio, item.fim, item.percentualRealizado);
    return total + diasNaEtapa;
  }, 0);
};

export const calculateParticipacaoEtapa = (cronograma: CronogramaItem[], index: number): number => {
  const totalDias = calculateTotalDias(cronograma);
  if (totalDias === 0) return 0;
  
  const diasNaEtapa = getDiasNaEtapa(cronograma[index].inicio, cronograma[index].fim, cronograma[index].percentualRealizado);
  return (diasNaEtapa / totalDias) * 100;
};

// Função para garantir que a soma das participações seja exatamente 100%
export const calculateParticipacaoEtapaNormalizada = (cronograma: CronogramaItem[]): number[] => {
  if (cronograma.length === 0) return [];
  
  const totalDias = calculateTotalDias(cronograma);
  if (totalDias === 0) return cronograma.map(() => 0);
  
  // Calcular participações brutas
  const participacoesBrutas = cronograma.map((item) => {
    const diasNaEtapa = getDiasNaEtapa(item.inicio, item.fim, item.percentualRealizado);
    return (diasNaEtapa / totalDias) * 100;
  });
  
  // Arredondar para números inteiros
  const participacoesArredondadas = participacoesBrutas.map(p => Math.round(p));
  
  // Calcular diferença para 100%
  const somaAtual = participacoesArredondadas.reduce((sum, p) => sum + p, 0);
  const diferenca = 100 - somaAtual;
  
  // Distribuir a diferença nos itens com maior resto decimal
  if (diferenca !== 0) {
    const restos = participacoesBrutas.map((bruta, index) => ({
      index,
      resto: bruta - participacoesArredondadas[index]
    }));
    
    // Ordenar por resto decrescente
    restos.sort((a, b) => Math.abs(b.resto) - Math.abs(a.resto));
    
    // Ajustar os valores para que a soma seja 100%
    for (let i = 0; i < Math.abs(diferenca) && i < restos.length; i++) {
      if (diferenca > 0) {
        participacoesArredondadas[restos[i].index] += 1;
      } else {
        participacoesArredondadas[restos[i].index] -= 1;
      }
    }
  }
  
  return participacoesArredondadas;
};

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

export const calculateRealizadoEtapa = (percentualRealizado: number, participacao: number): number => {
  return Math.round((percentualRealizado * participacao) / 100);
};

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
  return cronograma.reduce((total, item, index) => {
    const realizado = calculateRealizadoEtapa(item.percentualRealizado, participacoesNormalizadas[index]);
    return total + realizado;
  }, 0);
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

export const getDiasNaEtapa = (dataInicio: string, dataFim?: string, percentualRealizado?: number): number => {
  const inicio = new Date(dataInicio);
  
  // Se percentual realizado é 100%, calcular entre início e fim
  if (percentualRealizado === 100 && dataFim) {
    const fim = new Date(dataFim);
    const diffTime = fim.getTime() - inicio.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }
  
  // Se percentual realizado é menor que 100%, calcular entre início e data atual
  const hoje = new Date();
  const diffTime = hoje.getTime() - inicio.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
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
