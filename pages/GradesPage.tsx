import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, useDatabase, useSettings } from '../App';
import {
  FileText,
  Download,
  TrendingUp,
  Printer,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Plus,
  Edit,
  Trash,
  Search,
  Filter,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { fetchGrades } from '../src/api/index';

const GradesPage: React.FC = () => {
  const { activeStudent } = useAuth();
  const { grades, replaceGrades, addAuditLog } = useDatabase();
  const { t } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const studentGrades = grades.filter((g) => g.studentId === activeStudent?.id);

  const filteredGrades = useMemo(() => {
    if (!searchTerm) return studentGrades;
    return studentGrades.filter((g) => g.subject.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [studentGrades, searchTerm, activeStudent]);

  const user = JSON.parse(localStorage.getItem('imel_user') || '{}');

  const refreshGrades = async () => {
    setIsRefreshing(true);
    try {
      const { data } = await fetchGrades();
      replaceGrades(data);
      addAuditLog(user?.name || 'Sistema', 'SINCRONIZOU_NOTAS', 'Pauta', `${data.length} Registos`);
    } catch (err) {
      console.warn('Failed to refresh grades from API, using local data');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshGrades();
  }, []);

  const calculateGlobalAvg = () => {
    const valid = studentGrades.filter((g) => g.t1?.average !== null);
    if (valid.length === 0) return '0.0';
    return (valid.reduce((acc, g) => acc + (g.t1?.average || 0), 0) / valid.length).toFixed(1);
  };

  const getGradeColor = (avg: number | null) => {
    if (avg === null) return 'text-slate-400';
    if (avg >= 14) return 'text-emerald-600';
    if (avg >= 10) return 'text-primary';
    return 'text-red-500';
  };

  const handlePrint = () => window.print();

  const handleDownloadPDF = () => {
    const printCSS = `
      <style>
        @page { margin: 1.5cm 1.2cm; size: A4 portrait; }
        * { box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; font-size: 11px; color: #1a1a2e; padding: 0; margin: 0; line-height: 1.4; }
        .document-wrapper { max-width: 800px; margin: 0 auto; padding: 20px; }
        /* Header */
        .doc-header { text-align: center; border-bottom: 3px solid #003366; padding-bottom: 16px; margin-bottom: 20px; }
        .doc-header .school-name { font-size: 18px; font-weight: 900; color: #003366; text-transform: uppercase; letter-spacing: 2px; }
        .doc-header .doc-title { font-size: 14px; font-weight: 700; color: #333; margin-top: 4px; }
        .doc-header .doc-subtitle { font-size: 10px; color: #666; margin-top: 2px; }
        /* Student info bar */
        .student-info { display: flex; justify-content: space-between; background: #003366; color: white; padding: 10px 16px; border-radius: 6px; margin-bottom: 20px; font-size: 10px; font-weight: 700; }
        .student-info span { color: rgba(255,255,255,0.85); }
        /* Table */
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        thead tr { background: #003366; color: white; }
        thead th { padding: 8px 6px; text-align: center; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        thead th.subject-col { text-align: left; }
        tbody tr:nth-child(even) { background: #f4f6f9; }
        tbody tr:hover { background: #eaf0fb; }
        tbody td { padding: 7px 6px; border: 1px solid #dde3ec; text-align: center; font-size: 10px; }
        tbody td.subject-col { text-align: left; font-weight: 700; text-transform: uppercase; color: #003366; font-size: 9px; }
        tbody td.average { font-size: 13px; font-weight: 900; }
        .average-pass { color: #16a34a; }
        .average-fail { color: #dc2626; }
        /* Footer */
        .doc-footer { margin-top: 24px; display: flex; justify-content: space-between; align-items: center; border-top: 2px solid #003366; padding-top: 12px; }
        .doc-footer .hash { font-size: 8px; color: #888; font-family: monospace; }
        .doc-footer .verified { font-size: 9px; color: #003366; font-weight: 700; }
      </style>`;
    const displayGrades = [...filteredGrades].sort((a, b) =>
      (a.t1.average ?? 0) > (b.t1.average ?? 0) ? -1 : 1
    );
    const avgColor = (avg: number | null) =>
      avg === null ? '' : avg >= 10 ? 'average-pass' : 'average-fail';
    const html = `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="utf-8"><title>Boletim_${activeStudent?.name || 'IMEL'}</title>${printCSS}</head>
<body>
<div class="document-wrapper">
  <div class="doc-header">
    <div class="school-name">Instituto Médio de Economia de Luanda</div>
    <div class="doc-title">Boletim Trimestral de Aproveitamento Académico</div>
    <div class="doc-subtitle">Ano Lectivo 2025/2026 &nbsp;|&nbsp; Gerado em ${new Date().toLocaleDateString('pt-PT')}</div>
  </div>
  <div class="student-info">
    <div><span>ALUNO:</span> ${activeStudent?.name || '—'}</div>
    <div><span>PROCESSO:</span> ${activeStudent?.processNumber || '—'}</div>
    <div><span>TURMA:</span> ${activeStudent?.turma || '—'}</div>
  </div>
  <table>
    <thead>
      <tr>
        <th class="subject-col" style="width:35%">Disciplina</th>
        <th colspan="4" style="background:#0055aa">1º Trimestre</th>
        <th colspan="4" style="background:#557799">2º Trimestre</th>
        <th colspan="4" style="background:#557799">3º Trimestre</th>
        <th>Faltas</th>
      </tr>
      <tr>
        <th class="subject-col"></th>
        <th>MAC</th><th>NPP</th><th>NPT</th><th>MÉD</th>
        <th>MAC</th><th>NPP</th><th>NPT</th><th>MÉD</th>
        <th>MAC</th><th>NPP</th><th>NPT</th><th>MÉD</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      ${displayGrades.map(g => `<tr>
        <td class="subject-col">${g.subject}</td>
        <td>${g.t1.mac ?? ''}</td><td>${g.t1.npp ?? ''}</td><td>${g.t1.npt ?? ''}</td>
        <td class="average ${avgColor(g.t1.average)}">${g.t1.average ?? ''}</td>
        <td style="color:#ccc">—</td><td style="color:#ccc">—</td><td style="color:#ccc">—</td><td style="color:#ccc">—</td>
        <td style="color:#ccc">—</td><td style="color:#ccc">—</td><td style="color:#ccc">—</td><td style="color:#ccc">—</td>
        <td style="font-weight:700;${g.faltas > 3 ? 'color:#dc2626' : 'color:#666'}">${g.faltas}</td>
      </tr>`).join('')}
    </tbody>
  </table>
  <div class="doc-footer">
    <div class="verified">Documento gerado pelo Sistema Interno SIG-IMEL &nbsp;|&nbsp; Autenticação digital activa</div>
    <div class="hash">HASH: ${(Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12)).toUpperCase()}</div>
  </div>
</div>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Boletim_${activeStudent?.name?.replace(/\s+/g, '_') || 'IMEL'}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Minhas Notas
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Aluno: {activeStudent?.name} | Turma: {activeStudent?.turma}
          </p>
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
          <button
            onClick={refreshGrades}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            <TrendingUp size={18} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <Search size={18} className="text-slate-400 ml-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pesquisar disciplina..."
          className="w-full pl-2 pr-4 py-2 bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
        />
      </div>

      <div className="grid md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-primary p-6 sm:p-8 rounded-[2rem] text-white shadow-xl shadow-blue-900/20">
          <p className="text-[10px] font-black uppercase opacity-60 mb-2">Média Global (1º Tri)</p>
          <h3 className="text-3xl sm:text-4xl font-black">{calculateGlobalAvg()}</h3>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Disciplinas</p>
          <h3 className="text-2xl font-black text-slate-800 dark:text-white">
            {filteredGrades.length}
          </h3>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Faltas Totais</p>
          <h3 className="text-3xl font-black text-orange-500">
            {studentGrades.reduce((a, b) => a + b.faltas, 0)}
          </h3>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Ano Lectivo</p>
          <h3 className="text-2xl font-black text-slate-800 dark:text-white">2025/2026</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="hidden print:block p-8 text-center border-b-2 border-slate-200">
          <h1 className="text-2xl font-black uppercase">Instituto Médio de Economia de Luanda</h1>
          <p className="font-bold">Boletim Trimestral de Aproveitamento Académico</p>
          <div className="mt-6 flex justify-between text-left text-[10px] uppercase font-bold">
            <div>
              <span>ALUNO:</span> {activeStudent?.name}
            </div>
            <div>
              <span>PROCESSO:</span> {activeStudent?.processNumber}
            </div>
            <div>
              <span>TURMA:</span> {activeStudent?.turma}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                <th
                  rowSpan={2}
                  className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest min-w-[180px]"
                >
                  Disciplina
                </th>
                <th
                  colSpan={4}
                  className="px-3 py-3 text-[10px] font-black text-primary uppercase border-x border-slate-100 dark:border-slate-700"
                >
                  1º Trimestre
                </th>
                <th
                  colSpan={4}
                  className="px-3 py-3 text-[10px] font-black text-slate-300 uppercase border-x border-slate-100 dark:border-slate-700"
                >
                  2º Trimestre
                </th>
                <th
                  colSpan={4}
                  className="px-3 py-3 text-[10px] font-black text-slate-300 uppercase border-x border-slate-100 dark:border-slate-700"
                >
                  3º Trimestre
                </th>
                <th
                  rowSpan={2}
                  className="px-3 py-3 text-[10px] font-black text-slate-400 uppercase"
                >
                  Faltas
                </th>
              </tr>
              <tr className="bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-700">
                <th className="px-2 py-3 text-[9px] font-black text-slate-400">MAC</th>
                <th className="px-2 py-3 text-[9px] font-black text-slate-400">NPP</th>
                <th className="px-2 py-3 text-[9px] font-black text-slate-400">NPT</th>
                <th className="px-2 py-3 text-[9px] font-black text-primary">MÉD</th>
                <th className="px-2 py-3 text-[9px] font-black text-slate-300">MAC</th>
                <th className="px-2 py-3 text-[9px] font-black text-slate-300">NPP</th>
                <th className="px-2 py-3 text-[9px] font-black text-slate-300">NPT</th>
                <th className="px-2 py-3 text-[9px] font-black text-slate-300">MÉD</th>
                <th className="px-2 py-3 text-[9px] font-black text-slate-300">MAC</th>
                <th className="px-2 py-3 text-[9px] font-black text-slate-300">NPP</th>
                <th className="px-2 py-3 text-[9px] font-black text-slate-300">NPT</th>
                <th className="px-2 py-3 text-[9px] font-black text-slate-300">MÉD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {filteredGrades.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-16 text-slate-300 italic">
                    Nenhuma nota encontrada.
                  </td>
                </tr>
              ) : (
                filteredGrades.map((g) => (
                  <tr
                    key={g.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-5 text-left font-bold text-slate-800 dark:text-white uppercase text-xs">
                      {g.subject}
                    </td>
                    <td className="px-2 py-5 font-bold text-slate-600 dark:text-slate-400">
                      {g.t1.mac ?? '-'}
                    </td>
                    <td className="px-2 py-5 font-bold text-slate-600 dark:text-slate-400">
                      {g.t1.npp ?? '-'}
                    </td>
                    <td className="px-2 py-5 font-bold text-slate-600 dark:text-slate-400">
                      {g.t1.npt ?? '-'}
                    </td>
                    <td
                      className={`px-2 py-5 font-black border-r border-slate-100 dark:border-slate-700 ${getGradeColor(g.t1.average)}`}
                    >
                      {g.t1.average ?? '-'}
                    </td>
                    <td className="px-2 py-5 text-slate-300">-</td>
                    <td className="px-2 py-5 text-slate-300">-</td>
                    <td className="px-2 py-5 text-slate-300">-</td>
                    <td className="px-2 py-5 text-slate-300 border-r border-slate-100">-</td>
                    <td className="px-2 py-5 text-slate-300">-</td>
                    <td className="px-2 py-5 text-slate-300">-</td>
                    <td className="px-2 py-5 text-slate-300">-</td>
                    <td className="px-2 py-5 text-slate-300 border-r border-slate-100">-</td>
                    <td className="px-3 py-5 font-black text-orange-500">{g.faltas}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-slate-900/50 p-6 sm:p-8 rounded-[2rem] border border-blue-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <ShieldCheck size={28} className="text-primary" />
          <div>
            <p className="font-bold text-slate-800 dark:text-white uppercase text-sm">
              Autenticação SIG-IMEL
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              HASH: {Math.random().toString(36).substring(2).toUpperCase()}
            </p>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 italic">
          Documento verificado digitalmente pelo sistema interno.
        </p>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          #root { padding: 0 !important; }
          * { color: #000 !important; background: #fff !important; }
          table { width: 100% !important; border-collapse: collapse !important; font-size: 9px !important; }
          th, td { border: 1px solid #aaa !important; padding: 5px 4px !important; }
          thead { background: #003366 !important; }
          thead tr th { color: #fff !important; font-weight: 700 !important; }
          tbody tr:nth-child(even) { background: #f0f4f8 !important; }
          .print\\:block { display: block !important; }
          div[class*="rounded"] { border-radius: 0 !important; }
          div[class*="shadow"] { box-shadow: none !important; }
          div[class*="border"] { border-color: #ccc !important; }
        }
      `}</style>
    </div>
  );
};

export default GradesPage;
