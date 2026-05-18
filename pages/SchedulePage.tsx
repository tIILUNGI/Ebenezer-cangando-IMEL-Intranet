import React, { useState, useEffect } from 'react';
import { useAuth, useDatabase } from '../App';
import { fetchSchedule } from '../src/api/index';
import { Calendar, Clock, MapPin, Plus, Edit, Trash, X } from 'lucide-react';
import { UserRole } from '../types';
import Swal from 'sweetalert2';

const SchedulePage: React.FC = () => {
  const { schedules, replaceSchedules, addSchedule, deleteSchedule } = useDatabase();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    day: 'Segunda',
    time: '07:30 - 09:00',
    subject: '',
    room: '',
    turma: '',
    teacherId: user?.id || ''
  });
  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const times = ['07:30 - 09:00', '09:15 - 10:45', '11:00 - 12:30', '12:45 - 14:15'];

  const isProfessor = user?.role === UserRole.PROFESSOR;
  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.DIRETOR;

  const displaySchedules = isProfessor
    ? schedules.filter((s) => s.teacherId === user?.id)
    : schedules;

  // Load from API on mount
  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    setIsRefreshing(true);
    try {
      const { data } = await fetchSchedule();
      replaceSchedules(data);
    } catch (err) {
      console.warn('Using cached schedule');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Reorder: new entry goes to front of display array so it appears at top
      await addSchedule(formData, user?.name || 'Sistema');
      Swal.fire({
        icon: 'success',
        title: 'Sucesso',
        text: 'Horário adicionado com sucesso.',
        timer: 1501,
        showConfirmButton: false,
      });
      setIsModalOpen(false);
      setFormData({
        day: 'Segunda',
        time: '07:30 - 09:00',
        subject: '',
        room: '',
        turma: '',
        teacherId: user?.id || ''
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Erro', text: 'Erro ao criar horário.' });
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: 'Esta ação não pode ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sim, remover!',
      cancelButtonText: 'Cancelar',
    });
    if (result.isConfirmed) {
      await deleteSchedule(id, user?.name || 'Sistema');
      Swal.fire({
        icon: 'success',
        title: 'Removido!',
        text: 'Horário removido com sucesso.',
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            {isProfessor ? 'Meu Horário de Aulas' : 'Horário Escolar'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {isProfessor
              ? `Sessões atribuídas ao docente ${user?.name}`
              : 'Turma 12ª B | Informática de Gestão'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadSchedule}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            <Clock size={16} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Atualizando...' : 'Sincronizar'}
          </button>
          {isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold hover:scale-105 transition-all shadow-lg"
            >
              <Plus size={18} /> Novo Horário
            </button>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-md animate-fade mb-8 max-w-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 mb-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <Calendar className="text-primary" /> Novo Horário Escolar
            </h3>
            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
              <X size={18} className="text-slate-500" />
            </button>
          </div>
          <form onSubmit={handleAddSchedule} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-1">Dia da Semana</label>
                <select
                  value={formData.day}
                  onChange={e => setFormData({...formData, day: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary text-sm dark:text-white"
                >
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-1">Horário</label>
                <select
                  value={formData.time}
                  onChange={e => setFormData({...formData, time: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary text-sm dark:text-white"
                >
                  {times.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-1">Disciplina</label>
              <input
                type="text" required
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary text-sm dark:text-white"
                placeholder="Ex: Matemática"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-1">Sala</label>
                <input
                  type="text" required
                  value={formData.room}
                  onChange={e => setFormData({...formData, room: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary text-sm dark:text-white"
                  placeholder="Ex: Sala 24"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-1">Turma</label>
                <input
                  type="text" required
                  value={formData.turma}
                  onChange={e => setFormData({...formData, turma: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary text-sm dark:text-white"
                  placeholder="Ex: I12B"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-1">ID do Professor</label>
              <input
                type="text" required
                value={formData.teacherId}
                onChange={e => setFormData({...formData, teacherId: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary text-sm dark:text-white"
              />
            </div>
            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:scale-[1.02] transition-all text-sm"
              >
                Salvar Horário
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
        {days.map((day) => (
          <div key={day} className="space-y-3">
            <h3 className="px-4 py-2 bg-[#003366] text-white text-center font-bold rounded-xl shadow-md uppercase text-[10px] tracking-widest">
              {day}
            </h3>
            <div className="space-y-3 min-h-0">
              {displaySchedules
                .filter((s) => s.day === day)
                .map((item) => (
                  <div
                    key={item.id}
                    className="group relative p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:border-primary transition-all border-l-4 border-l-primary max-w-full overflow-hidden"
                  >
                    <p className="font-bold text-[#003366] dark:text-[#FFD700] text-sm mb-1">
                      {item.subject}
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold">
                        <Clock size={10} /> {item.time}
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold">
                        <MapPin size={10} /> {item.room}
                      </div>
                      {!isProfessor && (
                        <div className="text-[8px] text-primary dark:text-secondary font-black uppercase mt-1">
                          Turma: {item.turma}
                        </div>
                      )}
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remover horário"
                      >
                        <Trash size={12} />
                      </button>
                    )}
                  </div>
                ))}
              {displaySchedules.filter((s) => s.day === day).length === 0 && (
                <div className="p-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl text-center text-[9px] text-slate-300 font-bold uppercase tracking-widest">
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
