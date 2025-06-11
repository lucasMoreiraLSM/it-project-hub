
import { Project } from '@/types/project';
import { 
  calculatePercentualRealizado,
  calculateDesvio,
  getFarolStatus
} from '@/utils/projectCalculations';

// Function to calculate percentual previsto based on a specific date
export const calculatePercentualPrevistoForDate = (cronograma: any[], targetDate: string): number => {
  if (cronograma.length === 0) return 0;
  
  const targetDateObj = new Date(targetDate);
  // Normalize target date to start of day
  const normalizedTargetDate = new Date(targetDateObj.toLocaleDateString('pt-BR').split('/').reverse().join('-'));
  
  const soma = cronograma.reduce((total, item) => {
    const inicio = new Date(item.inicio);
    const fim = new Date(item.fim);
    
    // Normalize dates to start of day
    const dataInicioPadrao = new Date(inicio.toISOString().split('T')[0]);
    const dataFimPadrao = new Date(fim.toISOString().split('T')[0]);
    
    // If target date is before start, percentual previsto is 0
    if (normalizedTargetDate < dataInicioPadrao) return total + 0;
    
    // If target date is after end, percentual previsto is 100
    if (normalizedTargetDate > dataFimPadrao) return total + 100;
    
    // Calculate percentual based on elapsed time
    const totalDias = Math.floor((dataFimPadrao.getTime() - dataInicioPadrao.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const diasDecorridos = Math.floor((normalizedTargetDate.getTime() - dataInicioPadrao.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    if (totalDias <= 0) return total + 100;
    
    // If we are exactly on the end date, consider 100%
    if (normalizedTargetDate.getTime() === dataFimPadrao.getTime()) return total + 100;
    
    const percentual = Math.round((diasDecorridos / totalDias) * 100);
    return total + Math.min(100, Math.max(0, percentual));
  }, 0);
  
  return Math.round(soma / cronograma.length);
};

export const calculateCurrentProjectData = (project?: Project, targetDate?: string) => {
  if (!project?.cronograma || project.cronograma.length === 0) {
    return {
      percentual_previsto_total: 0,
      percentual_realizado_total: 0,
      primeiraDataInicio: null
    };
  }

  // Use the target date if provided, otherwise use current date
  const dateToUse = targetDate || new Date().toISOString().split('T')[0];
  const percentualPrevisto = calculatePercentualPrevistoForDate(project.cronograma, dateToUse);
  const percentualRealizado = calculatePercentualRealizado(project.cronograma);
  
  // Find the earliest start date from the schedule
  let primeiraDataInicio: Date | null = null;
  
  project.cronograma.forEach(item => {
    const inicio = new Date(item.inicio);
    
    if (!primeiraDataInicio || inicio < primeiraDataInicio) {
      primeiraDataInicio = inicio;
    }
  });

  return {
    percentual_previsto_total: percentualPrevisto,
    percentual_realizado_total: percentualRealizado,
    primeiraDataInicio
  };
};

export const calculateTotalDias = (dataAtualizacao: string, primeiraDataInicio: Date | null): number => {
  if (!primeiraDataInicio || !dataAtualizacao) return 0;
  
  const dataAtual = new Date(dataAtualizacao);
  const diffTime = dataAtual.getTime() - primeiraDataInicio.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
};

export const calculateFormData = (projectId: string, project?: Project, targetDate?: string) => {
  const currentDate = targetDate || new Date().toISOString().split('T')[0];
  const currentData = calculateCurrentProjectData(project, currentDate);
  const initialDesvio = calculateDesvio(currentData.percentual_previsto_total, currentData.percentual_realizado_total);
  const initialTotalDias = calculateTotalDias(currentDate, currentData.primeiraDataInicio);

  return {
    project_id: projectId,
    percentual_previsto_total: currentData.percentual_previsto_total,
    percentual_realizado_total: currentData.percentual_realizado_total,
    percentual_desvio: initialDesvio,
    total_dias: initialTotalDias,
    farol: getFarolStatus(Math.abs(initialDesvio)),
    data_atualizacao: currentDate
  };
};
