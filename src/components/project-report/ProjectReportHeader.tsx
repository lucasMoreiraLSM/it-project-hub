
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, EyeOff, Download, FileImage, FileText } from 'lucide-react';

interface ProjectReportHeaderProps {
  onBack: () => void;
  showScope: boolean;
  setShowScope: (show: boolean) => void;
  exportToPNG: () => void;
  exportToPDF: () => void;
}

export const ProjectReportHeader: React.FC<ProjectReportHeaderProps> = ({
  onBack,
  showScope,
  setShowScope,
  exportToPNG,
  exportToPDF
}) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>
      <h1 className="text-3xl font-bold text-gray-900">Relatório do Projeto</h1>
      
      <div className="flex items-center gap-2 ml-auto">
        <Button
          variant="outline"
          onClick={() => setShowScope(!showScope)}
          className="flex items-center gap-2"
        >
          {showScope ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showScope ? 'Ocultar' : 'Mostrar'} Escopo
        </Button>
        
        <Button
          variant="outline"
          onClick={exportToPNG}
          className="flex items-center gap-2"
        >
          <FileImage className="h-4 w-4" />
          Exportar PNG
        </Button>
        
        <Button
          variant="outline"
          onClick={exportToPDF}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>
    </div>
  );
};
