
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, RotateCcw } from 'lucide-react';

interface Filters {
  tiposProjeto: string[];
  classificacoes: string[];
  timesProjetos: string[];
  gerentesProjeto: string[];
  statusGeral: string[];
  areasNegocio: string[];
}

interface FilterOptions {
  tiposProjeto: string[];
  classificacoes: string[];
  timesProjetos: string[];
  gerentesProjeto: string[];
  statusGeral: string[];
  areasNegocio: string[];
}

interface DashboardFiltersProps {
  filters: Filters;
  filterOptions: FilterOptions;
  searchGerente: string;
  onUpdateFilter: (filterType: keyof Filters, value: string, checked: boolean) => void;
  onResetFilters: () => void;
  onSearchGerenteChange: (search: string) => void;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  filters,
  filterOptions,
  searchGerente,
  onUpdateFilter,
  onResetFilters,
  onSearchGerenteChange
}) => {
  const gerentesFiltrados = filterOptions.gerentesProjeto.filter(gerente => 
    gerente.toLowerCase().includes(searchGerente.toLowerCase())
  );

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filtros</CardTitle>
          <Button onClick={onResetFilters} variant="outline" size="sm" className="flex items-center gap-2">
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Tipo de Projeto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Projeto</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {filters.tiposProjeto.length > 0 ? `${filters.tiposProjeto.length} selecionados` : 'Todos'}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {filterOptions.tiposProjeto.map(tipo => (
                  <DropdownMenuCheckboxItem
                    key={tipo}
                    checked={filters.tiposProjeto.includes(tipo)}
                    onCheckedChange={(checked) => onUpdateFilter('tiposProjeto', tipo, checked)}
                  >
                    {tipo}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Classificação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Classificação</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {filters.classificacoes.length > 0 ? `${filters.classificacoes.length} selecionados` : 'Todos'}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {filterOptions.classificacoes.map(classificacao => (
                  <DropdownMenuCheckboxItem
                    key={classificacao}
                    checked={filters.classificacoes.includes(classificacao)}
                    onCheckedChange={(checked) => onUpdateFilter('classificacoes', classificacao, checked)}
                  >
                    {classificacao}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Time de Projetos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time TI</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {filters.timesProjetos.length > 0 ? `${filters.timesProjetos.length} selecionados` : 'Todos'}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {filterOptions.timesProjetos.map(time => (
                  <DropdownMenuCheckboxItem
                    key={time}
                    checked={filters.timesProjetos.includes(time)}
                    onCheckedChange={(checked) => onUpdateFilter('timesProjetos', time, checked)}
                  >
                    {time}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Gerente de Projeto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gerente de Projeto</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {filters.gerentesProjeto.length > 0 ? `${filters.gerentesProjeto.length} selecionados` : 'Todos'}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                <div className="p-2">
                  <Input
                    placeholder="Buscar gerente..."
                    value={searchGerente}
                    onChange={(e) => onSearchGerenteChange(e.target.value)}
                    className="mb-2"
                  />
                </div>
                {gerentesFiltrados.map(gerente => (
                  <DropdownMenuCheckboxItem
                    key={gerente}
                    checked={filters.gerentesProjeto.includes(gerente)}
                    onCheckedChange={(checked) => onUpdateFilter('gerentesProjeto', gerente, checked)}
                  >
                    {gerente}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Status Geral */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status Geral</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {filters.statusGeral.length > 0 ? `${filters.statusGeral.length} selecionados` : 'Todos'}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {filterOptions.statusGeral.map(status => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={filters.statusGeral.includes(status)}
                    onCheckedChange={(checked) => onUpdateFilter('statusGeral', status, checked)}
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Área de Negócio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Área de Negócio</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {filters.areasNegocio.length > 0 ? `${filters.areasNegocio.length} selecionados` : 'Todos'}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {filterOptions.areasNegocio.map(area => (
                  <DropdownMenuCheckboxItem
                    key={area}
                    checked={filters.areasNegocio.includes(area)}
                    onCheckedChange={(checked) => onUpdateFilter('areasNegocio', area, checked)}
                  >
                    {area}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
