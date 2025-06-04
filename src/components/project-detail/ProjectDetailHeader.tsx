
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Lock, Clock, Unlock } from 'lucide-react';

interface ProjectDetailHeaderProps {
  canEdit: boolean;
  isOwnLock: boolean;
  isLoading?: boolean;
  onBack: () => void;
  onSave: () => void;
  onUnlock?: () => void;
  lastUpdatedByName?: string;
  lastUpdatedAt?: string;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('pt-BR');
};

export const ProjectDetailHeader: React.FC<ProjectDetailHeaderProps> = ({
  canEdit,
  isOwnLock,
  isLoading = false,
  onBack,
  onSave,
  onUnlock,
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
          
          {isOwnLock && onUnlock && (
            <Button 
              variant="outline" 
              onClick={onUnlock} 
              disabled={isLoading}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700"
            >
              <Unlock className="h-4 w-4" />
              Desbloquear Projeto
            </Button>
          )}
          
          <Button 
            onClick={onSave} 
            disabled={!canEdit || isLoading} 
            className="flex items-center gap-2"
          >
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
            {isOwnLock && " Você pode desbloquear o projeto a qualquer momento usando o botão 'Desbloquear Projeto'."}
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};
