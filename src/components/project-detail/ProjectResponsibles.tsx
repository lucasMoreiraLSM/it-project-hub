
import React, { useState } from 'react';
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
  // Opções predefinidas para Gerente de Projetos
  const [gerentesProjetos, setGerentesProjetos] = useState([
    'Ana Silva',
    'Carlos Santos',
    'Maria Oliveira',
    'João Pereira',
    'Paula Costa',
    'Ricardo Lima',
    'Fernanda Souza',
    'Eduardo Martins'
  ]);

  // Opções predefinidas para Líder Projetos TI
  const [lideresProjetos, setLideresProjetos] = useState([
    'Alexandre Tech',
    'Beatriz Dev',
    'Carlos Arch',
    'Diana Ops',
    'Eduardo Sec',
    'Fabiana Data',
    'Gabriel Cloud',
    'Helena Mobile'
  ]);

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
              options={gerentesProjetos}
              onOptionsChange={setGerentesProjetos}
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
              options={lideresProjetos}
              onOptionsChange={setLideresProjetos}
              placeholder="Selecione um líder de projetos TI"
              disabled={!canEdit}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
