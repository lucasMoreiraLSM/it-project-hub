
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Filters, FilterOptions } from '@/types/filters';
import { hasActiveFilters } from '@/utils/filterUtils';

interface ProjectFiltersProps {
  filters: Filters;
  filterOptions: FilterOptions;
  onFiltersChange: (filters: Filters) => void;
  onClearFilters: () => void;
}

export const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  filters,
  filterOptions,
  onFiltersChange,
  onClearFilters
}) => {
  const updateFilter = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card className="mb-6 bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filtros</CardTitle>
          {hasActiveFilters(filters) && (
            <Button 
              onClick={onClearFilters} 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
            >
              <X className="h-3 w-3" />
              Limpar Filtros
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Líder Projeto TI
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={filters.liderProjeto} 
              onChange={(e) => updateFilter('liderProjeto', e.target.value)}
            >
              <option value="">Todos</option>
              {filterOptions.lideresProjeto.map(lider => (
                <option key={lider} value={lider}>{lider}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gerente de Projetos
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={filters.gerenteProjetos} 
              onChange={(e) => updateFilter('gerenteProjetos', e.target.value)}
            >
              <option value="">Todos</option>
              {filterOptions.gerentesProjetos.map(gerente => (
                <option key={gerente} value={gerente}>{gerente}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={filters.inovacaoMelhoria} 
              onChange={(e) => updateFilter('inovacaoMelhoria', e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Inovação">Inovação</option>
              <option value="Melhoria">Melhoria</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status do Projeto
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={filters.statusProjeto} 
              onChange={(e) => updateFilter('statusProjeto', e.target.value)}
            >
              <option value="">Todos</option>
              <option value="green">Verde (No prazo)</option>
              <option value="yellow">Amarelo (Atenção)</option>
              <option value="red">Vermelho (Atrasado)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time TI
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={filters.timeTI} 
              onChange={(e) => updateFilter('timeTI', e.target.value)}
            >
              <option value="">Todos</option>
              {filterOptions.timesTI.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
