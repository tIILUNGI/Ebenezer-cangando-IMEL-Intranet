
import React from 'react';
import { useDatabase, useSystemAdmin } from '../App';
import { Briefcase, Clipboard, CheckCircle, Clock, Mail, MessageSquare } from 'lucide-react';

const TeacherMonitoringPage: React.FC = () => {
  const { users, grades } = useDatabase();
  const teachers = users.filter(u => u.role === 'Professor');

  return (
    <div className="space-y-8 animate-fade">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Monitorização Docente</h1>
        <p className="text-slate-500 dark:text-slate-400">Acompanhamento do cumprimento do plano letivo e lançamentos.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map(t => (
          <div key={t.id} className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black text-2xl group-hover:bg-primary group-hover:text-white transition-colors">
                {t.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1">{t.name}</h3>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-black">Docente Efetivo</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2"><Clipboard size={16}/> Lançamento de Notas</span>
                <span className="font-bold text-emerald-500 flex items-center gap-1">100% <CheckCircle size={14}/></span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2"><Clock size={16}/> Pontualidade</span>
                <span className="font-bold text-blue-500">95%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-full"></div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-3 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2">
                <Mail size={14} /> E-mail
              </button>
              <button className="flex-1 py-3 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2">
                <MessageSquare size={14} /> Mensagem
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherMonitoringPage;
