
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectHistory } from '@/types/projectHistory';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface ProjectHistoryChartsProps {
  history: ProjectHistory[];
}

export const ProjectHistoryCharts: React.FC<ProjectHistoryChartsProps> = ({ history }) => {
  // Sort history by date and prepare chart data
  const chartData = history
    .sort((a, b) => new Date(a.data_atualizacao).getTime() - new Date(b.data_atualizacao).getTime())
    .map(entry => ({
      mes: new Date(entry.data_atualizacao).toLocaleDateString('pt-BR', { 
        month: 'short', 
        year: '2-digit' 
      }),
      previsto: entry.percentual_previsto_total,
      realizado: entry.percentual_realizado_total,
      desvio: entry.percentual_desvio
    }));

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Previsto vs Realizado Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Previsto vs Realizado (Mensal)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value, name) => [`${Number(value).toFixed(1)}%`, name === 'previsto' ? 'Previsto' : 'Realizado']}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Legend 
                formatter={(value) => value === 'previsto' ? 'Previsto' : 'Realizado'}
              />
              <Bar dataKey="previsto" fill="#3b82f6" name="previsto" />
              <Bar dataKey="realizado" fill="#10b981" name="realizado" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Desvio Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Desvio Mensal (%)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Desvio']}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="desvio" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                name="Desvio"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
