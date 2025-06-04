
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { ListSectionProps } from './types';

export const ProjectScope: React.FC<ListSectionProps> = ({
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
          📝 Escopo
          {canEdit && (
            <Button 
              size="sm" 
              onClick={() => addToList('escopo', '')} 
              className="flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Adicionar
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {project.escopo.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input 
                value={item} 
                onChange={e => updateListItem('escopo', index, e.target.value)} 
                placeholder="Funcionalidade" 
                disabled={!canEdit} 
              />
              {canEdit && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => removeFromList('escopo', index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
