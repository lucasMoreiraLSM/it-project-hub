
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreateProjectHistoryData } from '@/types/projectHistory';
import { Project } from '@/types/project';
import { Plus } from 'lucide-react';
import { DateAndTotalDaysFields } from './DateAndTotalDaysFields';
import { PercentageFields } from './PercentageFields';
import { DeviationAndTrafficLightFields } from './DeviationAndTrafficLightFields';
import { 
  calculatePercentualPrevistoForDate,
  calculateCurrentProjectData,
  calculateTotalDias,
  calculateFormData
} from '@/utils/projectHistoryCalculations';
import { 
  calculateDesvio,
  getFarolStatus
} from '@/utils/projectCalculations';

interface ProjectHistoryFormProps {
  projectId: string;
  project?: Project;
  onSubmit: (data: CreateProjectHistoryData) => Promise<void>;
  loading?: boolean;
}

export const ProjectHistoryForm: React.FC<ProjectHistoryFormProps> = ({ 
  projectId, 
  project,
  onSubmit, 
  loading = false 
}) => {
  const currentDate = new Date().toISOString().split('T')[0];
  const initialFormData = calculateFormData(projectId, project, currentDate);
  const currentData = calculateCurrentProjectData(project, currentDate);

  const [formData, setFormData] = useState<CreateProjectHistoryData>(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      // Reset form with current project data
      const newCurrentDate = new Date().toISOString().split('T')[0];
      const newFormData = calculateFormData(projectId, project, newCurrentDate);
      setFormData(newFormData);
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
  useEffect(() => {
    if (project?.cronograma && formData.data_atualizacao) {
      const newPercentualPrevisto = calculatePercentualPrevistoForDate(project.cronograma, formData.data_atualizacao);
      setFormData(prev => ({
        ...prev,
        percentual_previsto_total: newPercentualPrevisto
      }));
    }
  }, [formData.data_atualizacao, project?.cronograma]);

  // Calculate deviation automatically
  useEffect(() => {
    const desvio = calculateDesvio(formData.percentual_previsto_total, formData.percentual_realizado_total);
    const farol = getFarolStatus(Math.abs(desvio));
    setFormData(prev => ({
      ...prev,
      percentual_desvio: desvio,
      farol: farol
    }));
  }, [formData.percentual_previsto_total, formData.percentual_realizado_total]);

  // Recalculate total days when data_atualizacao changes
  useEffect(() => {
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
          <DateAndTotalDaysFields
            dataAtualizacao={formData.data_atualizacao}
            totalDias={formData.total_dias}
            onDateChange={(date) => handleInputChange('data_atualizacao', date)}
          />

          <PercentageFields
            percentualPrevisto={formData.percentual_previsto_total}
            percentualRealizado={formData.percentual_realizado_total}
            onPrevistoChange={(value) => handleInputChange('percentual_previsto_total', value)}
            onRealizadoChange={(value) => handleInputChange('percentual_realizado_total', value)}
          />

          <DeviationAndTrafficLightFields
            percentualDesvio={formData.percentual_desvio}
            farol={formData.farol}
            onFarolChange={(value) => handleInputChange('farol', value)}
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Adicionando...' : 'Adicionar Histórico'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
