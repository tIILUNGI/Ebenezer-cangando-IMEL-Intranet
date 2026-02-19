import React, { useState, useRef } from 'react';
import { useAuth, useDatabase } from '../App';
import { Lock, Download, Save, User as UserIcon, Shield, Camera } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { updateUser, grades, auditLogs } = useDatabase();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.password !== currentPassword) {
      setError('A palavra-passe atual está incorreta.');
      setMessage('');
      return;
    }
    if (newPassword.length < 6) {
      setError('A nova palavra-passe deve ter pelo menos 6 caracteres.');
      setMessage('');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As novas palavras-passe não coincidem.');
      setMessage('');
      return;
    }

    updateUser(user.id, { password: newPassword }, user.name);
    setMessage('Palavra-passe atualizada com sucesso.');
    setError('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleExportData = () => {
    const personalData = {
      user_info: user,
      academic_records: grades.filter(g => g.studentId === user.id),
      audit_logs: auditLogs.filter(l => l.user === user.name || l.target === user.name),
      export_date: new Date().toISOString(),
      school: "IMEL"
    };

    const dataStr = JSON.stringify(personalData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dados_pessoais_${user.processNumber}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limite de 2MB para evitar problemas com localStorage
    if (file.size > 2 * 1024 * 1024) {
      setError('A imagem é muito grande. O limite é 2MB.');
      setMessage('');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateUser(user.id, { avatar: reader.result }, user.name);
        setMessage('Foto de perfil atualizada com sucesso.');
        setError('');
      }
    };
    reader.readAsDataURL(file);
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
        {/* Cartão de Informações */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
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
                title="Alterar foto"
              >
                <Camera size={18} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                accept="image/*" 
                className="hidden" 
              />
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Número de Processo</label>
                <p className="font-bold text-slate-800 dark:text-white">{user.processNumber}</p>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Turma</label>
                <p className="font-bold text-slate-800 dark:text-white">{user.turma || '-'}</p>
              </div>
            </div>
             <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
              <p className="font-bold text-slate-800 dark:text-white">{user.email || '-'}</p>
            </div>
             <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telemóvel</label>
              <p className="font-bold text-slate-800 dark:text-white">{user.phone || '-'}</p>
            </div>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleExportData}
              className="w-full py-4 border-2 border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <Download size={18} /> Baixar Meus Dados (GDPR)
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Baixe uma cópia completa dos seus dados pessoais registrados no sistema.
            </p>
          </div>
        </div>

        {/* Alterar Senha */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 h-fit">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Shield size={20} className="text-primary" /> Segurança
          </h3>
          
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-2">Palavra-passe Atual</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
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
              <label className="block text-xs font-black text-slate-400 uppercase mb-2">Nova Palavra-passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary dark:text-white transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-2">Confirmar Nova Palavra-passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary dark:text-white transition-all"
                  required
                />
              </div>
            </div>

            {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl">{error}</div>}
            {message && <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl">{message}</div>}

            <button 
              type="submit" 
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <Save size={18} /> Atualizar Palavra-passe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
