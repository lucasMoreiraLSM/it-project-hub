
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateProjectHistoryData } from '@/types/projectHistory';
import { Plus } from 'lucide-react';

interface ProjectHistoryFormProps {
  projectId: string;
  onSubmit: (data: CreateProjectHistoryData) => Promise<void>;
  loading?: boolean;
}

export const ProjectHistoryForm: React.FC<ProjectHistoryFormProps> = ({ 
  projectId, 
  onSubmit, 
  loading = false 
}) => {
  const [formData, setFormData] = useState<CreateProjectHistoryData>({
    project_id: projectId,
    percentual_previsto_total: 0,
    percentual_realizado_total: 0,
    percentual_desvio: 0,
    total_dias: 0,
    farol: 'Verde',
    data_atualizacao: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        project_id: projectId,
        percentual_previsto_total: 0,
        percentual_realizado_total: 0,
        percentual_desvio: 0,
        total_dias: 0,
        farol: 'Verde',
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
    const desvio = formData.percentual_realizado_total - formData.percentual_previsto_total;
    setFormData(prev => ({
      ...prev,
      percentual_desvio: desvio
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
