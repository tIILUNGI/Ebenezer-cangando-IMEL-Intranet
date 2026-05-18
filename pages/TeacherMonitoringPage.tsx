import React from 'react';
import { useDatabase } from '../App';
import { Briefcase, Clipboard, CheckCircle, Clock, Mail, MessageSquare } from 'lucide-react';

const TeacherMonitoringPage: React.FC = () => {
  const { users, grades } = useDatabase();

  const teachers = users.filter((u) => u.role === 'Professor');

  const getTeacherStats = (teacherId: string) => {
    const teacherGrades = grades.filter((g) => g.teacherId === teacherId);
    const subjects = [...new Set(teacherGrades.map((g) => g.subject))];
    const totalEntries = teacherGrades.length;
    const hasEntries = totalEntries > 0 ? 100 : 0;
    return { subjects, totalEntries, hasEntries };
  };

  return (
    <div className="space-y-8 animate-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Monitorização Docente
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Acompanhamento do cumprimento do plano letivo e lançamentos.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((t) => {
          const stats = getTeacherStats(t.id);
          return (
            <div
              key={t.id}
              className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black text-2xl group-hover:bg-primary group-hover:text-white transition-colors">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1">
                    {t.name}
                  </h3>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-black">
                    Docente Efetivo
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Clipboard size={16} /> Disciplinas
                  </span>
                  <span className="font-bold text-emerald-500">{stats.subjects.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Clock size={16} /> Lançamentos
                  </span>
                  <span className="font-bold text-blue-500">{stats.totalEntries}</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 w-full"
                    style={{ width: `${stats.hasEntries}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href={`mailto:${t.email}`}
                  className="flex-1 py-3 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Mail size={14} /> E-mail
                </a>
                <button
                  className="flex-1 py-3 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
                  onClick={() => {
                    const { sendMessage } = require('../src/api/index');
                    // Navigate to messages with this teacher
                  }}
                >
                  <MessageSquare size={14} /> Mensagem
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeacherMonitoringPage;
