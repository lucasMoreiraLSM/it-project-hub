
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { ListSectionProps } from './types';
import { getDiasNaEtapa, getStatusCronograma, getStatusCronogramaStyle } from '@/utils/projectCalculations';

export const ProjectSchedule: React.FC<ListSectionProps> = ({
  project,
  addToList,
  removeFromList,
  updateListItem,
  canEdit
}) => {
  const hoje = new Date().toLocaleDateString('pt-BR');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          📊 Cronograma de Atividades
          {canEdit && (
            <Button 
              size="sm" 
              onClick={() => addToList('cronograma', {
                etapa: '',
                inicio: '',
                fim: '',
                percentualPrevisto: 0,
                percentualRealizado: 0
              })} 
              className="flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Adicionar
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 p-2 text-left">Etapa</th>
                <th className="border border-gray-200 p-2 text-left">Início</th>
                <th className="border border-gray-200 p-2 text-left">Fim</th>
                <th className="border border-gray-200 p-2 text-left">Status</th>
                <th className="border border-gray-200 p-2 text-left">% Previsto</th>
                <th className="border border-gray-200 p-2 text-left">% Realizado</th>
                <th className="border border-gray-200 p-2 text-left">Dias na Etapa</th>
                <th className="border border-gray-200 p-2 text-left">Dia Atual</th>
                <th className="border border-gray-200 p-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {project.cronograma.map((item, index) => {
                const diasNaEtapa = getDiasNaEtapa(item.inicio, item.fim, item.percentualRealizado);
                const status = getStatusCronograma(item);
                
                return (
                  <tr key={index}>
                    <td className="border border-gray-200 p-2">
                      <Input 
                        value={item.etapa} 
                        onChange={e => updateListItem('cronograma', index, {
                          ...item,
                          etapa: e.target.value
                        })} 
                        placeholder="Descrição da etapa" 
                        disabled={!canEdit} 
                      />
                    </td>
                    <td className="border border-gray-200 p-2">
                      <Input 
                        type="date" 
                        value={item.inicio} 
                        onChange={e => updateListItem('cronograma', index, {
                          ...item,
                          inicio: e.target.value
                        })} 
                        disabled={!canEdit} 
                      />
                    </td>
                    <td className="border border-gray-200 p-2">
                      <Input 
                        type="date" 
                        value={item.fim} 
                        onChange={e => updateListItem('cronograma', index, {
                          ...item,
                          fim: e.target.value
                        })} 
                        min={item.inicio} 
                        disabled={!canEdit} 
                      />
                    </td>
                    <td className="border border-gray-200 p-2 rounded-none px-0 mx-[3px]">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusCronogramaStyle(status)}`}>
                        {status}
                      </span>
                    </td>
                    <td className="border border-gray-200 p-2">
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        value={item.percentualPrevisto} 
                        onChange={e => updateListItem('cronograma', index, {
                          ...item,
                          percentualPrevisto: parseInt(e.target.value) || 0
                        })} 
                        disabled={!canEdit} 
                      />
                    </td>
                    <td className="border border-gray-200 p-2">
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        value={item.percentualRealizado} 
                        onChange={e => updateListItem('cronograma', index, {
                          ...item,
                          percentualRealizado: parseInt(e.target.value) || 0
                        })} 
                        disabled={!canEdit} 
                      />
                    </td>
                    <td className="border border-gray-200 p-2 text-center">{diasNaEtapa}</td>
                    <td className="border border-gray-200 p-2 text-center">{hoje}</td>
                    <td className="border border-gray-200 p-2">
                      {canEdit && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => removeFromList('cronograma', index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
