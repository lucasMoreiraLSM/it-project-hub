
// Participation calculations
export {
  getDiasNaEtapa,
  calculateTotalDias,
  calculateParticipacaoEtapa,
  calculateParticipacaoEtapaNormalizada,
  calculateRealizadoEtapa
} from './participationCalculations';

// Schedule calculations
export {
  calculatePlanejadoEtapa,
  calculatePlanejadoEtapas,
  getDataFimPrevista
} from './scheduleCalculations';

// Status calculations
export {
  getStatusCronograma,
  getStatusGeral,
  getStatusOrcamento,
  getStatusOrcamentoColor,
  getStatusCronogramaBadgeVariant,
  getStatusCronogramaStyle
} from './statusCalculations';

// Project metrics
export {
  calculatePercentualPrevisto,
  calculatePercentualRealizado,
  calculateDesvio,
  getFarolStatus,
  getStatusProjeto
} from './projectMetrics';
