
import React from 'react';
import { ProjectsByClassificationChart } from './charts/ProjectsByClassificationChart';
import { ProjectsByTypeChart } from './charts/ProjectsByTypeChart';
import { ProjectsByAreaChart } from './charts/ProjectsByAreaChart';
import { TopManagersChart } from './charts/TopManagersChart';
import { StatusDistributionChart } from './charts/StatusDistributionChart';

interface ChartData {
  classificacaoData: Array<{ name: string; value: number; color: string }>;
  tipoData: Array<{ name: string; value: number; color: string }>;
  areaData: Array<{ name: string; fullName: string; value: number }>;
  liderData: Array<{ name: string; fullName: string; value: number }>;
  statusData: Array<{ name: string; value: number; color: string }>;
}

interface DashboardChartsProps {
  chartData: ChartData;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ chartData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ProjectsByClassificationChart data={chartData.classificacaoData} />
      <ProjectsByTypeChart data={chartData.tipoData} />
      <ProjectsByAreaChart data={chartData.areaData} />
      <TopManagersChart data={chartData.liderData} />
      <StatusDistributionChart data={chartData.statusData} />
    </div>
  );
};
