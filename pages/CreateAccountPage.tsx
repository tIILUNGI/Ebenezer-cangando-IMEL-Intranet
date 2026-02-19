import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, CheckCircle2, User, Mail, Lock, Fingerprint } from 'lucide-react';
import { useDatabase } from '../App';

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
  const { users, updateUser } = useDatabase();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.processNumber === processNumber);
    if (!user) {
      setError('Número de processo não encontrado na base de dados do IMEL.');
      return;
    }
    if (user.isActive) {
      setError('Esta conta já foi ativada. Se esqueceu a senha, por favor, use a opção "Recuperar Senha" na página de login.');
      return;
    }
    setFoundUser(user);
    setError('');
    setStep(2);
  };

  const sendWelcomeMessage = async (payload: { phone: string; email: string; name: string; role: string }) => {
    const response = await fetch('/.netlify/functions/send-welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, channels: ['whatsapp', 'sms'] })
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.message || 'Falha no envio de boas-vindas.');
    }
  };

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (foundUser.bi !== bi) {
      setError('O número do BI não corresponde ao registado no sistema. Contacte a secretaria.');
      return;
    }
    if (password.length < 6) {
      setError('A palavra-passe deve ter no mínimo 6 caracteres.');
      return;
    }
    if (password === foundUser.processNumber) {
      setError('A palavra-passe deve ser diferente do número de processo.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (!phone.trim()) {
      setError('Informe o número de telemóvel para receber SMS e WhatsApp.');
      return;
    }

    setError('');
    setIsSendingWelcome(true);
    updateUser(foundUser.id, { email, phone: phone.trim(), password, isActive: true }, foundUser.name);
    try {
      await sendWelcomeMessage({ phone: phone.trim(), email, name: foundUser.name, role: foundUser.role });
      setStep(3);
      window.setTimeout(() => navigate('/login'), 1200);
    } catch (err: any) {
      setError(err?.message || 'Não foi possível enviar a mensagem de boas-vindas.');
    } finally {
      setIsSendingWelcome(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/10 p-8 md:p-12 animate-fade">
        <Link to="/login" className="inline-flex items-center gap-2 mb-10 text-slate-400 hover:text-[#003366] transition-colors">
          <ArrowLeft size={20} />
          <span className="text-sm font-bold">Voltar ao Login</span>
        </Link>

        {step === 1 && (
          <div className="animate-fade">
            <div className="w-14 h-14 bg-blue-50 text-[#003366] rounded-2xl flex items-center justify-center mb-6">
              <User size={28} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Primeiro acesso?</h1>
            <p className="text-slate-500 mb-8">Insira seu número de processo para verificar seus dados no sistema.</p>
            
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Número de Processo</label>
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
            <p className="text-slate-500 mb-8">Identificamos que você é um <span className="text-[#003366] font-bold">{foundUser.role}</span>. Complete seu cadastro abaixo.</p>

            <form onSubmit={handleFinish} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Número de BI</label>
                  <div className="relative">
                    <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
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
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
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
                  <label className="block text-sm font-bold text-slate-700 mb-2">Telemóvel (WhatsApp/SMS)</label>
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
                  <label className="block text-sm font-bold text-slate-700 mb-2">Criar Palavra-passe</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
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
                  <label className="block text-sm font-bold text-slate-700 mb-2">Confirmar Palavra-passe</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
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
                Ao criar sua conta, você concorda com os termos de uso e política de privacidade da Intranet IMEL.
              </div>

              <button 
                type="submit"
                disabled={isSendingWelcome}
                className="w-full bg-[#003366] text-white py-5 rounded-2xl font-bold text-lg hover:bg-blue-900 transition-all"
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
              Sua conta no sistema IMEL Intranet foi criada com sucesso. Redirecionando para o login...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateAccountPage;
