
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
  calculatePercentualPrevisto, 
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

export const ProjectHistoryForm: React.FC<ProjectHistoryFormProps> = ({ 
  projectId, 
  project,
  onSubmit, 
  loading = false 
}) => {
  // Calculate current project data using the correct calculation functions
  const calculateCurrentData = () => {
    if (!project?.cronograma || project.cronograma.length === 0) {
      return {
        percentual_previsto_total: 0,
        percentual_realizado_total: 0,
        total_dias: 0
      };
    }

    // Use the existing calculation functions from utils
    const percentualPrevisto = calculatePercentualPrevisto(project.cronograma);
    const percentualRealizado = calculatePercentualRealizado(project.cronograma);
    
    // Calculate total days from cronograma
    const totalDias = project.cronograma.reduce((total, item) => {
      const inicio = new Date(item.inicio);
      const fim = new Date(item.fim);
      const dias = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
      return total + dias;
    }, 0);

    return {
      percentual_previsto_total: percentualPrevisto,
      percentual_realizado_total: percentualRealizado,
      total_dias: totalDias
    };
  };

  const currentData = calculateCurrentData();
  const initialDesvio = calculateDesvio(currentData.percentual_previsto_total, currentData.percentual_realizado_total);

  const [formData, setFormData] = useState<CreateProjectHistoryData>({
    project_id: projectId,
    percentual_previsto_total: currentData.percentual_previsto_total,
    percentual_realizado_total: currentData.percentual_realizado_total,
    percentual_desvio: initialDesvio,
    total_dias: currentData.total_dias,
    farol: getFarolStatus(Math.abs(initialDesvio)),
    data_atualizacao: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      // Reset form with current project data
      const newCurrentData = calculateCurrentData();
      const newDesvio = calculateDesvio(newCurrentData.percentual_previsto_total, newCurrentData.percentual_realizado_total);
      setFormData({
        project_id: projectId,
        percentual_previsto_total: newCurrentData.percentual_previsto_total,
        percentual_realizado_total: newCurrentData.percentual_realizado_total,
        percentual_desvio: newDesvio,
        total_dias: newCurrentData.total_dias,
        farol: getFarolStatus(Math.abs(newDesvio)),
        data_atualizacao: new Date().toISOString().split('T')[0]
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
                onChange={(e) => handleInputChange('total_dias', parseInt(e.target.value) || 0)}
                required
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
