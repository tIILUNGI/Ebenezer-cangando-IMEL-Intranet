
import React from 'react';
import { useAuth, useDatabase, useSettings } from '../App';
import { Clock, Calendar, AlertTriangle, CheckCircle, FileText, UserCheck } from 'lucide-react';

const AttendancePage: React.FC = () => {
  const { activeStudent } = useAuth();
  const { grades } = useDatabase();
  const { t } = useSettings();

  const studentGrades = grades.filter(g => g.studentId === activeStudent?.id);
  const totalFaltas = studentGrades.reduce((acc, g) => acc + g.faltas, 0);
  
  // Média de presença baseada em 30 aulas teóricas/práticas por trimestre
  const aulasTotais = studentGrades.length * 30;
  const percPresenca = aulasTotais > 0 ? Math.round(((aulasTotais - totalFaltas) / aulasTotais) * 100) : 100;

  const handleJustifyClick = () => {
    const justificacoes = JSON.parse(localStorage.getItem('imel_db_justificacoes') || '[]');
    justificacoes.unshift({
      id: Date.now().toString(),
      studentId: activeStudent?.id,
      studentName: activeStudent?.name,
      createdAt: new Date().toLocaleString()
    });
    localStorage.setItem('imel_db_justificacoes', JSON.stringify(justificacoes.slice(0, 100)));
    window.open('https://wa.me/244938229459', '_blank');
  };

  return (
    <div className="space-y-8 animate-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Relatório de Assiduidade</h1>
          <p className="text-slate-500 dark:text-slate-400">Monitoramento de faltas para {activeStudent?.name}.</p>
        </div>
        <button 
          onClick={handleJustifyClick}
          className="px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-all"
        >
          <FileText size={18}/> Justificar Falta
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4">
            <UserCheck size={24} />
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Taxa de Presença</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">{percPresenca}%</h3>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-4">
            <AlertTriangle size={24} />
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Faltas no Trimestre</p>
          <h3 className="text-3xl font-black text-orange-500">{totalFaltas}</h3>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
            <Clock size={24} />
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Aulas Assistidas</p>
          <h3 className="text-3xl font-black text-blue-500">{aulasTotais - totalFaltas}</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-xl font-bold">Mapa de Faltas por Disciplina</h3>
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Limite de Faltas: 25%</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Disciplina</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Tempos Letivos</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Presenças</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Faltas</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Aproveitamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {studentGrades.map(g => {
                const perc = Math.round(((30 - g.faltas) / 30) * 100);
                return (
                  <tr key={g.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-bold text-slate-800 dark:text-white uppercase text-xs">{g.subject}</p>
                    </td>
                    <td className="px-8 py-6 text-center text-slate-500">30</td>
                    <td className="px-8 py-6 text-center font-bold text-emerald-500">{30 - g.faltas}</td>
                    <td className="px-8 py-6 text-center font-black text-orange-500">{g.faltas}</td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-black ${perc < 75 ? 'text-red-500' : 'text-emerald-500'}`}>{perc}%</span>
                        <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                          <div className={`h-full ${perc < 75 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${perc}%` }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;

