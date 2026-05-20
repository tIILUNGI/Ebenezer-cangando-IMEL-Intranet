import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Filter,
  Download,
  X,
  ShieldCheck,
  UserPlus,
  GraduationCap,
  Users,
  Zap,
  HelpCircle,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useDatabase, useAuth } from '../App';
import { UserRole, User } from '../types';
import { fetchUsers, createUser, updateUser, deleteUser, exportUsersCSV } from '../src/api/index';
import { KNOWN_TURMAS } from '../constants';
import Swal from 'sweetalert2';

interface Props {
  mode?: 'full' | 'alunos';
}

const UserManagementPage: React.FC<Props> = ({ mode = 'full' }) => {
  const {
    users: localUsers,
    addUser: localAddUser,
    updateUser: localUpdateUser,
    deleteUser: localDeleteUser,
    replaceUsers,
    addAuditLog,
  } = useDatabase();
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.ALUNO);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    processNumber: '',
    bi: '',
    role: UserRole.ALUNO,
    turma: '',
    password: '123456',
    isActive: true,
    coordinatorType: null,
    coordinatedEntity: '',
  });
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const getUserCourse = (u: User): string => {
    const source = (u.turma || u.coordinatedEntity || '').toLowerCase();
    if (source.includes('inf') || source.includes('gestão') || source.includes('gestao') || source.includes('informática') || source.includes('informatica')) {
      return 'Informática de Gestão';
    }
    if (source.includes('cont') || source.includes('contabilidade')) {
      return 'Contabilidade e Gestão';
    }
    if (source.includes('econ') || source.includes('economia')) {
      return 'Economia e Gestão';
    }
    if (source.includes('fin') || source.includes('finanças') || source.includes('financas')) {
      return 'Finanças';
    }
    return 'Tronco Comum / Geral';
  };

  const getUserClass = (u: User): string => {
    if (u.role === UserRole.ALUNO) {
      return u.turma ? u.turma.split(' ')[0] : 'Sem Turma';
    }
    return u.turma || u.coordinatedEntity || 'Sala Geral / Gabinete';
  };

  const canEdit = currentUser?.role === UserRole.ADMIN;
  const isDiretor = currentUser?.role === UserRole.DIRETOR;

   useEffect(() => {
     loadUsers();
   }, []);

const toggleUserStatus = async (id: string, newStatus: boolean) => {
      try {
         await updateUser(id, { isActive: newStatus });
        // Update locally
        replaceUsers(localUsers.map(u => 
          u.id === id ? { ...u, isActive: newStatus } : u
        ));
        
        Swal.fire({
          icon: 'success',
          title: newStatus ? 'Ativado!' : 'Desativado!',
          text: newStatus ? 'Usuário ativado com sucesso.' : 'Usuário desativado com sucesso.',
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        console.warn('Failed to update user status', err);
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível atualizar o status do usuário.',
          timer: 2000,
        });
      }
    };

