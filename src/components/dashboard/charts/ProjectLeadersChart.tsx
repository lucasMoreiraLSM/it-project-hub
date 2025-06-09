
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

interface ChartData {
  name: string;
  fullName: string;
  value: number;
}

interface ProjectLeadersChartProps {
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
  const { x, y, width, height, value } = props;
  return (
    <text 
      x={x + width + 10} 
      y={y + height / 2} 
      fill="#374151" 
      textAnchor="start" 
      dy={4}
      fontSize={12}
      fontWeight="500"
    >
      {value}
    </text>
  );
};

export const ProjectLeadersChart: React.FC<ProjectLeadersChartProps> = ({ data }) => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Projetos por Líder de Projetos TI</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={data} 
            layout="horizontal"
            margin={{ top: 20, right: 50, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={150}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#8B5CF6">
              <LabelList content={<CustomLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
