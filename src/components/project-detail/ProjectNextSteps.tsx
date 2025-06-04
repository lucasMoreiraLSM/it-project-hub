
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X, Check } from 'lucide-react';
import { ListSectionProps } from './types';
import { EtapaExecutada } from '@/types/project';

interface ProjectNextStepsProps extends ListSectionProps {
  onCompleteStep: (index: number) => void;
}

export const ProjectNextSteps: React.FC<ProjectNextStepsProps> = ({
  project,
  addToList,
  removeFromList,
  updateListItem,
  onCompleteStep,
  canEdit
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          🗓️ Próximas Etapas
          {canEdit && (
            <Button 
              size="sm" 
              onClick={() => addToList('proximasEtapas', {
                atividade: '',
                responsavel: '',
                previsao: ''
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
                <th className="border border-gray-200 p-2 text-left">Responsável</th>
                <th className="border border-gray-200 p-2 text-left">Previsão</th>
                <th className="border border-gray-200 p-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {project.proximasEtapas.map((etapa, index) => (
                <tr key={index}>
                  <td className="border border-gray-200 p-2">
                    <Input 
                      value={etapa.atividade} 
                      onChange={e => updateListItem('proximasEtapas', index, {
                        ...etapa,
                        atividade: e.target.value
                      })} 
                      placeholder="Atividade" 
                      disabled={!canEdit} 
                    />
                  </td>
                  <td className="border border-gray-200 p-2">
                    <Input 
                      value={etapa.responsavel} 
                      onChange={e => updateListItem('proximasEtapas', index, {
                        ...etapa,
                        responsavel: e.target.value
                      })} 
                      placeholder="Responsável" 
                      disabled={!canEdit} 
                    />
                  </td>
                  <td className="border border-gray-200 p-2">
                    <Input 
                      type="date" 
                      value={etapa.previsao} 
                      onChange={e => updateListItem('proximasEtapas', index, {
                        ...etapa,
                        previsao: e.target.value
                      })} 
                      disabled={!canEdit} 
                    />
                  </td>
                  <td className="border border-gray-200 p-2">
                    <div className="flex gap-1">
                      {canEdit && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onCompleteStep(index)} 
                            className="flex items-center gap-1 text-green-600 hover:text-green-700" 
                            title="Concluir etapa"
                          >
                            <Check className="h-3 w-3" />
                            Concluir
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => removeFromList('proximasEtapas', index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
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
