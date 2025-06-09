
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProjectSectionProps } from './types';
import { SelectWithCustomInput } from './SelectWithCustomInput';

export const ProjectResponsibles: React.FC<ProjectSectionProps> = ({
  project,
  onUpdate,
  canEdit
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>👥 Responsáveis do Projeto</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sponsor">Sponsor</Label>
            <Input 
              id="sponsor" 
              value={project.sponsor} 
              onChange={e => onUpdate('sponsor', e.target.value)} 
              disabled={!canEdit} 
            />
          </div>
          <div>
            <Label htmlFor="productOwner">Product Owner</Label>
            <Input 
              id="productOwner" 
              value={project.productOwner} 
              onChange={e => onUpdate('productOwner', e.target.value)} 
              disabled={!canEdit} 
            />
          </div>
          <div>
            <Label htmlFor="gerenteProjetos">Gerente de Projetos</Label>
            <SelectWithCustomInput
              id="gerenteProjetos"
              value={project.gerenteProjetos}
              onValueChange={(value) => onUpdate('gerenteProjetos', value)}
              fieldName="gerenteProjetos"
              placeholder="Selecione um gerente de projetos"
              disabled={!canEdit}
            />
          </div>
          <div>
            <Label htmlFor="liderProjetosTI">Líder Projetos TI</Label>
            <SelectWithCustomInput
              id="liderProjetosTI"
              value={project.liderProjetosTI}
              onValueChange={(value) => onUpdate('liderProjetosTI', value)}
              fieldName="liderProjetosTI"
              placeholder="Selecione um líder de projetos TI"
              disabled={!canEdit}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
