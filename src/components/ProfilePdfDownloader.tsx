import React from 'react';
import { jsPDF } from 'jspdf';
import { useAuth, useDatabase } from '../../App';

/**
 * Component that renders a button to download the current user's profile as a PDF.
 * Generates the PDF entirely on the frontend using jsPDF.
 */
export const ProfilePdfDownloader: React.FC = () => {
  const { user } = useAuth();
  const { grades, auditLogs } = useDatabase();

  const downloadPdf = () => {
    if (!user) return;

    try {
      // Create a new PDF document
      const doc = new jsPDF({ margin: 20, format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Add content to the PDF
      doc.setFontSize(22);
      doc.text('Dados do Perfil - IMEL', pageWidth / 2, 30, { align: 'center' });
      doc.setFontSize(14);
      doc.text('Instituto Médio de Economia de Luanda', pageWidth / 2, 40, { align: 'center' });
      
      // Add a separator line
      doc.setLineWidth(0.5);
      doc.line(20, 50, pageWidth - 20, 50);
      
      let currentY = 70;

      // User Info Section
      doc.setFontSize(18);
      doc.text('Informações Pessoais', 20, currentY);
      doc.setLineWidth(0.3);
      doc.line(20, currentY + 2, 60, currentY + 2);
      currentY += 15;
      
      doc.setFontSize(12);
      const userInfo = [
        { label: 'Nome:', value: user.name },
        { label: 'Processo:', value: user.processNumber },
        { label: 'Role (Função):', value: user.role },
        { label: 'Email:', value: user.email || 'Não informado' },
        { label: 'Turma:', value: user.turma || 'Não informado' },
        { label: 'Telefone:', value: user.phone || 'Não informado' },
        { label: 'BI/NIF:', value: user.bi || 'Não informado' },
        { label: 'Status:', value: user.status || 'Ativo' }
      ];

      userInfo.forEach(info => {
        doc.text(`${info.label} ${info.value}`, 20, currentY);
        currentY += 10;
      });

      currentY += 10;

      // Academic Records Section (only for students)
      if (user.role === 'Aluno' && grades && grades.length > 0) {
        doc.setFontSize(18);
        doc.text('Registros Acadêmicos', 20, currentY);
        doc.setLineWidth(0.3);
        doc.line(20, currentY + 2, 60, currentY + 2);
        currentY += 15;
        
        // Group grades by disciplina for better organization
        const gradesByDisciplina: Record<string, any[]> = {};
        grades.forEach((grade: any) => {
          if (!gradesByDisciplina[grade.disciplina_id]) {
            gradesByDisciplina[grade.disciplina_id] = [];
          }
          gradesByDisciplina[grade.disciplina_id].push(grade);
        });

        let hasGrades = false;
        for (const [disciplinaId, disciplinaGrades] of Object.entries(gradesByDisciplina)) {
          // Check if we need a new page
          if (currentY > pageHeight - 50) {
            doc.addPage();
            currentY = 30;
          }
          
          doc.setFontSize(14);
          doc.text(`Disciplina ID: ${disciplinaId}`, 20, currentY);
          doc.setLineWidth(0.2);
          doc.line(20, currentY + 2, 50, currentY + 2);
          currentY += 10;
          
          doc.setFontSize(11);
          disciplinaGrades.forEach((grade: any) => {
            // Check if we need a new page
            if (currentY > pageHeight - 30) {
              doc.addPage();
              currentY = 30;
            }
            
            hasGrades = true;
            doc.text(`Trimestre ${grade.trimestre}:`, 25, currentY);
            doc.text(`MAC: ${grade.mac || 0} | NPP: ${grade.npp || 0} | NPT: ${grade.npt || 0} | Média: ${grade.media || 0} | Faltas: ${grade.faltas || 0}`, 50, currentY);
            currentY += 8;
          });
          currentY += 5;
        }

        if (!hasGrades) {
          doc.setFontSize(12);
          doc.text('Nenhum registro acadêmico disponível.', 20, currentY);
          currentY += 10;
        }
      } else if (user.role === 'Aluno') {
        doc.setFontSize(18);
        doc.text('Registros Acadêmicos', 20, currentY);
        doc.setLineWidth(0.3);
        doc.line(20, currentY + 2, 60, currentY + 2);
        currentY += 15;
        doc.setFontSize(12);
        doc.text('Nenhum registro acadêmico encontrado.', 20, currentY);
        currentY += 10;
      }

      currentY += 10;

      // Audit Logs Section
      if (auditLogs && auditLogs.length > 0) {
        // Check if we need a new page
        if (currentY > pageHeight - 50) {
          doc.addPage();
          currentY = 30;
        }
        
        doc.setFontSize(18);
        doc.text('Logs de Auditoria', 20, currentY);
        doc.setLineWidth(0.3);
        doc.line(20, currentY + 2, 60, currentY + 2);
        currentY += 15;
        
        doc.setFontSize(11);
        auditLogs.forEach((log: any, index: number) => {
          // Check if we need a new page
          if (currentY > pageHeight - 30) {
            doc.addPage();
            currentY = 30;
          }
          
          doc.text(`${index + 1}. Ação: ${log.acao || 'Não especificada'}`, 20, currentY);
          currentY += 6;
          
          if (log.modulo) {
            doc.text(`   Módulo: ${log.modulo}`, 25, currentY);
            currentY += 5;
          }
          
          if (log.detalhes) {
            // Split long details into multiple lines if needed
            const detalhes = log.detalhes.toString();
            if (detalhes.length > 80) {
              const words = detalhes.split(' ');
              let line = '';
              words.forEach(word => {
                if ((line + word).length > 80) {
                  doc.text(`   Detalhes: ${line}`, 25, currentY);
                  currentY += 5;
                  line = word + ' ';
                } else {
                  line += word + ' ';
                }
              });
              if (line) {
                doc.text(`   Detalhes: ${line.trim()}`, 25, currentY);
                currentY += 5;
              }
            } else {
              doc.text(`   Detalhes: ${log.detalhes}`, 25, currentY);
              currentY += 5;
            }
          }
          
          doc.text(`   Data/Hora: ${new Date(log.timestamp).toLocaleString()}`, 25, currentY);
          currentY += 10;
        });
      } else {
        // Check if we need a new page
        if (currentY > pageHeight - 50) {
          doc.addPage();
          currentY = 30;
        }
        
        doc.setFontSize(18);
        doc.text('Logs de Auditoria', 20, currentY);
        doc.setLineWidth(0.3);
        doc.line(20, currentY + 2, 60, currentY + 2);
        currentY += 15;
        doc.setFontSize(12);
        doc.text('Nenhum log de auditoria encontrado.', 20, currentY);
        currentY += 10;
      }

      // Footer
      doc.setFontSize(10);
      doc.text(`Exportado em: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 20, { align: 'center' });
      doc.setFontSize(8);
      doc.text(`Sistema de Gestão Academica - IMEL v3.1.0`, pageWidth / 2, pageHeight - 10, { align: 'center' });

      // Save the PDF
      doc.save(`${user.processNumber || user.id}_dados_pessoais_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erro ao gerar o PDF. Por favor, tente novamente.');
    }
  };

  return (
    <button
      onClick={downloadPdf}
      className="w-full py-4 border-2 border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m8-6H4" />
      </svg>
      Baixar PDF Completo
    </button>
  );
};
