
export interface ProximaEtapa {
  atividade: string;
  responsavel: string;
  previsao: string;
}

export interface EtapaExecutada {
  atividade: string;
  dataConclusao: string;
}

export interface CronogramaItem {
  etapa: string;
  inicio: string;
  fim: string;
  percentualPrevisto: number;
  percentualRealizado: number;
}

export interface Project {
  id: string;
  nome: string;
  areaNegocio: string;
  inovacaoMelhoria: 'Inovação' | 'Melhoria';
  timeTI: string;
  sponsor: string;
  productOwner: string;
  gerenteProjetos: string;
  liderProjetosTI: string;
  escopo: string[];
  objetivos: string[];
  etapasExecutadas: EtapaExecutada[];
  proximasEtapas: ProximaEtapa[];
  cronograma: CronogramaItem[];
  pontosAtencao: string[];
  estrategicoTatico: 'Estratégico' | 'Tático';
  lastUpdatedByName?: string;
  lastUpdatedAt?: string;
}
