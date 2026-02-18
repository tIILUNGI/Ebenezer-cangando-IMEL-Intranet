
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Zap, 
  Users, 
  ArrowRight,
  Database,
  MapPin,
  MessageSquare,
  CheckCircle,
  Clock,
  Send,
  HelpCircle,
  Lightbulb,
  Layout,
  Smartphone,
  GraduationCap
} from 'lucide-react';
import { useSettings, useSystemAdmin } from '../App';

const LandingPage: React.FC = () => {
  const { theme, t } = useSettings();
  const { settings } = useSystemAdmin();
  const [formSent, setFormSent] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
    setTimeout(() => setFormSent(false), 5000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Barra de Navegação */}
      <nav className="px-8 py-6 flex items-center justify-between max-w-7xl mx-auto sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-xl">
            <GraduationCap className="text-secondary w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl tracking-tighter text-primary dark:text-white">
            {settings.schoolAcronym}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-8 mr-6">
            <a href="#features" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors uppercase tracking-widest">{t('features')}</a>
            <a href="#advantages" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors uppercase tracking-widest">Vantagens</a>
            <a href="#location" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors uppercase tracking-widest">{t('location')}</a>
          </div>
          
          <Link 
            to="/login" 
            className="px-8 py-3 bg-primary text-white rounded-xl text-sm font-black shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            {t('login_btn')}
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-16 pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-20 items-center">
          <div className="z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-full text-xs font-black mb-8 uppercase tracking-widest">
              <Zap size={14} className="text-secondary" /> Plataforma Digital Oficial
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] mb-8">
              Gestão Escolar <br />
              <span className="text-primary dark:text-secondary italic">Inteligente</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Aceda a notas, horários, recursos didácticos e comunique com a instituição através de uma plataforma centralizada e moderna.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link 
                to="/login" 
                className="flex items-center justify-center gap-3 px-10 py-5 bg-primary text-white rounded-2xl text-lg font-black shadow-2xl hover:translate-y-[-2px] transition-all group"
              >
                {t('start_now')} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#features" className="px-10 py-5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl text-lg font-black hover:bg-slate-50 transition-all text-center">
                Saber Mais
              </a>
            </div>
          </div>
          <div className="relative hidden lg:block animate-fade">
            <div className="relative rounded-[3rem] overflow-hidden border-[12px] border-white dark:border-slate-800 shadow-2xl rotate-2 hover:rotate-0 transition-all duration-1000">
              <img 
                src="https://tecpleta.com/midias/noticias/584979.jpg" 
                alt={settings.schoolName} 
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-primary/10"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Funcionalidades */}
      <section id="features" className="py-24 bg-slate-50 dark:bg-slate-800/20 transition-colors scroll-mt-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">{t('features')}</h2>
            <p className="text-slate-500 max-w-3xl mx-auto text-lg italic">Uma infraestrutura digital completa para suprir as necessidades de toda a comunidade académica.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Layout, title: "Painel Individual", desc: "Acessos personalizados para Alunos, Encarregados, Professores e Direcção." },
              { icon: CheckCircle, title: "Gestão Académica", desc: "Lançamento e consulta de notas, pautas e assiduidade em tempo real." },
              { icon: MessageSquare, title: "Comunicação", desc: "Canal directo de mensagens internas entre a escola e a família." },
              { icon: Smartphone, title: "Acessibilidade", desc: "Plataforma optimizada para aceder em computadores, tablets ou smartphones." }
            ].map((feature, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all hover:translate-y-[-5px]">
                <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-lg font-black mb-3 dark:text-white uppercase tracking-wide">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vantagens */}
      <section id="advantages" className="py-24 max-w-7xl mx-auto px-8 scroll-mt-20">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-secondary/10 px-4 py-1.5 rounded-full text-xs font-black mb-6 text-primary uppercase">
              <Lightbulb size={16} className="text-primary" /> {t('why_use_title')}
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-8 leading-tight">Excelência na Gestão de Informação.</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-10">{t('why_text')}</p>
            
            <div className="space-y-6">
              {[
                { title: "Segurança de Dados", desc: "Protocolos de auditoria que registam cada alteração no sistema." },
                { title: "Eficiência Operacional", desc: "Redução de 80% no uso de papel e processos burocráticos." },
                { title: "Transparência", desc: "Pais acompanham o progresso dos filhos instantaneamente." }
              ].map((adv, i) => (
                <div key={i} className="flex gap-5">
                  <div className="shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    <CheckCircle size={18} />
                  </div>
                  <div>
                    <h4 className="font-black dark:text-white uppercase text-sm tracking-widest">{adv.title}</h4>
                    <p className="text-slate-500 text-sm">{adv.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-6 pt-12">
              <div className="bg-primary p-8 rounded-[2rem] text-white shadow-xl">
                <p className="text-4xl font-black mb-2">94%</p>
                <p className="text-sm font-bold opacity-70">Aumento de Assiduidade</p>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-[2rem] dark:text-white">
                <p className="text-4xl font-black mb-2">+2k</p>
                <p className="text-sm font-bold text-slate-500 uppercase">Utilizadores</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-secondary p-8 rounded-[2rem] text-primary shadow-xl">
                <p className="text-4xl font-black mb-2">100%</p>
                <p className="text-sm font-bold opacity-70">Dados Seguros</p>
              </div>
              <div className="bg-primary p-8 rounded-[2rem] text-white">
                <p className="text-4xl font-black mb-2">24/7</p>
                <p className="text-sm font-bold opacity-70">Disponibilidade</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Localização & Contacto */}
      <section id="location" className="py-24 bg-slate-50 dark:bg-slate-800/40 transition-colors scroll-mt-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-7">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-8">{t('find_us')}</h2>
              <div className="h-[450px] w-full rounded-[3rem] overflow-hidden bg-slate-200 dark:bg-slate-700 shadow-2xl border-8 border-white dark:border-slate-800">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3942.2351897648353!2d13.228531314785465!3d-8.82512349366224!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1a51f1585093375b%3A0xc6d7a46e968686e0!2sIMEL%20-%20Instituto%20M%C3%A9dio%20de%20Economia%20de%20Luanda!5e0!3m2!1spt-BR!2sao!4v1690000000000!5m2!1spt-BR!2sao" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                ></iframe>
              </div>
              <div className="mt-8 flex items-center gap-6 p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-sm">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="font-black dark:text-white uppercase tracking-widest text-sm">Sede Institucional</p>
                  <p className="text-slate-500">Largo da Independência, Luanda, Angola</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-slate-800 p-10 md:p-14 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-700 sticky top-28">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3">{t('contact_form_title')}</h3>
                <p className="text-slate-500 mb-10 text-sm leading-relaxed">{t('contact_form_subtitle')}</p>

                {formSent ? (
                  <div className="text-center py-16 animate-fade">
                    <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
                      <CheckCircle size={48} />
                    </div>
                    <h4 className="text-2xl font-black mb-3 dark:text-white">Mensagem Enviada</h4>
                    <p className="text-slate-500 italic">Obrigado pelo seu contacto. Brevemente entraremos em contacto através do e-mail fornecido.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em]">{t('name_label')}</label>
                      <input type="text" required placeholder="Nome Completo" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-primary outline-none transition-all dark:text-white font-medium" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em]">{t('email_label')}</label>
                      <input type="email" required placeholder="exemplo@imel.edu.ao" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-primary outline-none transition-all dark:text-white font-medium" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em]">{t('message_label')}</label>
                      <textarea required rows={4} placeholder="Como podemos ajudar?" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-primary outline-none transition-all dark:text-white resize-none font-medium"></textarea>
                    </div>
                    <button type="submit" className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-4">
                      {t('send_message_btn')} <Send size={22} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-slate-100 dark:border-slate-800 text-center bg-white dark:bg-slate-900">
        <div className="flex flex-col items-center gap-6 max-w-7xl mx-auto px-8">
          <div className="flex items-center gap-3">
            <GraduationCap className="text-primary w-8 h-8" />
            <span className="font-black text-2xl text-slate-900 dark:text-white">{settings.schoolAcronym}</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
            <Link to="/termos" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">Termos de Utilização</Link>
            <Link to="/privacidade" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">Privacidade</Link>
            <a href="https://wa.me/244938229459" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">Suporte Técnico</a>
            <a href="https://acessoetp.ao" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">Portal Governamental</a>
          </div>

          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 w-full">
            <p className="text-slate-400 text-xs font-medium">
              © {new Date().getFullYear()} {settings.schoolName}. <br className="sm:hidden" /> Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
