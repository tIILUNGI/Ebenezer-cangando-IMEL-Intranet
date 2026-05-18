import React from 'react';
import { useDatabase, useAuth } from '../App';
import { UserRole } from '../types';
import { Layers, User, AlertTriangle, CheckCircle2, XCircle, Download } from 'lucide-react';
import { fetchGrades } from '../src/api/index';

const ClassCoordinatorPage: React.FC = () => {
  const { user } = useAuth();
  const { users, grades } = useDatabase();

  if (user?.coordinatorType !== 'turma') {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <AlertTriangle size={64} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-black">Acesso Negado</h2>
        <p>Você não tem permissão de Coordenador de Turma.</p>
      </div>
    );
  }

  const className = user.coordinatedEntity || '';
  const students = users.filter((u) => u.role === UserRole.ALUNO && u.turma === className);

  const getStudentAverage = (studentId: string) => {
    const studentGrades = grades.filter((g) => g.studentId === studentId);
    if (studentGrades.length === 0) return '0.0';
    return (
      studentGrades.reduce((acc, g) => acc + (g.t1.average || 0), 0) / studentGrades.length
    ).toFixed(1);
  };

  return (
    <div className="space-y-8 animate-fade">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 p-8 rounded-3xl text-white shadow-xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-white/10 rounded-2xl">
            <Layers size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black">Coordenação de Turma</h1>
            <p className="opacity-80">
              Turma: <span className="font-bold underline">{className}</span>
            </p>
          </div>
        </div>
        <div className="mt-6">
          <p className="text-sm opacity-90">
            Total de Alunos Matriculados:{' '}
            <span className="font-black text-xl ml-2">{students.length}</span>
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Lista de Estudantes</h3>
          <button className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-primary transition-colors">
            <Download size={14} /> Exportar
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase">Nome</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase text-center">
                  Processo
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase text-center">
                  Situação
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase text-center">
                  Média Geral
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {students.map((student) => {
                const avg = getStudentAverage(student.id);
                return (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-8 py-4 font-bold text-slate-700 dark:text-slate-200">
                      {student.name}
                    </td>
                    <td className="px-8 py-4 text-center text-sm font-mono text-slate-500">
                      {student.processNumber}
                    </td>
                    <td className="px-8 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold ${student.isActive ? 'text-emerald-600' : 'text-red-600'}`}
                      >
                        {student.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}{' '}
                        {student.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-center font-black text-slate-800 dark:text-white">
                      {avg}
                    </td>
                  </tr>
                );
              })}
              {students.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-slate-400 italic">
                    Nenhum estudante nesta turma.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClassCoordinatorPage;
