
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProjectSectionProps } from './types';

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
            <Input 
              id="gerenteProjetos" 
              value={project.gerenteProjetos} 
              onChange={e => onUpdate('gerenteProjetos', e.target.value)} 
              disabled={!canEdit} 
            />
          </div>
          <div>
            <Label htmlFor="liderProjetosTI">Líder Projetos TI</Label>
            <Input 
              id="liderProjetosTI" 
              value={project.liderProjetosTI} 
              onChange={e => onUpdate('liderProjetosTI', e.target.value)} 
              disabled={!canEdit} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
