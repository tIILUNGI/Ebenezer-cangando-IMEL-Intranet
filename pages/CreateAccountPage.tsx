import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, CheckCircle2, User, Mail, Lock, Fingerprint } from 'lucide-react';
import { useAuth } from '../App';
import { register, login as apiLogin } from '../src/api/auth';
import Swal from 'sweetalert2';

const CreateAccountPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [processNumber, setProcessNumber] = useState('');
  const [foundUser, setFoundUser] = useState<any>(null);
  const [bi, setBi] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isSendingWelcome, setIsSendingWelcome] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const localUsers = JSON.parse(localStorage.getItem('imel_db_users') || '[]');
      const user = localUsers.find((u: any) => u.processNumber === processNumber);
      if (!user) {
        setError('Número de processo não encontrado.');
        return;
      }
      if (user.isActive) {
        setError('Esta conta já foi ativada. Use "Recuperar Senha".');
        return;
      }
      setFoundUser(user);
      setStep(2);
    } catch {
      setError('Erro ao verificar dados.');
    }
  };

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!foundUser) return;
    if (foundUser.bi !== bi) {
      setError('BI não corresponde ao registado.');
      return;
    }
    if (password.length < 6) {
      setError('Mínimo 6 caracteres.');
      return;
    }
    if (password === foundUser.processNumber) {
      setError('Palavra-passe não pode ser igual ao nº de processo.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As palavras-passe não coincidem.');
      return;
    }
    if (!phone.trim()) {
      setError('Informe o número de telemóvel.');
      return;
    }

    setIsSendingWelcome(true);

    try {
      // Try API registration
      await register({
        processNumber: foundUser.processNumber,
        bi,
        email,
        phone: phone.trim(),
        password,
        confirmPassword,
      });
    } catch (apiErr: any) {
      console.warn('API registration failed, using local fallback');
      // Update locally
       const users = JSON.parse(localStorage.getItem('imel_db_users') || '[]');
       const idx = users.findIndex((u: any) => u.id === foundUser.id);
       if (idx >= 0) {
         users[idx] = { ...users[idx], email, phone: phone.trim(), password, isActive: true };
         localStorage.setItem('imel_db_users', JSON.stringify(users));
       }
    }

    try {
      const { data } = await apiLogin(foundUser.processNumber, password);
      localStorage.setItem('imel_user', JSON.stringify(data.user));
      localStorage.setItem('imel_token', data.token);
      localStorage.setItem('imel_refresh_token', data.refreshToken);
    } catch {
      // Login will work on next load
    }

    setStep(3);
    setTimeout(() => navigate('/login'), 2000);
    setIsSendingWelcome(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/10 p-8 md:p-12 animate-fade">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 mb-10 text-slate-400 hover:text-[#003366] transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-bold">Voltar ao Login</span>
        </Link>

        {step === 1 && (
          <div className="animate-fade">
            <div className="w-14 h-14 bg-blue-50 text-[#003366] rounded-2xl flex items-center justify-center mb-6">
              <User size={28} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Primeiro acesso?</h1>
            <p className="text-slate-500 mb-8">
              Insira seu número de processo para verificar seus dados.
            </p>

            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Número de Processo
                </label>
                <input
                  type="text"
                  value={processNumber}
                  onChange={(e) => setProcessNumber(e.target.value)}
                  placeholder="Ex: 2024001"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#003366] focus:bg-white transition-all outline-none"
                  required
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#003366] text-white py-5 rounded-2xl font-bold text-lg hover:bg-blue-900 transition-all flex items-center justify-center gap-3"
              >
                Verificar Dados <ArrowRight size={20} />
              </button>
            </form>
          </div>
        )}

        {step === 2 && foundUser && (
          <div className="animate-fade">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black mb-6">
              <CheckCircle2 size={14} /> DADOS LOCALIZADOS
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Olá, {foundUser.name}</h1>
            <p className="text-slate-500 mb-8">
              Identificamos que você é um{' '}
              <span className="text-[#003366] font-bold">{foundUser.role}</span>. Complete seu
              cadastro abaixo.
            </p>

            <form onSubmit={handleFinish} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Número de BI
                  </label>
                  <div className="relative">
                    <Fingerprint
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      value={bi}
                      onChange={(e) => setBi(e.target.value)}
                      placeholder="Seu número do Bilhete de Identidade"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#003366] focus:bg-white transition-all outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Seu E-mail</label>
                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="exemplo@imel.edu.ao"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#003366] focus:bg-white transition-all outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Telemóvel (WhatsApp/SMS)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: +244 9xx xxx xxx"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#003366] focus:bg-white transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Criar Palavra-passe
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#003366] focus:bg-white transition-all outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Confirmar Palavra-passe
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#003366] focus:bg-white transition-all outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              <div className="p-4 bg-blue-50 text-[#003366] text-xs leading-relaxed rounded-xl italic">
                Ao criar sua conta, você concorda com os termos de uso e política de privacidade da
                Intranet IMEL.
              </div>

              <button
                type="submit"
                disabled={isSendingWelcome}
                className="w-full bg-[#003366] text-white py-5 rounded-2xl font-bold text-lg hover:bg-blue-900 transition-all flex items-center justify-center gap-3"
              >
                {isSendingWelcome ? 'A enviar boas-vindas...' : 'Concluir Registo'}
              </button>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-12 animate-fade">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
              <CheckCircle2 size={48} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-4">Conta Ativada!</h1>
            <p className="text-slate-600 text-lg mb-8 max-w-sm mx-auto">
              Sua conta no sistema IMEL Intranet foi criada com sucesso. Redirecionando para o
              login...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateAccountPage;
