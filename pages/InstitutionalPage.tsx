import React from 'react';
import { useSystemAdmin } from '../App';
import {
  BookMarked,
  MapPin,
  Grid,
  Layers,
  Calendar as CalendarIcon,
  Home,
  Users,
  GraduationCap,
  Clock,
} from 'lucide-react';

const InstitutionalPage: React.FC = () => {
  const { settings } = useSystemAdmin();

  const structure = [
    { title: 'Cursos', count: 8, icon: BookMarked, color: 'bg-blue-500' },
    { title: 'Turmas', count: 42, icon: Grid, color: 'bg-emerald-500' },
    { title: 'Salas', count: 30, icon: MapPin, color: 'bg-orange-500' },
    { title: 'Docentes', count: 120, icon: GraduationCap, color: 'bg-purple-500' },
    { title: 'Alunos', count: 2450, icon: Users, color: 'bg-teal-500' },
    { title: 'Aulas/Semana', count: 350, icon: Clock, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-8 animate-fade">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          Estrutura Institucional
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Configurações e visão geral do {settings.schoolName}.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
        {structure.map((s) => (
          <div
            key={s.title}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 hover:shadow-md transition-all"
          >
            <div className={`p-3 ${s.color} text-white rounded-xl shadow-lg`}>
              <s.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {s.title}
              </p>
              <p className="text-xl font-black dark:text-white">{s.count}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
            <Home className="text-primary" /> Organograma & Departamentos
          </h3>
          <div className="space-y-4">
            {[
              { dep: 'Direção Geral', chief: 'Dr. Augusto Feliciano', icon: Home },
              { dep: 'Secretaria Académica', chief: 'Dra. Maria Luz', icon: BookMarked },
              { dep: 'Coordenação de Cursos', chief: 'Msc. Carlos Mendes', icon: Layers },
              { dep: 'Departamento Financeiro', chief: 'Dr. Pedro João', icon: Clock },
              { dep: 'Departamento de TI', chief: 'Eng. Domingos Neto', icon: Grid },
            ].map((d) => (
              <div
                key={d.dep}
                className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl flex items-center justify-between border border-transparent hover:border-primary transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg shadow-md`}>
                    <d.icon size={18} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{d.dep}</h4>
                    <p className="text-sm text-slate-500">Responsável: {d.chief}</p>
                  </div>
                </div>
                <button className="text-primary font-bold text-sm hover:underline">
                  Ver Equipe →
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
            <CalendarIcon className="text-orange-500" /> Ciclo Académico
          </h3>
          <div className="space-y-6">
            <div className="p-6 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-800">
              <p className="text-xs font-black text-orange-600 uppercase mb-2">
                Ano Lectivo Corrente
              </p>
              <p className="text-3xl font-black text-orange-700 dark:text-orange-300">
                2025 / 2026
              </p>
            </div>
            <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800">
              <p className="text-xs font-black text-blue-600 uppercase mb-2">Trimestre Atual</p>
              <p className="text-3xl font-black text-blue-700 dark:text-blue-300">2º Trimestre</p>
            </div>
            <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800">
              <p className="text-xs font-black text-emerald-600 uppercase mb-2">
                Total de Turmas Ativas
              </p>
              <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">42</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionalPage;
