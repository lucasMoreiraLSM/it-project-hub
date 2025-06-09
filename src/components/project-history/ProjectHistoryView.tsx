
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProjectHistory } from '@/types/projectHistory';
import { Calendar, TrendingUp, TrendingDown, Minus, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ProjectHistoryCharts } from './ProjectHistoryCharts';

interface ProjectHistoryViewProps {
  history: ProjectHistory[];
  loading: boolean;
  onDelete?: (id: string) => Promise<void>;
}

export const ProjectHistoryView: React.FC<ProjectHistoryViewProps> = ({ 
  history, 
  loading, 
  onDelete 
}) => {
  const getFarolColor = (farol: string) => {
    switch (farol) {
      case 'Verde': return 'bg-green-500';
      case 'Amarelo': return 'bg-yellow-500';
      case 'Vermelho': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDesvioIcon = (desvio: number) => {
    if (desvio > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (desvio < 0) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const handleDelete = async (id: string) => {
    if (onDelete) {
      await onDelete(id);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Histórico do Projeto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Carregando histórico...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Histórico do Projeto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Nenhum histórico encontrado para este projeto.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* History List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Histórico do Projeto ({history.length} registros)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {history.map((entry) => (
              <div key={entry.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {new Date(entry.data_atualizacao).toLocaleDateString('pt-BR')}
                    </span>
                    <Badge className={`${getFarolColor(entry.farol)} text-white`}>
                      {entry.farol}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {entry.total_dias} dias
                    </span>
                    {onDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir este histórico? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(entry.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Previsto:</span>
                    <div className="font-medium">{entry.percentual_previsto_total.toFixed(1)}%</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Realizado:</span>
                    <div className="font-medium">{entry.percentual_realizado_total.toFixed(1)}%</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Desvio:</span>
                    <div className="font-medium flex items-center gap-1">
                      {getDesvioIcon(entry.percentual_desvio)}
                      {Math.abs(entry.percentual_desvio).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Charts Section */}
      <ProjectHistoryCharts history={history} />
    </div>
  );
};
