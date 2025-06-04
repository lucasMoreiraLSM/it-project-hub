
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { ListSectionProps } from './types';

export const ProjectExecutedSteps: React.FC<ListSectionProps> = ({
  project,
  addToList,
  removeFromList,
  updateListItem,
  canEdit
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          ✅ Etapas Executadas
          {canEdit && (
            <Button 
              size="sm" 
              onClick={() => addToList('etapasExecutadas', {
                atividade: '',
                dataConclusao: ''
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
                <th className="border border-gray-200 p-2 text-left">Atividade</th>
                <th className="border border-gray-200 p-2 text-left">Data de Conclusão</th>
                <th className="border border-gray-200 p-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {project.etapasExecutadas.map((etapa, index) => (
                <tr key={index}>
                  <td className="border border-gray-200 p-2">
                    <Input 
                      value={etapa.atividade} 
                      onChange={e => updateListItem('etapasExecutadas', index, {
                        ...etapa,
                        atividade: e.target.value
                      })} 
                      placeholder="Atividade executada" 
                      disabled={!canEdit} 
                    />
                  </td>
                  <td className="border border-gray-200 p-2">
                    <Input 
                      type="date" 
                      value={etapa.dataConclusao} 
                      onChange={e => updateListItem('etapasExecutadas', index, {
                        ...etapa,
                        dataConclusao: e.target.value
                      })} 
                      disabled={!canEdit} 
                    />
                  </td>
                  <td className="border border-gray-200 p-2">
                    {canEdit && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => removeFromList('etapasExecutadas', index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
