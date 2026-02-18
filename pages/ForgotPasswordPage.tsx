import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Send, CheckCircle2, ShieldCheck, Lock, Key } from 'lucide-react';
import { useDatabase } from '../App';

const ForgotPasswordPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [step, setStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const navigate = useNavigate();
  const { users, updateUser } = useDatabase();

  const handleResetRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const found = users.find(u => u.processNumber === identifier || u.email === identifier);
    if (!found) {
      setError('Não foi possível localizar esse processo/e-mail.');
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setTargetUserId(found.id);
    setVerificationCode(code);
    setError('');
    setStep(2);
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    if (codeInput !== verificationCode) {
      setError('Código inválido.');
      return;
    }
    if (newPassword.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    updateUser(targetUserId, { password: newPassword, isActive: true }, 'Sistema');
    setError('');
    setStep(3);
    window.setTimeout(() => navigate('/login'), 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6 transition-colors duration-300">
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl p-10 md:p-14 animate-fade border border-slate-100 dark:border-slate-700 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>

        <Link to="/login" className="inline-flex items-center gap-2 mb-12 text-slate-400 hover:text-primary transition-colors group">
          <div className="p-2 rounded-xl group-hover:bg-primary/10 transition-colors">
            <ArrowLeft size={18} />
          </div>
          <span className="text-sm font-black uppercase tracking-widest">Voltar ao Login</span>
        </Link>

        {step === 1 && (
          <div className="animate-fade">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-[1.5rem] flex items-center justify-center mb-8 shadow-inner">
              <Key size={32} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3">Recuperar Acesso</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium leading-relaxed">
              Introduza o seu número de processo ou e-mail institucional.
            </p>
            
            <form onSubmit={handleResetRequest} className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-[0.2em]">Identificador do Aluno/Docente</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input 
                    type="text" 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Ex: 2022450 ou email@imel.edu.ao"
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-primary focus:bg-white transition-all outline-none font-bold text-slate-800 dark:text-white placeholder:text-slate-300"
                    required
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-500 font-bold">{error}</p>}

              <button 
                type="submit"
                className="w-full bg-primary text-white py-6 rounded-2xl font-black text-lg hover:shadow-2xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-4 shadow-xl shadow-primary/20"
              >
                SOLICITAR CÓDIGO <Send size={20} />
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-[1.5rem] flex items-center justify-center mb-8">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3">Verificação</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-3 font-medium leading-relaxed">
              Código local gerado para recuperação:
            </p>
            <p className="text-2xl font-black text-primary mb-8 tracking-[0.35em]">{verificationCode}</p>

            <form onSubmit={handleFinish} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-[0.2em]">Código de 6 Dígitos</label>
                <input 
                  type="text" 
                  maxLength={6}
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="000000"
                  className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-center text-3xl font-black tracking-[0.5em] focus:border-primary outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-[0.2em]">Nova Palavra-passe</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-primary outline-none font-bold"
                    required
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-500 font-bold">{error}</p>}

              <button 
                type="submit"
                className="w-full bg-primary text-white py-6 rounded-2xl font-black text-lg hover:shadow-2xl transition-all shadow-xl shadow-primary/20"
              >
                REDEFINIR SENHA
              </button>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-10 animate-fade">
            <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-10 animate-bounce shadow-lg">
              <CheckCircle2 size={56} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-5 tracking-tight">Sucesso!</h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg mb-12 max-w-xs mx-auto font-medium">
              Sua palavra-passe foi redefinida. A redirecionar para o login...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
