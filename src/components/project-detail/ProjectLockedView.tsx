
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Lock } from 'lucide-react';
import { Project } from '@/types/project';

interface ProjectLockedViewProps {
  project: Project;
  lockInfo: {
    user_name: string;
    locked_at: string;
    expires_at: string;
  } | null;
  onBack: () => void;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('pt-BR');
};

export const ProjectLockedView: React.FC<ProjectLockedViewProps> = ({
  project,
  lockInfo,
  onBack
}) => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Projeto Bloqueado para Edição</h1>
        </div>

        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Este projeto está sendo editado por <strong>{lockInfo?.user_name}</strong> desde {formatDate(lockInfo?.locked_at)}.
            <br />
            O bloqueio expira em {formatDate(lockInfo?.expires_at)}.
          </AlertDescription>
        </Alert>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>📌 Visualização do Projeto (Somente Leitura)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Projeto</Label>
                  <Input value={project.nome} disabled />
                </div>
                <div>
                  <Label>Área de Negócio</Label>
                  <Input value={project.areaNegocio} disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
