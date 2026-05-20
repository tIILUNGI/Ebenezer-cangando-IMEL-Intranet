import React, { useState, useMemo, useEffect } from 'react';
import { useDatabase, useSettings, useAuth } from '../App';
import { updateGrade as apiUpdateGrade, fetchGrades } from '../src/api/index';
import {
  Save,
  User as UserIcon,
  Check,
  X,
  AlertTriangle,
  ListChecks,
  Filter,
  ChevronDown,
  BookOpen,
} from 'lucide-react';
import { UserRole, Grade, QuarterGrades } from '../types';
import Swal from 'sweetalert2';

const GradingPage: React.FC = () => {
  const { user } = useAuth();
  const { grades, updateGrade, replaceGrades, addAuditLog } = useDatabase();
  const { t } = useSettings();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Grade>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Discipline selector state ─────────────────────────────────────────────
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  useEffect(() => {
    const loadGrades = async () => {
      setIsRefreshing(true);
      try {
        const { data } = await fetchGrades();
        replaceGrades(data);
        addAuditLog(user?.name || 'Sistema', 'SINCRONIZOU_NOTAS', 'Pauta', `${data.length} Registos`);
      } catch (err) {
        console.warn('Using cached grades');
      } finally {
        setIsRefreshing(false);
      }
    };
    loadGrades();
  }, [user, replaceGrades, addAuditLog]);

  if (user?.role !== UserRole.PROFESSOR && user?.role !== UserRole.ADMIN) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <AlertTriangle size={64} className="text-red-500" />
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Acesso Restrito</h2>
        <p className="text-slate-500">Apenas professores e administradores podem lançar notas.</p>
      </div>
    );
  }

   const myGrades = useMemo(() => {
     let filtered =
       user?.role === UserRole.PROFESSOR
         ? grades.filter((g) => g.teacherId === user?.id)
         : grades;
     if (selectedSubject) {
       filtered = filtered.filter((g) => g.subject === selectedSubject);
     }
     // Sort by studentName
     return [...filtered].sort((a, b) => a.studentName.localeCompare(b.studentName, undefined, { sensitivity: 'base' }));
   }, [grades, user, selectedSubject]);

  const teacherSubjects = useMemo(() => {
    if (user?.role !== UserRole.PROFESSOR) return [];
    const subjects = Array.from(
      new Set(
        grades
          .filter((g) => g.teacherId === user?.id)
          .map((g) => g.subject)
      )
    );
    return subjects;
  }, [grades, user]);

  // Auto-select when only one subject taught
  useEffect(() => {
    if (user?.role === UserRole.PROFESSOR && teacherSubjects.length === 1 && !selectedSubject) {
      setSelectedSubject(teacherSubjects[0]);
    }
  }, [teacherSubjects, user, selectedSubject]);

  const startEditing = (g: Grade) => {
    setEditingId(g.id);
    setFormData({ ...g });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setFormData({});
  };

  const handleSave = async () => {
    if (!editingId) return;
    setIsLoading(true);

    try {
      const g = myGrades.find((x) => x.id === editingId);
      if (!g) return;

      const finalUpdate: Partial<Grade> = { ...formData };
      if (formData.t1 || g.t1) {
        const t1 = { ...g.t1, ...formData.t1 };
        const vals = [t1.mac, t1.npp, t1.npt].filter(
          (v) => v !== null && v !== undefined
        ) as number[];
        t1.average =
          vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
        finalUpdate.t1 = t1;
      }

      try {
        await apiUpdateGrade(editingId, finalUpdate);
      } catch (apiErr) {
        console.warn('API update failed, using local update', apiErr);
      }

      updateGrade(editingId, finalUpdate, user?.name || 'Sistema');
      setEditingId(null);
      setFormData({});

      Swal.fire({
        icon: 'success',
        title: 'Nota guardada',
        text: 'A nota foi atualizada com sucesso.',
        timer: 1500,
        showConfirmButton: false,
        background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Erro ao guardar nota.',
        timer: 1500,
        showConfirmButton: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof QuarterGrades | 'faltas', value: number) => {
    if (field === 'faltas') {
      setFormData((prev) => ({ ...prev, faltas: value }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      t1: {
        ...(prev.t1 ||
          (editingId
            ? myGrades.find((g) => g.id === editingId)?.t1
            : { mac: null, npp: null, npt: null, average: null })),
        [field]: value,
      },
    }));
  };

  const refreshGrades = async () => {
    setIsRefreshing(true);
    try {
      const { data } = await fetchGrades();
      replaceGrades(data);
      addAuditLog(user?.name || 'Sistema', 'SINCRONIZOU_NOTAS', 'Pauta', `${data.length} Registos`);
    } catch (err) {
      console.warn('Refresh failed, using cached data');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <ListChecks className="text-primary dark:text-secondary" />
            Lançamento de Notas
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {user?.role === UserRole.PROFESSOR ? `Docente: ${user.name}` : 'Visão Geral de Pautas'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* ── Subject selector (mandatory when teacher teaches >1) ── */}
          {user?.role === UserRole.PROFESSOR && teacherSubjects.length > 1 && (
            <div className="relative">
              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1.5 pl-3 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <BookOpen size={16} className="text-primary shrink-0" />
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setEditingId(null);
                    setFormData({});
                  }}
                  className="bg-transparent border-none outline-none font-bold text-sm text-slate-700 dark:text-white pr-2 py-1"
                >
                  <option value="">-- Selecione a Disciplina --</option>
                  {teacherSubjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="text-slate-400 shrink-0" />
              </div>
            </div>
          )}

          {!selectedSubject && user?.role === UserRole.PROFESSOR && teacherSubjects.length > 1 && (
            <span className="text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-xl">
              Selecione uma disciplina acima para continuar.
            </span>
          )}

          <button
            onClick={refreshGrades}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            <Save size={16} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Atualizando...' : 'Sincronizar'}
          </button>
        </div>
      </div>

      {/* Subject chip banner when selected */}
      {selectedSubject && user?.role === UserRole.PROFESSOR && (
        <div className="flex items-center gap-2 px-5 py-3 bg-primary/5 border border-primary/20 rounded-2xl">
          <BookOpen size={16} className="text-primary" />
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
            Disciplina selecionada:
          </span>
          <span className="text-sm font-black text-primary">{selectedSubject}</span>
          <span className="text-[10px] text-slate-400 ml-2">
            ({myGrades.length} aluno{myGrades.length !== 1 ? 's' : ''})
          </span>
        </div>
      )}

      <div className={`bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors ${!selectedSubject && user?.role === UserRole.PROFESSOR && teacherSubjects.length > 1 ? 'opacity-30 pointer-events-none' : ''}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">
                  Estudante
                </th>
                <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">
                  MAC
                </th>
                <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">
                  NPP
                </th>
                <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">
                  NPT
                </th>
                <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">
                  Faltas
                </th>
                <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">
                  Média
                </th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {myGrades.map((g) => {
                const isEditing = editingId === g.id;
                return (
                  <tr
                    key={g.id}
                    className={`transition-colors ${isEditing ? 'bg-blue-50/30 dark:bg-blue-900/10' : 'hover:bg-slate-50/50 dark:hover:bg-slate-700/30'}`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 text-primary dark:text-secondary rounded-full flex items-center justify-center font-bold">
                          {g.studentName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100">
                            {g.studentName}
                          </p>
                          <p className="text-[10px] font-black uppercase text-primary dark:text-secondary">
                            {g.subject}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-6 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          max="20"
                          min="0"
                          value={formData.t1?.mac ?? g.t1.mac ?? ''}
                          onChange={(e) => handleInputChange('mac', Number(e.target.value))}
                          className="w-16 p-2 rounded-xl bg-white dark:bg-slate-900 border-2 border-blue-200 text-center font-bold outline-none"
                        />
                      ) : (
                        <span className="font-bold text-slate-600 dark:text-slate-400">
                          {g.t1.mac ?? '-'}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-6 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          max="20"
                          min="0"
                          value={formData.t1?.npp ?? g.t1.npp ?? ''}
                          onChange={(e) => handleInputChange('npp', Number(e.target.value))}
                          className="w-16 p-2 rounded-xl bg-white dark:bg-slate-900 border-2 border-blue-200 text-center font-bold outline-none"
                        />
                      ) : (
                        <span className="font-bold text-slate-600 dark:text-slate-400">
                          {g.t1.npp ?? '-'}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-6 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          max="20"
                          min="0"
                          value={formData.t1?.npt ?? g.t1.npt ?? ''}
                          onChange={(e) => handleInputChange('npt', Number(e.target.value))}
                          className="w-16 p-2 rounded-xl bg-white dark:bg-slate-900 border-2 border-blue-200 text-center font-bold outline-none"
                        />
                      ) : (
                        <span className="font-bold text-slate-600 dark:text-slate-400">
                          {g.t1.npt ?? '-'}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-6 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          value={formData.faltas ?? g.faltas}
                          onChange={(e) => handleInputChange('faltas', Number(e.target.value))}
                          className="w-16 p-2 rounded-xl bg-white dark:bg-slate-900 border-2 border-orange-200 text-center font-bold outline-none text-orange-600"
                        />
                      ) : (
                        <span
                          className={`font-black ${g.faltas > 3 ? 'text-red-500' : 'text-slate-400'}`}
                        >
                          {g.faltas}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-6 text-center">
                      <span
                        className={`text-xl font-black ${(g.t1.average ?? 0) >= 10 ? 'text-primary dark:text-secondary' : 'text-red-500'}`}
                      >
                        {g.t1.average ?? '-'}
                      </span>
                    </td>

                    <td className="px-8 py-6 text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={handleSave}
                            className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                            disabled={isLoading}
                          >
                            <Check size={20} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-2.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(g)}
                          className="px-5 py-2.5 bg-primary dark:bg-slate-700 text-white dark:text-secondary rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all shadow-md"
                        >
                          {isLoading ? 'Guardando...' : 'Lançar'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {myGrades.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-8 py-12 text-center text-slate-400 italic font-bold"
                  >
                    {!selectedSubject && user?.role === UserRole.PROFESSOR && teacherSubjects.length > 1
                      ? 'Selecione uma disciplina para ver a pauta.'
                      : 'Nenhum registro encontrado para este filtro.'}
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

export default GradingPage;
