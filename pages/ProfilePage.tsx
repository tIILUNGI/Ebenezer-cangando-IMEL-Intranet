import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useDatabase } from '../App';
import { Lock, Save, User as UserIcon, Shield, Camera } from 'lucide-react';
import { updateProfile, exportProfileData, changePassword } from '../src/api/index';
import Swal from 'sweetalert2';
import { ProfilePdfDownloader } from '../src/components/ProfilePdfDownloader';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { grades, auditLogs } = useDatabase();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user.password !== currentPassword) {
      Swal.fire({ icon: 'error', title: 'Erro', text: 'A palavra-passe atual está incorreta.' });
      return;
    }
    if (newPassword.length < 6) {
      Swal.fire({ icon: 'warning', title: 'Senha Fraca', text: 'Mínimo 6 caracteres.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      Swal.fire({ icon: 'error', title: 'Erro', text: 'As palavras-passe não coincidem.' });
      return;
    }
    if (newPassword === user.processNumber) {
      Swal.fire({
        icon: 'warning',
        title: 'Senha Fraca',
        text: 'Não pode ser igual ao nº de processo.',
      });
      return;
    }

    setIsLoading(true);
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword });
    } catch (err) {
      console.warn('API password change failed, using local');
    }

    // Local update
    const users = JSON.parse(localStorage.getItem('imel_db_users') || '[]');
    const updatedUsers = users.map((u: any) =>
      u.id === user.id ? { ...u, senha_hash: newPassword, password: newPassword } : u
    );
    localStorage.setItem('imel_db_users', JSON.stringify(updatedUsers));

    Swal.fire({
      icon: 'success',
      title: 'Sucesso!',
      text: 'Palavra-passe atualizada.',
      timer: 2000,
      showConfirmButton: false,
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsLoading(false);
  };

  // Deprecated JSON export; replaced by PDF downloader

  const handleLogout = () => {
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Deseja realmente sair do sistema?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sim, sair',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/login');
      }
    });
  };

  return (
    <div className="space-y-8 animate-fade">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <UserIcon className="text-primary" /> Meu Perfil
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Gerencie suas informações e segurança.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-700 shadow-xl bg-slate-50 dark:bg-slate-900">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center text-4xl font-black">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-3 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer"
              >
                <Camera size={18} />
              </button>
              <input type="file" ref={fileInputRef} accept="image/*" className="hidden" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">{user.role}</p>
              <p className="text-xs font-mono text-slate-400 mt-1">ID: {user.id}</p>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Nº Processo
                </label>
                <p className="font-bold text-slate-800 dark:text-white">{user.processNumber}</p>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Turma
                </label>
                <p className="font-bold text-slate-800 dark:text-white">{user.turma || '-'}</p>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Email
              </label>
              <p className="font-bold text-slate-800 dark:text-white">{user.email || '-'}</p>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Telemóvel
              </label>
              <p className="font-bold text-slate-800 dark:text-white">{user.phone || '-'}</p>
            </div>
          </div>

          <div className="pt-4">
            <ProfilePdfDownloader />
          </div>

          <div className="pt-4">
            <button
              onClick={handleLogout}
              className="w-full py-4 border-2 border-red-200 text-red-600 rounded-2xl font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
            >
              <Lock size={18} /> Sair do Sistema
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 h-fit">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Shield size={20} className="text-primary" /> Segurança
          </h3>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                Palavra-passe Atual
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary dark:text-white transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                Nova Palavra-passe
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary dark:text-white transition-all"
                  required
                  minLength={6}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                Confirmar Nova Palavra-passe
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary dark:text-white transition-all"
                  required
                  minLength={6}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={18} /> {isLoading ? 'A atualizar...' : 'Atualizar Palavra-passe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
