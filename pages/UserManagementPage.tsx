
import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Filter, Download, X, Save, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useDatabase, useSettings, useAuth } from '../App';
import { UserRole, User } from '../types';

interface Props {
  mode?: 'full' | 'alunos';
}

const UserManagementPage: React.FC<Props> = ({ mode = 'full' }) => {
  const { users, addUser, updateUser, deleteUser } = useDatabase();
  const { t } = useSettings();
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    processNumber: '',
    role: UserRole.ALUNO,
    turma: '',
    password: '123456',
    isActive: true
  });

  // Somente ADMIN pode editar. DIRETOR apenas visualiza para auditoria.
  const canEdit = currentUser?.role === UserRole.ADMIN;
  const isDiretor = currentUser?.role === UserRole.DIRETOR;

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.processNumber.includes(searchTerm);
    if (mode === 'alunos') return matchesSearch && u.role === UserRole.ALUNO;
    return matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({ name: '', processNumber: '', role: UserRole.ALUNO, turma: '', password: '123456', isActive: true });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ ...user });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(editingUser.id, formData, currentUser?.name || 'Sistema');
    } else {
      addUser(formData as Omit<User, 'id'>, currentUser?.name || 'Sistema');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este usuário permanentemente?')) {
      deleteUser(id, currentUser?.name || 'Sistema');
    }
  };

  return (
    <div className="space-y-8 animate-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            {mode === 'alunos' ? 'Diretório de Estudantes' : 'Gestão Central de Usuários'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {isDiretor ? 'Visualização estratégica de acessos e perfis.' : 'Administre as credenciais e acessos da instituição.'}
          </p>
        </div>
        
        {canEdit && (
          <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 hover:scale-105 transition-all" onClick={handleOpenAdd}>
            <Plus size={18} /> Novo Usuário
          </button>
        )}
      </div>

      {isDiretor && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
          <ShieldCheck size={20}/>
          <span className="text-sm font-bold">Modo Auditoria: Visualização completa habilitada para Direção.</span>
        </div>
      )}

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
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-4 py-2 text-slate-500 font-bold text-sm"><Filter size={18}/> Filtros</button>
           <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm border border-slate-100 dark:border-slate-700"><Download size={18}/> Exportar</button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Identidade</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Nº Processo</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Perfil</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Turma</th>
                {canEdit && <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{user.name}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-sm font-mono font-medium text-slate-600 dark:text-slate-400">{user.processNumber}</span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      user.role === UserRole.ADMIN ? 'bg-purple-50 text-purple-700' :
                      user.role === UserRole.PROFESSOR ? 'bg-blue-50 text-blue-700' :
                      user.role === UserRole.DIRETOR ? 'bg-orange-50 text-orange-700' :
                      user.role === UserRole.ALUNO ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center text-sm text-slate-500 dark:text-slate-400">{user.turma || '-'}</td>
                  {canEdit && (
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenEdit(user)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="Editar">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors" title="Remover">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && canEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-fade">
            <div className="px-8 py-6 bg-primary text-white flex items-center justify-between">
              <h3 className="text-xl font-bold">{editingUser ? 'Atualizar Perfil' : 'Cadastrar Usuário'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X /></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Nome Completo</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Nº Processo</label>
                  <input type="text" required value={formData.processNumber} onChange={(e) => setFormData({...formData, processNumber: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Perfil de Acesso</label>
                  <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary dark:text-white">
                    {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Turma</label>
                  <input type="text" value={formData.turma || ''} onChange={(e) => setFormData({...formData, turma: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Senha Inicial</label>
                  <input type="text" required value={formData.password || ''} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary dark:text-white" />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg hover:scale-[1.02] transition-all">Efetuar Registro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
