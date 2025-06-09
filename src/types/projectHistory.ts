
export interface ProjectHistory {
  id: string;
  project_id: string;
  percentual_previsto_total: number;
  percentual_realizado_total: number;
  percentual_desvio: number;
  total_dias: number;
  farol: 'Verde' | 'Amarelo' | 'Vermelho';
  data_atualizacao: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CreateProjectHistoryData {
  project_id: string;
  percentual_previsto_total: number;
  percentual_realizado_total: number;
  percentual_desvio: number;
  total_dias: number;
  farol: 'Verde' | 'Amarelo' | 'Vermelho';
  data_atualizacao?: string;
}
