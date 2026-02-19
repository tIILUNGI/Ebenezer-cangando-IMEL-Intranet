
import React from 'react';
import { useDatabase, useAuth } from '../App';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { UserRole } from '../types';

const SchedulePage: React.FC = () => {
  const { schedules } = useDatabase();
  const { user } = useAuth();
  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

  // Se for professor, filtrar apenas as aulas dele
  const displaySchedules = user?.role === UserRole.PROFESSOR 
    ? schedules.filter(s => s.teacherId === user.id)
    : schedules;

  return (
    <div className="space-y-8 animate-fade">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          {user?.role === UserRole.PROFESSOR ? 'Meu Horário de Aulas' : 'Horário Escolar'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          {user?.role === UserRole.PROFESSOR ? `Sessões atribuídas ao docente ${user.name}` : 'Turma 12ª B | Informática de Gestão'}
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {days.map((day) => (
          <div key={day} className="space-y-4">
            <h3 className="px-4 py-2 bg-[#003366] text-white text-center font-bold rounded-xl shadow-md uppercase text-xs tracking-widest">{day}</h3>
            <div className="space-y-3">
              {displaySchedules.filter(s => s.day === day).map(item => (
                <div key={item.id} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:scale-[1.02] transition-all border-l-4 border-l-primary">
                  <p className="font-bold text-[#003366] dark:text-[#FFD700] text-sm mb-2">{item.subject}</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                      <Clock size={12} /> {item.time}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                      <MapPin size={12} /> {item.room}
                    </div>
                    {user?.role !== UserRole.PROFESSOR && (
                      <div className="text-[9px] text-primary dark:text-secondary font-black uppercase mt-1">Turma: {item.turma}</div>
                    )}
                  </div>
                </div>
              ))}
              {displaySchedules.filter(s => s.day === day).length === 0 && (
                <div className="p-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl text-center text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                  Sem Atividades
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchedulePage;
