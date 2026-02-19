import React, { useState } from 'react';
import { useAuth, useDatabase } from '../App';
import { User as UserIcon, Save, RefreshCw, Key, Shield } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { updateUser } = useDatabase();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passData, setPassData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!user) return;

    if (user.password !== passData.current) {
      setError('A senha atual está incorreta.');
      return;
    }
    if (passData.new !== passData.confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    if (passData.new.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setIsSaving(true);
    updateUser(user.id, { password: passData.new }, user.name);
    setPassData({ current: '', new: '', confirm: '' });
    setSuccess('Palavra-passe atualizada com sucesso.');
    setIsSaving(false);
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl space-y-8 animate-fade">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <UserIcon className="text-primary" />
          Meu Perfil de Acesso
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Gerencie as suas informações pessoais e segurança da conta.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Shield size={20} className="text-primary" /> Dados do Registro
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Nome Completo</p>
              <p className="font-bold text-slate-800 dark:text-white">{user.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Nº Processo</p>
                <p className="font-bold text-slate-800 dark:text-white">{user.processNumber}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Cargo / Perfil</p>
                <p className="font-bold text-primary">{user.role}</p>
              </div>
            </div>
            {user.turma && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Turma Vinculada</p>
                <p className="font-bold text-slate-800 dark:text-white">{user.turma}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Key size={20} className="text-primary" /> Segurança
          </h3>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-2">Palavra-passe Atual</label>
              <input 
                type="password" 
                required
                value={passData.current}
                onChange={(e) => setPassData({...passData, current: e.target.value})}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-2">Nova Palavra-passe</label>
              <input 
                type="password" 
                required
                value={passData.new}
                onChange={(e) => setPassData({...passData, new: e.target.value})}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-2">Confirmar Nova Senha</label>
              <input 
                type="password" 
                required
                value={passData.confirm}
                onChange={(e) => setPassData({...passData, confirm: e.target.value})}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary dark:text-white"
              />
            </div>

            {error && <p className="text-sm text-red-500 font-bold">{error}</p>}
            {success && <p className="text-sm text-emerald-500 font-bold">{success}</p>}

            <button 
              type="submit" 
              disabled={isSaving}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
            >
              {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />} 
              Atualizar Credenciais
            </button>
          </form>
        </div>
      </div>

      <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-800 flex items-start gap-4">
        <Shield className="text-emerald-500 shrink-0" size={24} />
        <div>
          <p className="font-bold text-emerald-700 dark:text-emerald-400">Proteção de Identidade</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">As suas credenciais são registradas localmente e qualquer alteração é registrada nos logs de auditoria do sistema.</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

