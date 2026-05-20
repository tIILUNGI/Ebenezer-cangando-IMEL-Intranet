import React from 'react';
import { useAuth } from '../../App';

/**
 * Component that renders a button to download the current user's profile as a PDF.
 * Fetches the PDF from the backend endpoint.
 */
export const ProfilePdfDownloader: React.FC = () => {
  const { user } = useAuth();

  const downloadPdf = async () => {
    if (!user) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/profile/me/export`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('imel_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Use the user's process number or name for the filename
      const filename = `dados_pessoais_${user.processNumber || user.id}_${new Date().toISOString().split('T')[0]}.pdf`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Erro ao baixar o PDF. Por favor, tente novamente.');
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
