
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, User, ArrowLeft, GraduationCap } from 'lucide-react';
import { useAuth, useSettings, useSystemAdmin } from '../App';

const LoginPage: React.FC = () => {
  const [processNumber, setProcessNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const { t } = useSettings();
  const { settings } = useSystemAdmin();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await login(processNumber, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Credenciais inválidas. Por favor, verifique o seu número de processo e tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md animate-fade">
          <div className="flex items-center justify-between mb-12">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="p-2 bg-primary rounded-xl">
                <GraduationCap className="text-secondary w-6 h-6" />
              </div>
              <span className="font-extrabold text-2xl text-primary dark:text-white">
                {settings.schoolAcronym}
              </span>
            </Link>
            
            <Link to="/" className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary transition-colors">
              <ArrowLeft size={16} /> Voltar
            </Link>
          </div>

          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">{t('login_title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">{t('login_subtitle')}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                {t('process_number')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  value={processNumber}
                  onChange={(e) => setProcessNumber(e.target.value)}
                  placeholder="Introduza o nº de processo"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-primary focus:bg-white transition-all outline-none font-bold text-slate-800 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('password')}</label>
                <Link to="/recuperar-senha" title="Recuperar Palavra-passe" className="text-xs font-bold text-primary dark:text-secondary hover:underline">Esqueceu a palavra-passe?</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Palavra-passe"
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-primary focus:bg-white transition-all outline-none font-bold text-slate-800 dark:text-white"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-4"
            >
              {isLoading ? 'A VERIFICAR...' : 'ENTRAR NA PLATAFORMA'}
              {!isLoading && <ArrowRight size={20} />}
            </button>

            <div className="text-center pt-4">
              <p className="text-sm font-bold text-slate-500">
                Não tem conta?{' '}
                <Link to="/registar" className="text-primary dark:text-secondary hover:underline font-black">
                  Criar conta agora
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <div className="hidden md:block w-1/2 h-screen p-8 bg-slate-50 dark:bg-slate-800 transition-colors duration-300">
        <div className="relative h-full w-full rounded-[3rem] overflow-hidden shadow-2xl">
          <img 
            src="https://tecpleta.com/midias/noticias/584979.jpg" 
            alt={settings.schoolName} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent"></div>
          <div className="absolute bottom-20 left-16 right-16">
             <div className="mb-6 bg-white p-4 inline-block rounded-2xl shadow-xl">
                <GraduationCap className="text-primary w-12 h-12" />
             </div>
            <h2 className="text-4xl font-black text-white leading-tight">Gira a sua <br/><span className="text-secondary underline text-5xl">vida académica</span> com eficiência.</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
