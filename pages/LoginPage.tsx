import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  User,
  ArrowLeft,
  GraduationCap,
  BarChart3,
  MessageSquare,
  TrendingUp,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useAuth, useSettings, useSystemAdmin } from '../App';
import Swal from 'sweetalert2';

const LoginPage: React.FC = () => {
  const [processNumber, setProcessNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, error: authError, user } = useAuth();
  const { t } = useSettings();
  const { settings } = useSystemAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await login(processNumber, password);
    if (success) {
      Swal.fire({
        icon: 'success',
        title: 'Bem-vindo!',
        text: 'Acesso autorizado.',
        timer: 1500,
        showConfirmButton: false,
        background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
      }).then(() => navigate('/dashboard'));
    } else {
      setError(authError || 'Credenciais inválidas.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 transition-colors duration-500 font-inter">
      <div className="w-full lg:w-1/2 flex items-center justify-center relative px-4 sm:px-8 py-6 sm:py-10">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="w-full max-w-xl z-10">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/60 dark:border-slate-700 rounded-[2.5rem] p-8 sm:p-10 md:p-12 shadow-2xl animate-fade">
            <div className="flex items-center justify-between mb-8">
              <Link to="/" className="group flex items-center gap-3">
                <div className="p-2.5 bg-primary rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                  <GraduationCap className="text-secondary w-6 h-6" />
                </div>
                <div>
                  <span className="block font-black text-xl text-primary dark:text-white tracking-tighter leading-none">
                    {settings.schoolAcronym}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">
                    Portal de Acesso
                  </span>
                </div>
              </Link>
              <Link
                to="/"
                className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 hover:text-primary transition-all group uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full"
              >
                <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
                <span>Início</span>
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                Login.
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                {t('login_subtitle')}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <div className="group">
                  <label className="block text-[9px] font-black text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-[0.2em] ml-1">
                    {t('process_number')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      value={processNumber}
                      onChange={(e) => setProcessNumber(e.target.value)}
                      placeholder="Nº de Processo"
                      className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:border-primary focus:bg-white dark:focus:bg-slate-800 transition-all outline-none font-bold text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-sm"
                      required
                    />
                  </div>
                </div>

                <div className="group">
                  <div className="flex items-center justify-between mb-1.5 ml-1">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                      {t('password')}
                    </label>
                    <Link
                      to="/recuperar-senha"
                      className="text-[9px] font-black text-primary dark:text-secondary hover:underline uppercase tracking-widest"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:border-primary focus:bg-white dark:focus:bg-slate-800 transition-all outline-none font-bold text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-white py-4 rounded-xl font-black text-base shadow-xl shadow-primary/30 hover:translate-y-[-1px] active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {t('login_btn')}
                      <ArrowRight
                        size={18}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-400">
                  {t('create_account')}{' '}
                  <Link
                    to="/registrar"
                    className="text-primary dark:text-secondary hover:underline font-black uppercase tracking-widest text-[10px]"
                  >
                    Solicitar Acesso
                  </Link>
                </p>
              </div>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2 text-slate-300 dark:text-slate-700">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <p className="text-[8px] font-black uppercase tracking-[0.2em]">Conexão Segura TLS</p>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex w-full lg:w-1/2 h-screen bg-gradient-to-b from-primary via-primary/95 to-primary relative overflow-hidden flex-col shadow-2xl">
        <div className="absolute inset-0 w-full h-full">
          <img
            src="https://tecpleta.com/midias/noticias/584979.jpg"
            alt={settings.schoolName}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-primary/40"></div>
        </div>

        <div className="relative z-10 flex flex-col h-full px-6 py-8">
          <div className="text-left mb-6">
            <p className="text-white/80 text-[8px] font-black uppercase tracking-[0.2em] mb-2">
              Sistema Integrado de Gestão Escolar
            </p>
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-secondary/20 p-2 rounded-lg shadow shadow-secondary/20">
                <GraduationCap className="text-primary w-6 h-6" />
              </div>
              <h2 className="text-4xl font-black text-white tracking-tighter">INTRA</h2>
            </div>
            <h2 className="text-4xl font-black text-secondary tracking-tighter ml-10 -mt-2">
              IMEL
            </h2>
          </div>

          <p className="text-white/90 text-left mb-6 text-xs font-medium leading-snug max-w-xs">
            Bem-vindo à plataforma digital oficial do IMEL. Aceda às suas informações académicas,
            recursos didáticos e serviços administrativos num único lugar.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { icon: BarChart3, title: 'Notas Online', desc: 'Consulte avaliações em tempo real' },
              { icon: MessageSquare, title: 'Comunicação', desc: 'Mensagens internas e avisos' },
              { icon: TrendingUp, title: 'Assiduidade', desc: 'Acompanhe suas presenças' },
              { icon: FileText, title: 'Documentos', desc: 'Acesso a guias e certificados' },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition-all group cursor-default"
              >
                <div className="bg-secondary/20 w-9 h-9 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <f.icon className="text-secondary w-4 h-4" />
                </div>
                <h3 className="text-white font-black text-xs mb-0.5 uppercase tracking-wider">
                  {f.title}
                </h3>
                <p className="text-white/60 text-[9px] leading-tight">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
            <div>
              <p className="text-white font-black text-[9px] uppercase tracking-widest">
                © {new Date().getFullYear()} Intra IMEL
              </p>
              <p className="text-white/40 text-[8px] font-bold">Versão {settings.version}</p>
            </div>
            <div className="flex gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[8px] font-black text-white/60 uppercase tracking-widest">
                Online
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden w-full min-h-screen bg-gradient-to-b from-primary via-primary/95 to-primary relative overflow-hidden flex flex-col px-6 py-12">
        <div className="absolute inset-0 w-full h-full">
          <img
            src="https://tecpleta.com/midias/noticias/584979.jpg"
            alt={settings.schoolName}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/70 to-primary/30"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-6">
            <p className="text-white/80 text-[9px] font-black uppercase tracking-[0.2em] mb-3">
              Sistema Integrado de Gestão Escolar
            </p>
            <h2 className="text-4xl font-black text-white mb-1 tracking-tighter">INTRA</h2>
            <h2 className="text-4xl font-black text-secondary tracking-tighter">IMEL</h2>
          </div>
          <p className="text-white/90 mb-6 text-xs font-medium leading-snug max-w-xs">
            Aceda às suas informações académicas e serviços administrativos num único lugar.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-6 w-full">
            {[
              { icon: BarChart3, title: 'Notas', desc: 'Real-time' },
              { icon: MessageSquare, title: 'Avisos', desc: 'Mensagens' },
              { icon: TrendingUp, title: 'Progresso', desc: 'Académico' },
              { icon: FileText, title: 'Docs', desc: 'Oficiais' },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-xl p-3 text-center"
              >
                <div className="bg-secondary/20 w-7 h-7 rounded-md flex items-center justify-center mx-auto mb-2">
                  <f.icon className="text-secondary w-3.5 h-3.5" />
                </div>
                <h3 className="text-white font-black text-[9px] mb-0.5 uppercase tracking-wider">
                  {f.title}
                </h3>
                <p className="text-white/60 text-[8px]">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="w-full border-t border-white/20 pt-4 mt-2">
            <p className="text-white font-black text-[9px] uppercase tracking-widest">
              © {new Date().getFullYear()} Intra IMEL
            </p>
            <p className="text-white/40 text-[8px] font-bold mt-0.5">Versão {settings.version}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
