
import React, { useState, useRef } from 'react';
import { Project } from '@/types/project';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ProjectReportHeader } from './project-report/ProjectReportHeader';
import { ProjectReportData } from './project-report/ProjectReportData';
import { ProjectReportScope } from './project-report/ProjectReportScope';
import { ProjectReportSchedule } from './project-report/ProjectReportSchedule';
import { ProjectReportExecutedSteps } from './project-report/ProjectReportExecutedSteps';
import { ProjectReportNextSteps } from './project-report/ProjectReportNextSteps';

interface ProjectReportProps {
  project: Project;
  onBack: () => void;
}

export const ProjectReport: React.FC<ProjectReportProps> = ({
  project,
  onBack
}) => {
  const [showScope, setShowScope] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);

  const exportToPNG = async () => {
    if (!reportRef.current) return;
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const link = document.createElement('a');
      link.download = `relatorio-${project.nome.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Erro ao exportar PNG:', error);
    }
  };

  const exportToPDF = async () => {
    if (!reportRef.current) return;
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`relatorio-${project.nome.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 py-[14px]">
      <div className="max-w-6xl mx-auto">
        <ProjectReportHeader
          onBack={onBack}
          showScope={showScope}
          setShowScope={setShowScope}
          exportToPNG={exportToPNG}
          exportToPDF={exportToPDF}
        />

        <div ref={reportRef} className="space-y-6">
          <ProjectReportData project={project} />
          
          {showScope && <ProjectReportScope project={project} />}
          
          <ProjectReportSchedule project={project} />
          
          <ProjectReportExecutedSteps project={project} />
          
          <ProjectReportNextSteps project={project} />
        </div>
      </div>
    </div>
  );
};
