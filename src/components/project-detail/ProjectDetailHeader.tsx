
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Lock, Clock, Edit, Save } from 'lucide-react';

interface ProjectDetailHeaderProps {
  canEdit: boolean;
  isOwnLock: boolean;
  isLoading?: boolean;
  onBack: () => void;
  onSave: () => void;
  onEdit: () => void;
  isEditMode: boolean;
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
  onEdit,
  isEditMode,
  lastUpdatedByName,
  lastUpdatedAt
}) => {
  return <>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? 'Editando Projeto' : 'Detalhes do Projeto'}
        </h1>
        
        <div className="flex items-center gap-4 ml-auto">
          {lastUpdatedByName && <div className="text-sm text-gray-600 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                Última atualização: <strong>{lastUpdatedByName}</strong>
                <br />
                {formatDate(lastUpdatedAt)}
              </span>
            </div>}
          
          <Button 
            variant="outline" 
            onClick={onEdit} 
            disabled={isLoading} 
            className="flex items-center gap-2 text-[#a43600] hover:text-[#a43600] border-[#a43600] hover:border-[#a43600]"
          >
            <Edit className="h-4 w-4" />
            {isEditMode ? 'Parar Edição' : 'Editar'}
          </Button>
          
          {isEditMode && (
            <Button onClick={onSave} disabled={isLoading} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Salvar Alterações
            </Button>
          )}
        </div>
      </div>

      {canEdit && <Alert className="mb-6">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Você está editando este projeto. O bloqueio será renovado automaticamente enquanto você estiver ativo.
            Você pode parar de editar o projeto a qualquer momento usando o botão 'Parar Edição'.
          </AlertDescription>
        </Alert>}
    </>;
};
