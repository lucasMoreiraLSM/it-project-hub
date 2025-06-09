
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

interface ChartData {
  name: string;
  fullName: string;
  value: number;
}

interface ProjectsByAreaChartProps {
  data: ChartData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium">{`${payload[0].payload.fullName || label}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const CustomLabel = (props: any) => {
  const { x, y, width, value } = props;
  return (
    <text 
      x={x + width / 2} 
      y={y - 5} 
      fill="#374151" 
      textAnchor="middle" 
      fontSize={14}
      fontWeight="600"
    >
      {value}
    </text>
  );
};

export const ProjectsByAreaChart: React.FC<ProjectsByAreaChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Projetos por Área de Negócio</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 30, right: 20, left: 20, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={80} 
              fontSize={12} 
            />
            <YAxis domain={[0, 'dataMax']} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#10B981">
              <LabelList content={<CustomLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
