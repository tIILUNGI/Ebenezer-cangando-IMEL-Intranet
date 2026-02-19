
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { useDatabase, useSystemAdmin, useSettings } from '../App';
import { Download, Filter, TrendingUp, AlertCircle, Award } from 'lucide-react';

const AcademicStatsPage: React.FC = () => {
  const { settings } = useSystemAdmin();
  const { theme } = useSettings();

  const approvalData = [
    { name: '10ª Classe', aprovados: 85, reprovados: 15 },
    { name: '11ª Classe', aprovados: 78, reprovados: 22 },
    { name: '12ª Classe', aprovados: 92, reprovados: 8 },
    { name: '13ª Classe', aprovados: 88, reprovados: 12 },
  ];

  const COLORS = ['#10b981', '#ef4444', '#6366f1', '#f59e0b'];

  const handleExport = () => {
    const header = ['classe', 'aprovados', 'reprovados'];
    const rows = approvalData.map(r => [r.name, r.aprovados.toString(), r.reprovados.toString()]);
    const csv = [header.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'estatisticas_academicas.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Estatísticas Académicas</h1>
          <p className="text-slate-500 dark:text-slate-400">Análise de desempenho por nível e curso.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300">
            <Filter size={18} /> Filtros
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/10">
            <Download size={18} /> Exportar Excel
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-2"><TrendingUp className="text-emerald-500" /> Aprovação vs Reprovação</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={approvalData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px' }} />
                <Legend iconType="circle" />
                <Bar dataKey="aprovados" fill="#10b981" radius={[10, 10, 0, 0]} />
                <Bar dataKey="reprovados" fill="#ef4444" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-2"><Award className="text-primary" /> Melhores Cursos (Ranking)</h3>
          <div className="space-y-6">
            {[
              { curso: 'Contabilidade', perc: 94, students: 450 },
              { curso: 'Gestão Empresarial', perc: 88, students: 620 },
              { curso: 'Economia Política', perc: 82, students: 510 },
              { curso: 'Informática de Gestão', perc: 75, students: 380 },
            ].map((c, i) => (
              <div key={c.curso} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-black">#{i+1}</div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800 dark:text-white">{c.curso}</p>
                  <p className="text-xs text-slate-400">{c.students} alunos avaliados</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-primary">{c.perc}%</p>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase">Meta Atingida</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/20 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl text-primary shadow-xl">
            <AlertCircle size={40} />
          </div>
          <div>
            <h4 className="text-xl font-bold text-primary">Atenção Estratégica</h4>
            <p className="text-slate-600 dark:text-slate-400">Há um declínio de 4% no aproveitamento de Matemática na 11ª Classe comparado ao ano anterior.</p>
          </div>
        </div>
        <button className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:scale-105 transition-all">Ver Detalhes</button>
      </div>
    </div>
  );
};

export default AcademicStatsPage;

