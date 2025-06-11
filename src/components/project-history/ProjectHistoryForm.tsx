
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateProjectHistoryData } from '@/types/projectHistory';
import { Project } from '@/types/project';
import { Plus } from 'lucide-react';
import { 
  calculatePercentualRealizado,
  calculateDesvio,
  getFarolStatus
} from '@/utils/projectCalculations';

interface ProjectHistoryFormProps {
  projectId: string;
  project?: Project;
  onSubmit: (data: CreateProjectHistoryData) => Promise<void>;
  loading?: boolean;
}

// Function to calculate percentual previsto based on a specific date
const calculatePercentualPrevistoForDate = (cronograma: any[], targetDate: string): number => {
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

export const ProjectHistoryForm: React.FC<ProjectHistoryFormProps> = ({ 
  projectId, 
  project,
  onSubmit, 
  loading = false 
}) => {
  // Calculate current project data using the correct calculation functions
  const calculateCurrentData = (targetDate?: string) => {
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

  const calculateTotalDias = (dataAtualizacao: string, primeiraDataInicio: Date | null): number => {
    if (!primeiraDataInicio || !dataAtualizacao) return 0;
    
    const dataAtual = new Date(dataAtualizacao);
    const diffTime = dataAtual.getTime() - primeiraDataInicio.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
  };

  const currentDate = new Date().toISOString().split('T')[0];
  const currentData = calculateCurrentData(currentDate);
  const initialDesvio = calculateDesvio(currentData.percentual_previsto_total, currentData.percentual_realizado_total);
  const initialTotalDias = calculateTotalDias(currentDate, currentData.primeiraDataInicio);

  const [formData, setFormData] = useState<CreateProjectHistoryData>({
    project_id: projectId,
    percentual_previsto_total: currentData.percentual_previsto_total,
    percentual_realizado_total: currentData.percentual_realizado_total,
    percentual_desvio: initialDesvio,
    total_dias: initialTotalDias,
    farol: getFarolStatus(Math.abs(initialDesvio)),
    data_atualizacao: currentDate
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      // Reset form with current project data
      const newCurrentData = calculateCurrentData();
      const newDesvio = calculateDesvio(newCurrentData.percentual_previsto_total, newCurrentData.percentual_realizado_total);
      const newCurrentDate = new Date().toISOString().split('T')[0];
      const newTotalDias = calculateTotalDias(newCurrentDate, newCurrentData.primeiraDataInicio);
      
      setFormData({
        project_id: projectId,
        percentual_previsto_total: newCurrentData.percentual_previsto_total,
        percentual_realizado_total: newCurrentData.percentual_realizado_total,
        percentual_desvio: newDesvio,
        total_dias: newTotalDias,
        farol: getFarolStatus(Math.abs(newDesvio)),
        data_atualizacao: newCurrentDate
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleInputChange = (field: keyof CreateProjectHistoryData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Recalculate percentual previsto when data_atualizacao changes
  React.useEffect(() => {
    if (project?.cronograma && formData.data_atualizacao) {
      const newPercentualPrevisto = calculatePercentualPrevistoForDate(project.cronograma, formData.data_atualizacao);
      setFormData(prev => ({
        ...prev,
        percentual_previsto_total: newPercentualPrevisto
      }));
    }
  }, [formData.data_atualizacao, project?.cronograma]);

  // Calculate deviation automatically
  React.useEffect(() => {
    const desvio = calculateDesvio(formData.percentual_previsto_total, formData.percentual_realizado_total);
    const farol = getFarolStatus(Math.abs(desvio));
    setFormData(prev => ({
      ...prev,
      percentual_desvio: desvio,
      farol: farol
    }));
  }, [formData.percentual_previsto_total, formData.percentual_realizado_total]);

  // Recalculate total days when data_atualizacao changes
  React.useEffect(() => {
    const newTotalDias = calculateTotalDias(formData.data_atualizacao, currentData.primeiraDataInicio);
    setFormData(prev => ({
      ...prev,
      total_dias: newTotalDias
    }));
  }, [formData.data_atualizacao, currentData.primeiraDataInicio]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Adicionar Histórico
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data_atualizacao">Data de Atualização</Label>
              <Input
                id="data_atualizacao"
                type="date"
                value={formData.data_atualizacao}
                onChange={(e) => handleInputChange('data_atualizacao', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="total_dias">Total de Dias</Label>
              <Input
                id="total_dias"
                type="number"
                min="0"
                value={formData.total_dias}
                disabled
                className="bg-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="percentual_previsto">Percentual Previsto (%)</Label>
              <Input
                id="percentual_previsto"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.percentual_previsto_total}
                onChange={(e) => handleInputChange('percentual_previsto_total', parseFloat(e.target.value) || 0)}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Calculado automaticamente com base na data de atualização, mas editável
              </p>
            </div>
            <div>
              <Label htmlFor="percentual_realizado">Percentual Realizado (%)</Label>
              <Input
                id="percentual_realizado"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.percentual_realizado_total}
                onChange={(e) => handleInputChange('percentual_realizado_total', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="percentual_desvio">Desvio (%)</Label>
              <Input
                id="percentual_desvio"
                type="number"
                step="0.1"
                value={formData.percentual_desvio.toFixed(1)}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div>
              <Label htmlFor="farol">Farol</Label>
              <Select 
                value={formData.farol} 
                onValueChange={(value: 'Verde' | 'Amarelo' | 'Vermelho') => handleInputChange('farol', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Verde">🟢 Verde</SelectItem>
                  <SelectItem value="Amarelo">🟡 Amarelo</SelectItem>
                  <SelectItem value="Vermelho">🔴 Vermelho</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Adicionando...' : 'Adicionar Histórico'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
