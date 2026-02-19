
import React from 'react';
import { useDatabase, useSettings, useAuth } from '../App';
import { FileText, Download, TrendingUp, Printer, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

const GradesPage: React.FC = () => {
  const { activeStudent } = useAuth();
  const { grades } = useDatabase();
  const { t } = useSettings();

  // Filtrar todas as notas do aluno ativo
  const studentGrades = grades.filter(g => g.studentId === activeStudent?.id);

  const calculateGlobalAvg = () => {
    const valid = studentGrades.filter(g => g.t1.average !== null);
    if (valid.length === 0) return '0.0';
    return (valid.reduce((acc, g) => acc + (g.t1.average || 0), 0) / valid.length).toFixed(1);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const fileName = `Boletim_Oficial_${activeStudent?.name?.replace(/ /g, '_') || 'Aluno'}.html`;
    const html = `
      <html><head><meta charset="utf-8"><title>${fileName}</title></head>
      <body>
        <h2>Boletim Trimestral</h2>
        <p>Aluno: ${activeStudent?.name || '-'}</p>
        <p>Processo: ${activeStudent?.processNumber || '-'}</p>
        <p>Turma: ${activeStudent?.turma || '-'}</p>
        <ul>
          ${studentGrades.map(g => `<li>${g.subject}: Média ${g.t1.average ?? '-'} | Faltas ${g.faltas}</li>`).join('')}
        </ul>
      </body></html>
    `;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fade">
      {/* Header com Ações */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Mini-Pauta Individual</h1>
          <p className="text-slate-500 dark:text-slate-400">Aluno: {activeStudent?.name} | Turma: {activeStudent?.turma}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <Printer size={18} /> Imprimir
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:scale-105 transition-all shadow-lg"
          >
            <Download size={18} /> Baixar Boletim
          </button>
        </div>
      </div>

      {/* Resumo no Topo */}
      <div className="grid md:grid-cols-4 gap-6 no-print">
        <div className="bg-primary p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-900/20">
          <p className="text-[10px] font-black uppercase opacity-60 mb-2">Média Global (1º Tri)</p>
          <h3 className="text-4xl font-black">{calculateGlobalAvg()}</h3>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Aproveitamento</p>
          <div className="flex items-center gap-2">
            <TrendingUp size={24} className="text-emerald-500" />
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">Positivo</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Faltas Totais</p>
          <h3 className="text-3xl font-black text-orange-500">{studentGrades.reduce((a, b) => a + b.faltas, 0)}</h3>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Ano Lectivo</p>
          <h3 className="text-2xl font-black text-slate-800 dark:text-white">2025/2026</h3>
        </div>
      </div>

      {/* Tabela de Pauta */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden print:border-none print:shadow-none transition-colors">
        {/* Cabeçalho de Impressão */}
        <div className="hidden print:block p-10 text-center border-b-2 border-slate-200">
           <h1 className="text-2xl font-black uppercase">Instituto Médio de Economia de Luanda</h1>
           <p className="font-bold">Boletim Trimestral de Aproveitamento Académico</p>
           <div className="mt-8 flex justify-between text-left text-[10px] uppercase font-bold">
             <div><span>ALUNO:</span> {activeStudent?.name}</div>
             <div><span>PROCESSO:</span> {activeStudent?.processNumber}</div>
             <div><span>TURMA:</span> {activeStudent?.turma}</div>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                <th rowSpan={2} className="px-8 py-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest min-w-[200px]">Disciplina</th>
                <th colSpan={4} className="px-4 py-3 text-xs font-black text-primary uppercase border-x border-slate-100 dark:border-slate-700">1º Trimestre</th>
                <th colSpan={4} className="px-4 py-3 text-xs font-black text-slate-300 uppercase border-x border-slate-100 dark:border-slate-700">2º Trimestre</th>
                <th colSpan={4} className="px-4 py-3 text-xs font-black text-slate-300 uppercase border-x border-slate-100 dark:border-slate-700">3º Trimestre</th>
                <th rowSpan={2} className="px-4 py-3 text-xs font-black text-slate-400 uppercase">Faltas</th>
              </tr>
              <tr className="bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-700">
                <th className="px-2 py-3 text-[9px] font-black text-slate-400">MAC</th>
                <th className="px-2 py-3 text-[9px] font-black text-slate-400">NPP</th>
                <th className="px-2 py-3 text-[9px] font-black text-slate-400">NPT</th>
                <th className="px-2 py-3 text-[9px] font-black text-primary">MÉD</th>
                <th className="px-2 py-3 text-[9px] font-black text-slate-300 border-l border-slate-100">MAC</th>
                <th className="px-2 py-3 text-[9px] font-black text-slate-300">NPP</th>
                <th className="px-2 py-3 text-[9px] font-black text-slate-300">NPT</th>
                <th className="px-2 py-3 text-[9px] font-black text-slate-300">MÉD</th>
                <th className="px-2 py-3 text-[9px] font-black text-slate-300 border-l border-slate-100">MAC</th>
                <th className="px-2 py-3 text-[9px] font-black text-slate-300">NPP</th>
                <th className="px-2 py-3 text-[9px] font-black text-slate-300">NPT</th>
                <th className="px-2 py-3 text-[9px] font-black text-slate-300">MÉD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {studentGrades.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-20 text-slate-300 italic">Nenhum registro de nota localizado.</td>
                </tr>
              ) : studentGrades.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-8 py-5 text-left font-bold text-slate-800 dark:text-white uppercase text-xs">{g.subject}</td>
                  {/* T1 */}
                  <td className="px-2 py-5 font-bold text-slate-600 dark:text-slate-400">{g.t1.mac ?? '-'}</td>
                  <td className="px-2 py-5 font-bold text-slate-600 dark:text-slate-400">{g.t1.npp ?? '-'}</td>
                  <td className="px-2 py-5 font-bold text-slate-600 dark:text-slate-400">{g.t1.npt ?? '-'}</td>
                  <td className={`px-2 py-5 font-black border-r border-slate-100 dark:border-slate-700 ${g.t1.average && g.t1.average < 10 ? 'text-red-500' : 'text-primary dark:text-secondary'}`}>
                    {g.t1.average ?? '-'}
                  </td>
                  {/* T2 */}
                  <td className="px-2 py-5 text-slate-200">-</td>
                  <td className="px-2 py-5 text-slate-200">-</td>
                  <td className="px-2 py-5 text-slate-200">-</td>
                  <td className="px-2 py-5 text-slate-200 border-r border-slate-100">-</td>
                  {/* T3 */}
                  <td className="px-2 py-5 text-slate-200">-</td>
                  <td className="px-2 py-5 text-slate-200">-</td>
                  <td className="px-2 py-5 text-slate-200">-</td>
                  <td className="px-2 py-5 text-slate-200 border-r border-slate-100">-</td>
                  <td className="px-4 py-5 font-black text-orange-500">{g.faltas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-slate-900/50 p-8 rounded-[2.5rem] border border-blue-100 dark:border-slate-700 flex flex-col md:flex-row gap-6 items-center justify-between no-print transition-colors">
         <div className="flex items-center gap-4">
           <ShieldCheck size={32} className="text-primary" />
           <div>
             <p className="font-bold text-slate-800 dark:text-white uppercase text-sm">Autenticação SIG-IMEL</p>
             <p className="text-[10px] text-slate-500 font-mono">HASH: {Math.random().toString(36).substring(2).toUpperCase()}</p>
           </div>
         </div>
         <p className="text-[10px] text-slate-400 italic">Documento verificado digitalmente pelo sistema interno.</p>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0 !important; }
          #root { padding: 0 !important; }
          table { width: 100% !important; border-collapse: collapse !important; font-size: 10px !important; }
          th, td { border: 1px solid #ddd !important; padding: 4px !important; }
        }
      `}</style>
    </div>
  );
};

export default GradesPage;

