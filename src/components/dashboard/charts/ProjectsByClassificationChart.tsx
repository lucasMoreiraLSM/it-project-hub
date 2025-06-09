
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface ProjectsByClassificationChartProps {
  data: ChartData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium">{`${label}: ${payload[0].value}`}</p>
        {payload[0].payload.fullName && (
          <p className="text-sm text-gray-600">{payload[0].payload.fullName}</p>
        )}
      </div>
    );
  }
  return null;
};

export const ProjectsByClassificationChart: React.FC<ProjectsByClassificationChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Projetos por Classificação</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