const activateAllUsers = async () => {
      try {
        // Update all users to active
        const updatedUsers = localUsers.map(u => ({ ...u, isActive: true }));
        
        // Update each user via API (in practice, you might want a batch endpoint)
        for (const u of updatedUsers) {
          await updateUser(u.id, { isActive: true });
        }
        
        replaceUsers(updatedUsers);
        
        Swal.fire({
          icon: 'success',
          title: 'Todos ativados!',
          text: 'Todos os usuários foram ativados com sucesso.',
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        console.warn('Failed to activate all users', err);
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível ativar todos os usuários.',
          timer: 2000,
        });
      }
    };

   const loadUsers = async () => {
    setIsRefreshing(true);
    try {
      const { data } = await fetchUsers();
      replaceUsers(data);
      addAuditLog(currentUser?.name || 'Sistema', 'SINCRONIZOU_USUARIOS', 'Contas', `${data.length} Registos`);
    } catch (err) {
      console.warn('Using cached users');
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredUsers = localUsers.filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.processNumber || '').includes(searchTerm);
    if (mode === 'alunos') return matchesSearch && u.role === UserRole.ALUNO;
    return matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setSelectedStudentIds([]);
    setFormData({
      name: '',
      processNumber: '',
      bi: '',
      role: UserRole.ALUNO,
      turma: '',
      password: '123456',
      isActive: true,
      coordinatorType: null,
      coordinatedEntity: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ ...user });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingUser) {
        try {
          await updateUser(editingUser.id, formData);
        } catch (apiErr) {
          console.warn('API update failed');
        }
        localUpdateUser(editingUser.id, formData, currentUser?.name || 'Sistema');
        Swal.fire({
          icon: 'success',
          title: 'Atualizado!',
          text: 'Dados do utilizador atualizados.',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        // Encarregado guard validation: must have at least one student
        if (formData.role === UserRole.ENCARREGADO && selectedStudentIds.length === 0) {
          Swal.fire({
            icon: 'error',
            title: 'Vínculo obrigatório',
            text: 'Selecione pelo menos um aluno para associar a este encarregado antes de salvar.',
            timer: 4000,
            showConfirmButton: true,
          });
          setIsLoading(false);
          return;
        }

        try {
          await createUser({
            ...formData,
            studentIds: formData.role === UserRole.ENCARREGADO ? selectedStudentIds : undefined,
          });
        } catch (apiErr) {
          console.warn('API create failed');
        }
        localAddUser(
          {
            ...formData,
            studentIds: formData.role === UserRole.ENCARREGADO ? selectedStudentIds : undefined,
          } as Omit<User, 'id'>,
          currentUser?.name || 'Sistema'
        );
        Swal.fire({
          icon: 'success',
          title: 'Sucesso!',
          text: 'Novo utilizador criado com sucesso.',
          timer: 2000,
          showConfirmButton: false,
        });
      }
      setIsModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Esta ação não pode ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sim, remover!',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteUser(id);
        } catch (e) {
          console.warn('API delete failed');
        }
        localDeleteUser(id, currentUser?.name || 'Sistema');
        Swal.fire({
          title: 'Removido!',
          text: 'Utilizador removido.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleExportUsers = async () => {
    try {
      await exportUsersCSV();
    } catch (apiErr) {
      // Fallback to local CSV
      const header = ['id', 'nome', 'processo', 'perfil', 'turma', 'email', 'ativo'];
      const rows = filteredUsers.map((u) => [
        u.id,
        `"${u.name.replace(/"/g, '""')}"`,
        u.processNumber,
        u.role,
        u.turma || '',
        u.email || '',
        u.isActive === false ? 'nao' : 'sim',
      ]);
      const csv = [header.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'utilizadores_imel.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  };

  const getSubGroupsByClass = (usersInCourse: User[]) => {
    const classGroups: { [className: string]: User[] } = {};
    usersInCourse.forEach((u) => {
      const cls = getUserClass(u);
      if (!classGroups[cls]) {
        classGroups[cls] = [];
      }
      classGroups[cls].push(u);
    });
    return classGroups;
  };

   const activeRoleUsers = filteredUsers
     .filter((u) => u.role === activeRole)
     .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

  const courseGroups: { [courseName: string]: User[] } = {};
  activeRoleUsers.forEach((u) => {
    const course = getUserCourse(u);
    if (!courseGroups[course]) {
      courseGroups[course] = [];
    }
    courseGroups[course].push(u);
  });

  return (
    <div className="space-y-8 animate-fade">
      {/* Page Title & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Users className="text-primary" />
            {mode === 'alunos' ? 'Diretório de Estudantes' : 'Gestão de Contas de Acesso'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {isDiretor
              ? 'Visualização estratégica de acessos, cursos e turmas.'
              : 'Administre e organize as credenciais e acessos da instituição.'}
          </p>
        </div>
         <div className="flex items-center gap-2">
           <button
             className="flex items-center gap-2 px-4 py-2 text-slate-500 font-bold text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 transition-all"
             onClick={loadUsers}
             disabled={isRefreshing}
           >
             <Filter size={18} className={isRefreshing ? 'animate-spin' : ''} />
             {isRefreshing ? 'Sincronizando...' : 'Sincronizar'}
           </button>
           <button
             onClick={handleExportUsers}
             className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm border border-slate-100 dark:border-slate-700"
           >
             <Download size={18} /> Exportar
           </button>
           {canEdit && (
             <>
               <button
                 onClick={activateAllUsers}
                 className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm border border-slate-100 dark:border-slate-700"
               >
                 <Zap size={18} /> Ativar Todos
               </button>
               <button
                 className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 hover:scale-105 transition-all"
                 onClick={handleOpenAdd}
               >
                 <UserPlus size={18} /> Novo Utilizador
               </button>
             </>
           )}
         </div>
      </div>

      {isDiretor && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
          <ShieldCheck size={20} />
          <span className="text-sm font-bold">
            Modo Auditoria: Visualização completa de todas as turmas habilitada para a Direção.
          </span>
        </div>
      )}

      {/* Inline Form / Page Card instead of fixed dark backdrop modal */}
      {isModalOpen && canEdit && (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-md animate-fade mb-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {editingUser ? '✏️ Atualizar Perfil de Acesso' : '👤 Cadastrar Novo Utilizador'}
            </h3>
            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
              <X size={20} className="text-slate-500" />
            </button>
          </div>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-primary dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">
                  Nº Processo
                </label>
                <input
                  type="text"
                  required
                  value={formData.processNumber || ''}
                  onChange={(e) => setFormData({ ...formData, processNumber: e.target.value })}
                  className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-primary dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">
                  Nº do BI
                </label>
                <input
                  type="text"
                  required
                  value={formData.bi || ''}
                  onChange={(e) => setFormData({ ...formData, bi: e.target.value })}
                  className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-primary dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">
                  Perfil de Acesso
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-primary dark:text-white text-sm"
                >
                  {Object.values(UserRole).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">
                  Turma
                </label>
                <select
                  value={formData.turma || ''}
                  onChange={(e) => setFormData({ ...formData, turma: e.target.value })}
                  className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-primary dark:text-white text-sm"
                >
                  <option value="">Seleccionar Turma…</option>
                  {KNOWN_TURMAS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── Professor coordinator block ── */}
            {formData.role === UserRole.PROFESSOR && (
              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-700 space-y-4">
                <h4 className="text-xs font-bold text-primary uppercase">
                  Funções de Coordenação
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                      Tipo
                    </label>
                    <select
                      value={formData.coordinatorType || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          coordinatorType: (e.target.value as any) || null,
                        })
                      }
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary dark:text-white text-sm"
                    >
                      <option value="">Nenhuma</option>
                      <option value="curso">Coordenador de Curso</option>
                      <option value="turma">Coordenador de Turma</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                      {formData.coordinatorType === 'curso'
                        ? 'Nome do Curso'
                        : formData.coordinatorType === 'turma'
                          ? 'Turma'
                          : 'Entidade'}
                    </label>
                    <input
                      type="text"
                      disabled={!formData.coordinatorType}
                      value={formData.coordinatedEntity || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, coordinatedEntity: e.target.value })
                      }
                      placeholder={
                        formData.coordinatorType === 'curso' ? 'Ex: Informática' : 'Ex: 12 B'
                      }
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary dark:text-white text-sm disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Encarregado: mandatory student selection ── */}
            {formData.role === UserRole.ENCARREGADO && (
              <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border-2 border-amber-300 dark:border-amber-700 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={18} className="text-amber-600" />
                  <h4 className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">
                    Vínculo com Aluno(s) — Obrigatório
                  </h4>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-bold">
                  Selecione pelo menos um aluno para associar a este encarregado. Esta associação é obrigatória para criar a conta.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {localUsers
                    .filter((u) => u.role === UserRole.ALUNO)
                    .map((student) => {
                      const checked = selectedStudentIds.includes(student.id);
                      return (
                        <label
                          key={student.id}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border-2 ${
                            checked
                              ? 'bg-primary/10 border-primary'
                              : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-primary/30'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              setSelectedStudentIds((prev) =>
                                e.target.checked
                                  ? [...prev, student.id]
                                  : prev.filter((id) => id !== student.id)
                              );
                            }}
                            className="w-4 h-4 accent-primary"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                              {student.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {student.processNumber}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                </div>
                {selectedStudentIds.length === 0 && (
                  <p className="text-[10px] font-black text-red-500">
                    ⚠ Selecione pelo menos um aluno antes de salvar.
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-2">
                Senha Inicial
              </label>
              <input
                type="text"
                required
                value={formData.password || ''}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-primary dark:text-white text-sm"
              />
            </div>

            <div className="pt-4 flex gap-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg hover:scale-[1.02] transition-all text-sm disabled:opacity-50"
              >
                {isLoading ? 'Guardando...' : 'Salvar Dados'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar nome ou nº de processo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-primary text-sm dark:text-white"
          />
        </div>
      </div>

      {/* Role Tabs Selector */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 dark:border-slate-700 pb-4">
        {[
          { role: UserRole.ALUNO, label: 'Estudantes', icon: GraduationCap },
          { role: UserRole.PROFESSOR, label: 'Docentes', icon: Users },
          { role: UserRole.DIRETOR, label: 'Gabinete Direção', icon: ShieldAlert },
          { role: UserRole.ADMIN, label: 'Administradores', icon: Zap },
          { role: UserRole.ENCARREGADO, label: 'Encarregados', icon: HelpCircle }
        ].map((tab) => {
          const isActive = activeRole === tab.role;
          const count = filteredUsers.filter(u => u.role === tab.role).length;
          return (
            <button
              key={tab.role}
              onClick={() => setActiveRole(tab.role)}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all
                ${isActive 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700'
                }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Hierarchical Nested List: Course -> Class -> Users */}
      <div className="space-y-8">
        {Object.keys(courseGroups).length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm">
            <Users size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">Nenhum utilizador encontrado com este perfil</p>
          </div>
        ) : (
          Object.keys(courseGroups).sort((a, b) => a.localeCompare(b)).map((courseName) => {
            const courseUsers = courseGroups[courseName];
            const classSubGroups = getSubGroupsByClass(courseUsers);
            
            return (
              <div key={courseName} className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm p-8 space-y-6">
                {/* Course Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold">
                      💻
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        {courseName}
                      </h2>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Curso Oficial IMEL</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-slate-50 dark:bg-slate-900 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Total: {courseUsers.length}
                  </span>
                </div>

                {/* Class subgroups */}
                <div className="space-y-8">
                  {Object.keys(classSubGroups).sort((a, b) => a.localeCompare(b)).map((className) => {
                    const classUsers = classSubGroups[className];
                    
                    return (
                      <div key={className} className="space-y-4">
                        {/* Class Subheader */}
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl w-fit">
                          <span className="w-2 h-2 rounded-full bg-[#003366]"></span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#003366] dark:text-[#FFD700]">
                            Turma / Sala: {className}
                          </span>
                          <span className="ml-2 px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-[9px] font-bold text-slate-500">
                            {classUsers.length} registos
                          </span>
                        </div>

                        {/* Class Users Table */}
                        <div className="overflow-x-auto rounded-3xl border border-slate-100 dark:border-slate-700">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-700">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  Identidade
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                                  Nº Processo
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                                  Nº BI
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                                  Estado
                                </th>
                                {canEdit && (
                                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                                    Ações
                                  </th>
                                )}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-700 bg-white dark:bg-slate-800">
                              {classUsers.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-sm">
                                        {u.name.charAt(0)}
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                          {u.name}
                                        </p>
                                        <p className="text-[10px] text-slate-400">{u.email || 'sem email registrado'}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                                      {u.processNumber}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <span className="text-xs font-mono text-slate-500">
                                      {u.bi || '-'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase ${u.isActive !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                      {u.isActive !== false ? 'Ativo' : 'Inativo'}
                                    </span>
                                  </td>
                                   {canEdit && (
                                     <>
                                       <td className="px-6 py-4 text-right">
                                         <div className="flex items-center justify-end gap-1">
                                           <button
                                             onClick={() => handleOpenEdit(u)}
                                             className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-slate-400"
                                             title="Editar"
                                           >
                                             <Edit2 size={14} />
                                           </button>
                                           <button
                                             onClick={() => handleDelete(u.id)}
                                             className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-slate-400"
                                             title="Remover"
                                           >
                                             <Trash2 size={14} />
                                           </button>
                                         </div>
                                       </td>
                                       <td className="px-6 py-4 text-center">
                                         <div className="flex items-center space-x-3">
                                           <button
                                             onClick={() => toggleUserStatus(u.id, !u.isActive)}
                                             className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                               u.isActive ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                                             }`}
                                           >
                                             {u.isActive ? 'Ativo' : 'Inativo'}
                                           </button>
                                         </div>
                                       </td>
                                     </>
                                   )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;
