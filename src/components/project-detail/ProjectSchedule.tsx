
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { ListSectionProps } from './types';
import { getDiasNaEtapa, getStatusCronograma, getStatusCronogramaStyle, calculatePercentualPrevistoItem } from '@/utils/projectCalculations';

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
                
                // Calcular automaticamente o percentual previsto baseado nas datas
                const percentualPrevistoCalculado = item.inicio && item.fim 
                  ? calculatePercentualPrevistoItem(item.inicio, item.fim)
                  : 0;
                
                // Atualizar o item com o percentual calculado se for diferente
                if (item.percentualPrevisto !== percentualPrevistoCalculado && item.inicio && item.fim) {
                  setTimeout(() => {
                    updateListItem('cronograma', index, {
                      ...item,
                      percentualPrevisto: percentualPrevistoCalculado
                    });
                  }, 0);
                }
                
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
                        onChange={e => {
                          const novoItem = {
                            ...item,
                            inicio: e.target.value
                          };
                          // Recalcular percentual previsto quando a data de início mudar
                          if (novoItem.inicio && novoItem.fim) {
                            novoItem.percentualPrevisto = calculatePercentualPrevistoItem(novoItem.inicio, novoItem.fim);
                          }
                          updateListItem('cronograma', index, novoItem);
                        }} 
                        disabled={!canEdit} 
                      />
                    </td>
                    <td className="border border-gray-200 p-2">
                      <Input 
                        type="date" 
                        value={item.fim} 
                        onChange={e => {
                          const novoItem = {
                            ...item,
                            fim: e.target.value
                          };
                          // Recalcular percentual previsto quando a data de fim mudar
                          if (novoItem.inicio && novoItem.fim) {
                            novoItem.percentualPrevisto = calculatePercentualPrevistoItem(novoItem.inicio, novoItem.fim);
                          }
                          updateListItem('cronograma', index, novoItem);
                        }} 
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
                        value={percentualPrevistoCalculado} 
                        readOnly
                        className="bg-gray-100"
                        title="Calculado automaticamente baseado nas datas"
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
