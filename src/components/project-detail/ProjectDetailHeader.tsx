
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Lock, Clock } from 'lucide-react';

interface ProjectDetailHeaderProps {
  canEdit: boolean;
  onBack: () => void;
  onSave: () => void;
  lastUpdatedByName?: string;
  lastUpdatedAt?: string;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('pt-BR');
};

export const ProjectDetailHeader: React.FC<ProjectDetailHeaderProps> = ({
  canEdit,
  onBack,
  onSave,
  lastUpdatedByName,
  lastUpdatedAt
}) => {
  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Detalhes do Projeto</h1>
        
        <div className="flex items-center gap-4 ml-auto">
          {lastUpdatedByName && (
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                Última atualização: <strong>{lastUpdatedByName}</strong>
                <br />
                {formatDate(lastUpdatedAt)}
              </span>
            </div>
          )}
          
          <Button onClick={onSave} disabled={!canEdit} className="flex items-center gap-2">
            {canEdit ? 'Salvar Alterações' : 'Projeto Bloqueado'}
            {!canEdit && <Lock className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {canEdit && (
        <Alert className="mb-6">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Você está editando este projeto. O bloqueio será renovado automaticamente enquanto você estiver ativo.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};
