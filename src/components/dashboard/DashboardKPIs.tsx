
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface KPIs {
  total: number;
  emAndamento: number;
  atrasados: number;
  percentualConclusao: number;
}

interface DashboardKPIsProps {
  kpis: KPIs;
}

export const DashboardKPIs: React.FC<DashboardKPIsProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{kpis.total}</div>
            <div className="text-sm text-gray-600">Total de Projetos</div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-500">{kpis.emAndamento}</div>
            <div className="text-sm text-gray-600">Em Andamento</div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-500">{kpis.atrasados}</div>
            <div className="text-sm text-gray-600">Atrasados</div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{kpis.percentualConclusao}%</div>
            <div className="text-sm text-gray-600">Taxa de Conclusão</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
