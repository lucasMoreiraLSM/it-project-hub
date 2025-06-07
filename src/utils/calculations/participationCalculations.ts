
import { CronogramaItem } from '@/types/project';

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

export const calculateRealizadoEtapa = (percentualRealizado: number, participacao: number): number => {
  return Math.round((percentualRealizado * participacao) / 100);
};
