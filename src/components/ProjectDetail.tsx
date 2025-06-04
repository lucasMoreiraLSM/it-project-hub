import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Project, ProximaEtapa, EtapaExecutada } from '@/types/project';
import { calculatePercentualPrevisto, calculatePercentualRealizado, calculateDesvio, getFarolStatus, getDiasNaEtapa, getStatusCronograma, getStatusCronogramaStyle } from '@/utils/projectCalculations';
import { ArrowLeft, Plus, X, Check } from 'lucide-react';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onUpdate: (project: Project) => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onBack,
  onUpdate
}) => {
  const [editedProject, setEditedProject] = useState<Project>({
    ...project
  });

  const percentualPrevisto = calculatePercentualPrevisto(editedProject.cronograma);
  const percentualRealizado = calculatePercentualRealizado(editedProject.cronograma);
  const desvio = calculateDesvio(percentualPrevisto, percentualRealizado);
  const farol = getFarolStatus(desvio);

  const handleSave = () => {
    onUpdate(editedProject);
  };

  const addToList = (field: keyof Project, newItem: any) => {
    const currentList = editedProject[field] as any[];
    setEditedProject({
      ...editedProject,
      [field]: [...currentList, newItem]
    });
  };

  const removeFromList = (field: keyof Project, index: number) => {
    const currentList = editedProject[field] as any[];
    setEditedProject({
      ...editedProject,
      [field]: currentList.filter((_, i) => i !== index)
    });
  };

  const updateListItem = (field: keyof Project, index: number, value: any) => {
    const currentList = editedProject[field] as any[];
    const updatedList = [...currentList];
    updatedList[index] = value;
    setEditedProject({
      ...editedProject,
      [field]: updatedList
    });
  };

  const concluirEtapa = (index: number) => {
    const proximaEtapa = editedProject.proximasEtapas[index];
    const novaEtapaExecutada: EtapaExecutada = {
      atividade: proximaEtapa.atividade,
      dataConclusao: new Date().toISOString().split('T')[0] // Data atual no formato YYYY-MM-DD
    };

    // Remove da lista de próximas etapas
    const novasProximasEtapas = editedProject.proximasEtapas.filter((_, i) => i !== index);

    // Adiciona à lista de etapas executadas
    const novasEtapasExecutadas = [...editedProject.etapasExecutadas, novaEtapaExecutada];
    setEditedProject({
      ...editedProject,
      proximasEtapas: novasProximasEtapas,
      etapasExecutadas: novasEtapasExecutadas
    });
  };

  const getFarolColor = (status: string) => {
    switch (status) {
      case 'Verde':
        return 'bg-green-500';
      case 'Amarelo':
        return 'bg-yellow-500';
      case 'Vermelho':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Detalhes do Projeto</h1>
          <Button onClick={handleSave} className="ml-auto">
            Salvar Alterações
          </Button>
        </div>

        <div className="space-y-6">
          {/* Dados do Projeto */}
          <Card>
            <CardHeader>
              <CardTitle>📌 Dados do Projeto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome do Projeto</Label>
                  <Input 
                    id="nome" 
                    value={editedProject.nome} 
                    onChange={e => setEditedProject({
                      ...editedProject,
                      nome: e.target.value
                    })} 
                  />
                </div>
                <div>
                  <Label htmlFor="areaNegocio">Área de Negócio</Label>
                  <Input 
                    id="areaNegocio" 
                    value={editedProject.areaNegocio} 
                    onChange={e => setEditedProject({
                      ...editedProject,
                      areaNegocio: e.target.value
                    })} 
                  />
                </div>
                <div>
                  <Label htmlFor="inovacaoMelhoria">Inovação/Melhoria</Label>
                  <Select 
                    value={editedProject.inovacaoMelhoria} 
                    onValueChange={(value: 'Inovação' | 'Melhoria') => setEditedProject({
                      ...editedProject,
                      inovacaoMelhoria: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inovação">Inovação</SelectItem>
                      <SelectItem value="Melhoria">Melhoria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="estrategicoTatico">Classificação do Projeto</Label>
                  <Select 
                    value={editedProject.estrategicoTatico} 
                    onValueChange={(value: 'Estratégico' | 'Tático') => setEditedProject({
                      ...editedProject,
                      estrategicoTatico: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Estratégico">Estratégico</SelectItem>
                      <SelectItem value="Tático">Tático</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="timeTI">Time TI</Label>
                  <Input 
                    id="timeTI" 
                    value={editedProject.timeTI} 
                    onChange={e => setEditedProject({
                      ...editedProject,
                      timeTI: e.target.value
                    })} 
                    placeholder="Projetos, Infraestrutura, Segurança, Sustentação" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">% Previsto</Label>
                  <div className="text-2xl font-bold text-blue-600">{percentualPrevisto}%</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">% Realizado</Label>
                  <div className="text-2xl font-bold text-green-600">{percentualRealizado}%</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">% Desvio</Label>
                  <div className={`text-2xl font-bold ${desvio >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {desvio > 0 ? '+' : ''}{desvio}%
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Farol</Label>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${getFarolColor(farol)}`}></div>
                    <span className="font-medium">{farol}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Responsáveis do Projeto */}
          <Card>
            <CardHeader>
              <CardTitle>👥 Responsáveis do Projeto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sponsor">Sponsor</Label>
                  <Input 
                    id="sponsor" 
                    value={editedProject.sponsor} 
                    onChange={e => setEditedProject({
                      ...editedProject,
                      sponsor: e.target.value
                    })} 
                  />
                </div>
                <div>
                  <Label htmlFor="productOwner">Product Owner</Label>
                  <Input 
                    id="productOwner" 
                    value={editedProject.productOwner} 
                    onChange={e => setEditedProject({
                      ...editedProject,
                      productOwner: e.target.value
                    })} 
                  />
                </div>
                <div>
                  <Label htmlFor="gerenteProjetos">Gerente de Projetos</Label>
                  <Input 
                    id="gerenteProjetos" 
                    value={editedProject.gerenteProjetos} 
                    onChange={e => setEditedProject({
                      ...editedProject,
                      gerenteProjetos: e.target.value
                    })} 
                  />
                </div>
                <div>
                  <Label htmlFor="liderProjetosTI">Líder Projetos TI</Label>
                  <Input 
                    id="liderProjetosTI" 
                    value={editedProject.liderProjetosTI} 
                    onChange={e => setEditedProject({
                      ...editedProject,
                      liderProjetosTI: e.target.value
                    })} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Escopo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                📝 Escopo
                <Button size="sm" onClick={() => addToList('escopo', '')} className="flex items-center gap-1">
                  <Plus className="h-3 w-3" />
                  Adicionar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {editedProject.escopo.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input 
                      value={item} 
                      onChange={e => updateListItem('escopo', index, e.target.value)} 
                      placeholder="Funcionalidade" 
                    />
                    <Button variant="outline" size="sm" onClick={() => removeFromList('escopo', index)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Principais Objetivos e Metas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                🎯 Principais Objetivos e Metas
                <Button size="sm" onClick={() => addToList('objetivos', '')} className="flex items-center gap-1">
                  <Plus className="h-3 w-3" />
                  Adicionar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {editedProject.objetivos.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input 
                      value={item} 
                      onChange={e => updateListItem('objetivos', index, e.target.value)} 
                      placeholder="Objetivo" 
                    />
                    <Button variant="outline" size="sm" onClick={() => removeFromList('objetivos', index)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Etapas Executadas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                ✅ Etapas Executadas
                <Button size="sm" onClick={() => addToList('etapasExecutadas', {
                  atividade: '',
                  dataConclusao: ''
                })} className="flex items-center gap-1">
                  <Plus className="h-3 w-3" />
                  Adicionar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 p-2 text-left">Atividade</th>
                      <th className="border border-gray-200 p-2 text-left">Data de Conclusão</th>
                      <th className="border border-gray-200 p-2 text-left">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editedProject.etapasExecutadas.map((etapa, index) => (
                      <tr key={index}>
                        <td className="border border-gray-200 p-2">
                          <Input 
                            value={etapa.atividade} 
                            onChange={e => updateListItem('etapasExecutadas', index, {
                              ...etapa,
                              atividade: e.target.value
                            })} 
                            placeholder="Atividade executada" 
                          />
                        </td>
                        <td className="border border-gray-200 p-2">
                          <Input 
                            type="date" 
                            value={etapa.dataConclusao} 
                            onChange={e => updateListItem('etapasExecutadas', index, {
                              ...etapa,
                              dataConclusao: e.target.value
                            })} 
                          />
                        </td>
                        <td className="border border-gray-200 p-2">
                          <Button variant="outline" size="sm" onClick={() => removeFromList('etapasExecutadas', index)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Próximas Etapas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                🗓️ Próximas Etapas
                <Button size="sm" onClick={() => addToList('proximasEtapas', {
                  atividade: '',
                  responsavel: '',
                  previsao: ''
                })} className="flex items-center gap-1">
                  <Plus className="h-3 w-3" />
                  Adicionar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 p-2 text-left">Atividade</th>
                      <th className="border border-gray-200 p-2 text-left">Responsável</th>
                      <th className="border border-gray-200 p-2 text-left">Previsão</th>
                      <th className="border border-gray-200 p-2 text-left">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editedProject.proximasEtapas.map((etapa, index) => (
                      <tr key={index}>
                        <td className="border border-gray-200 p-2">
                          <Input 
                            value={etapa.atividade} 
                            onChange={e => updateListItem('proximasEtapas', index, {
                              ...etapa,
                              atividade: e.target.value
                            })} 
                            placeholder="Atividade" 
                          />
                        </td>
                        <td className="border border-gray-200 p-2">
                          <Input 
                            value={etapa.responsavel} 
                            onChange={e => updateListItem('proximasEtapas', index, {
                              ...etapa,
                              responsavel: e.target.value
                            })} 
                            placeholder="Responsável" 
                          />
                        </td>
                        <td className="border border-gray-200 p-2">
                          <Input 
                            type="date" 
                            value={etapa.previsao} 
                            onChange={e => updateListItem('proximasEtapas', index, {
                              ...etapa,
                              previsao: e.target.value
                            })} 
                          />
                        </td>
                        <td className="border border-gray-200 p-2">
                          <div className="flex gap-1">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => concluirEtapa(index)} 
                              className="flex items-center gap-1 text-green-600 hover:text-green-700" 
                              title="Concluir etapa"
                            >
                              <Check className="h-3 w-3" />
                              Concluir
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => removeFromList('proximasEtapas', index)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Cronograma de Atividades Macro */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                📊 Cronograma de Atividades Macro
                <Button size="sm" onClick={() => addToList('cronograma', {
                  etapa: '',
                  inicio: '',
                  fim: '',
                  percentualPrevisto: 0,
                  percentualRealizado: 0
                })} className="flex items-center gap-1">
                  <Plus className="h-3 w-3" />
                  Adicionar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 p-2 text-left">Etapa</th>
                      <th className="border border-gray-200 p-2 text-left">Início</th>
                      <th className="border border-gray-200 p-2 text-left">Fim</th>
                      <th className="border border-gray-200 p-2 text-left">Status</th>
                      <th className="border border-gray-200 p-2 text-left">% Previsto</th>
                      <th className="border border-gray-200 p-2 text-left">% Realizado</th>
                      <th className="border border-gray-200 p-2 text-left">Dias na Etapa</th>
                      <th className="border border-gray-200 p-2 text-left">Dia Atual</th>
                      <th className="border border-gray-200 p-2 text-left">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editedProject.cronograma.map((item, index) => {
                      const diasNaEtapa = getDiasNaEtapa(item.inicio);
                      const status = getStatusCronograma(item);
                      const hoje = new Date().toLocaleDateString('pt-BR');
                      
                      return (
                        <tr key={index}>
                          <td className="border border-gray-200 p-2">
                            <Input 
                              value={item.etapa} 
                              onChange={e => updateListItem('cronograma', index, {
                                ...item,
                                etapa: e.target.value
                              })} 
                              placeholder="Descrição da etapa" 
                            />
                          </td>
                          <td className="border border-gray-200 p-2">
                            <Input 
                              type="date" 
                              value={item.inicio} 
                              onChange={e => updateListItem('cronograma', index, {
                                ...item,
                                inicio: e.target.value
                              })} 
                            />
                          </td>
                          <td className="border border-gray-200 p-2">
                            <Input 
                              type="date" 
                              value={item.fim} 
                              onChange={e => updateListItem('cronograma', index, {
                                ...item,
                                fim: e.target.value
                              })} 
                              min={item.inicio} 
                            />
                          </td>
                          <td className="border border-gray-200 p-2 rounded-none px-0 mx-[3px]">
                            <span className={`px-2 py-1 rounded text-xs ${getStatusCronogramaStyle(status)}`}>
                              {status}
                            </span>
                          </td>
                          <td className="border border-gray-200 p-2">
                            <Input 
                              type="number" 
                              min="0" 
                              max="100" 
                              value={item.percentualPrevisto} 
                              onChange={e => updateListItem('cronograma', index, {
                                ...item,
                                percentualPrevisto: parseInt(e.target.value) || 0
                              })} 
                            />
                          </td>
                          <td className="border border-gray-200 p-2">
                            <Input 
                              type="number" 
                              min="0" 
                              max="100" 
                              value={item.percentualRealizado} 
                              onChange={e => updateListItem('cronograma', index, {
                                ...item,
                                percentualRealizado: parseInt(e.target.value) || 0
                              })} 
                            />
                          </td>
                          <td className="border border-gray-200 p-2 text-center">{diasNaEtapa}</td>
                          <td className="border border-gray-200 p-2 text-center">{hoje}</td>
                          <td className="border border-gray-200 p-2">
                            <Button variant="outline" size="sm" onClick={() => removeFromList('cronograma', index)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Pontos de Atenção e Impedimentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                ⚠️ Pontos de Atenção e Impedimentos
                <Button size="sm" onClick={() => addToList('pontosAtencao', '')} className="flex items-center gap-1">
                  <Plus className="h-3 w-3" />
                  Adicionar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {editedProject.pontosAtencao.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input 
                      value={item} 
                      onChange={e => updateListItem('pontosAtencao', index, e.target.value)} 
                      placeholder="Ponto de atenção" 
                      className="text-red-600 placeholder-red-400" 
                    />
                    <Button variant="outline" size="sm" onClick={() => removeFromList('pontosAtencao', index)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};
