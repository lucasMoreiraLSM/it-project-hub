
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProjectSectionProps } from './types';
import { calculatePercentualPrevisto, calculatePercentualRealizado, calculateDesvio, getFarolStatus, getDiasNaEtapa } from '@/utils/projectCalculations';
import { SelectWithCustomInput } from './SelectWithCustomInput';

export const ProjectBasicInfo: React.FC<ProjectSectionProps> = ({
  project,
  onUpdate,
  canEdit
}) => {
  const percentualPrevisto = calculatePercentualPrevisto(project.cronograma);
  const percentualRealizado = calculatePercentualRealizado(project.cronograma);
  const desvio = calculateDesvio(percentualPrevisto, percentualRealizado);
  const farol = getFarolStatus(desvio);

  // Calcular o total de dias
  const totalDias = project.cronograma.reduce((total, item) => {
    const diasNaEtapa = getDiasNaEtapa(item.inicio, item.fim, item.percentualRealizado);
    return total + diasNaEtapa;
  }, 0);

  const getFarolColor = (status: string) => {
    switch (status) {
      case 'Verde':
        return 'bg-green-500';
      case 'Amarelo':
        return 'bg-yellow-500';
      case 'Vermelho':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>📌 Dados do Projeto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nome">Nome do Projeto</Label>
            <Input 
              id="nome" 
              value={project.nome} 
              onChange={e => onUpdate('nome', e.target.value)} 
              disabled={!canEdit} 
            />
          </div>
          <div>
            <Label htmlFor="areaNegocio">Área de Negócio</Label>
            <SelectWithCustomInput
              id="areaNegocio"
              value={project.areaNegocio}
              onValueChange={(value) => onUpdate('areaNegocio', value)}
              fieldName="areaNegocio"
              placeholder="Selecione uma área de negócio"
              disabled={!canEdit}
            />
          </div>
          <div>
            <Label htmlFor="inovacaoMelhoria">Tipo de Projeto</Label>
            <SelectWithCustomInput
              id="inovacaoMelhoria"
              value={project.inovacaoMelhoria}
              onValueChange={(value) => onUpdate('inovacaoMelhoria', value as 'Inovação' | 'Melhoria')}
              fieldName="inovacaoMelhoria"
              placeholder="Selecione o tipo de projeto"
              disabled={!canEdit}
            />
          </div>
          <div>
            <Label htmlFor="estrategicoTatico">Classificação do Projeto</Label>
            <SelectWithCustomInput
              id="estrategicoTatico"
              value={project.estrategicoTatico}
              onValueChange={(value) => onUpdate('estrategicoTatico', value as 'Estratégico' | 'Tático')}
              fieldName="estrategicoTatico"
              placeholder="Selecione a classificação do projeto"
              disabled={!canEdit}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="timeTI">Time Responsável</Label>
            <SelectWithCustomInput
              id="timeTI"
              value={project.timeTI}
              onValueChange={(value) => onUpdate('timeTI', value)}
              fieldName="timeTI"
              placeholder="Selecione um time responsável"
              disabled={!canEdit}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <Label className="text-sm font-medium">% Previsto Total</Label>
            <div className="text-2xl font-bold text-blue-600">{percentualPrevisto}%</div>
          </div>
          <div>
            <Label className="text-sm font-medium">% Realizado Total</Label>
            <div className="text-2xl font-bold text-green-600">{percentualRealizado}%</div>
          </div>
          <div>
            <Label className="text-sm font-medium">% Desvio</Label>
            <div className={`text-2xl font-bold ${desvio > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {desvio > 0 ? '+' : ''}{desvio}%
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">Total de Dias</Label>
            <div className="text-2xl font-bold text-purple-600">{totalDias}</div>
          </div>
          <div>
            <Label className="text-sm font-medium">Farol</Label>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${getFarolColor(farol)}`}></div>
              <span className="font-medium">{farol}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
