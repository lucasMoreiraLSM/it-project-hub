
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectSectionProps } from './types';
import { calculatePercentualPrevisto, calculatePercentualRealizado, calculateDesvio, getFarolStatus } from '@/utils/projectCalculations';

export const ProjectBasicInfo: React.FC<ProjectSectionProps> = ({
  project,
  onUpdate,
  canEdit
}) => {
  const percentualPrevisto = calculatePercentualPrevisto(project.cronograma);
  const percentualRealizado = calculatePercentualRealizado(project.cronograma);
  const desvio = calculateDesvio(percentualPrevisto, percentualRealizado);
  const farol = getFarolStatus(desvio);

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
            <Input 
              id="areaNegocio" 
              value={project.areaNegocio} 
              onChange={e => onUpdate('areaNegocio', e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div>
            <Label htmlFor="inovacaoMelhoria">Tipo de Projeto</Label>
            <Select 
              value={project.inovacaoMelhoria} 
              onValueChange={(value: 'Inovação' | 'Melhoria') => onUpdate('inovacaoMelhoria', value)}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inovação">Inovação</SelectItem>
                <SelectItem value="Melhoria">Melhoria</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="estrategicoTatico">Classificação do Projeto</Label>
            <Select 
              value={project.estrategicoTatico} 
              onValueChange={(value: 'Estratégico' | 'Tático') => onUpdate('estrategicoTatico', value)}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Estratégico">Estratégico</SelectItem>
                <SelectItem value="Tático">Tático</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="timeTI">Time Responsável</Label>
            <Input 
              id="timeTI" 
              value={project.timeTI} 
              onChange={e => onUpdate('timeTI', e.target.value)}
              placeholder="Projetos, Infraestrutura, Segurança, Sustentação"
              disabled={!canEdit}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <Label className="text-sm font-medium">% Previsto</Label>
            <div className="text-2xl font-bold text-blue-600">{percentualPrevisto}%</div>
          </div>
          <div>
            <Label className="text-sm font-medium">% Realizado</Label>
            <div className="text-2xl font-bold text-green-600">{percentualRealizado}%</div>
          </div>
          <div>
            <Label className="text-sm font-medium">% Desvio</Label>
            <div className={`text-2xl font-bold ${desvio >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {desvio > 0 ? '+' : ''}{desvio}%
            </div>
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
