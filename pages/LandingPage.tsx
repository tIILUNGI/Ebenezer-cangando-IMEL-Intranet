import React, { useState, useEffect, useRef } from 'react';
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
  GraduationCap,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSettings, useSystemAdmin } from '../App';
import Swal from 'sweetalert2';

gsap.registerPlugin(ScrollTrigger);

const LandingPage: React.FC = () => {
  const { theme, t } = useSettings();
  const { settings } = useSystemAdmin();
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const advantagesRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      (window as any).__lenis?.scrollTo(el, { duration: 1.2, easing: (t: number) => t });
    }
    setMobileMenuOpen(false);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tickets = JSON.parse(localStorage.getItem('imel_db_contact_messages') || '[]');
    tickets.unshift({
      id: Date.now().toString(),
      name: contactName,
      email: contactEmail,
      message: contactMessage,
      createdAt: new Date().toLocaleString(),
    });
    localStorage.setItem('imel_db_contact_messages', JSON.stringify(tickets.slice(0, 200)));

    Swal.fire({
      icon: 'success',
      title: 'Mensagem Enviada!',
      text: 'Obrigado pelo seu contacto. Responderemos em breve.',
      confirmButtonColor: 'var(--color-primary)',
      background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
    });

    setContactName('');
    setContactEmail('');
    setContactMessage('');
  };

  useEffect(() => {
    const lenis = (window as any).__lenis;
    if (lenis) {
      // ScrollTrigger proxy drives Lenis when the scroller scrolls
      (ScrollTrigger as any).scrollerProxy('body', {
        scrollTop(value) {
          if (arguments.length) {
            lenis.scrollTo(value, { immediate: true });
          }
          return lenis.scroll;
        },
        getBoundingClientRect() {
          return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
        },
        pinType: document.body.style.transform ? 'transform' : 'fixed',
      });

      lenis.on('scroll', () => ScrollTrigger.update());

      gsap.ticker.lagSmoothing(0);
    }

    return () => {
      const l = (window as any).__lenis;
      l?.off('scroll', () => ScrollTrigger.update());
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Barra de Navegação */}
      <nav className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex items-center justify-between max-w-7xl mx-auto sticky top-0 bg-white dark:bg-slate-900 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-xl">
            <GraduationCap className="text-secondary w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl tracking-tighter text-primary dark:text-white">
            {settings.schoolAcronym}
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-8 mr-6">
          <a
            href="#features"
            onClick={(e) => scrollToSection(e, 'features')}
            className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors uppercase tracking-widest"
          >
            {t('features')}
          </a>
          <a
            href="#advantages"
            onClick={(e) => scrollToSection(e, 'advantages')}
            className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors uppercase tracking-widest"
          >
            Vantagens
          </a>
          <a
            href="#location"
            onClick={(e) => scrollToSection(e, 'location')}
            className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors uppercase tracking-widest"
          >
            {t('location')}
          </a>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="hidden sm:block px-6 sm:px-8 py-3 bg-primary text-white rounded-xl text-sm font-black shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            {t('login_btn')}
          </Link>

          {/* Botão Menu Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            {mobileMenuOpen ? <Smartphone size={24} /> : <Layout size={24} />}
          </button>
        </div>

        {/* Menu Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-2xl p-6 lg:hidden animate-fade">
            <div className="flex flex-col gap-6">
              <a
                href="#features"
                onClick={(e) => scrollToSection(e, 'features')}
                className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center justify-between"
              >
                {t('features')} <ArrowRight size={20} />
              </a>
              <a
                href="#advantages"
                onClick={(e) => scrollToSection(e, 'advantages')}
                className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center justify-between"
              >
                Vantagens <ArrowRight size={20} />
              </a>
              <a
                href="#location"
                onClick={(e) => scrollToSection(e, 'location')}
                className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center justify-between"
              >
                {t('location')} <ArrowRight size={20} />
              </a>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-4 bg-primary text-white rounded-2xl text-center font-black text-lg shadow-xl"
              >
                {t('login_btn')}
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
        <header
          className="relative pt-12 sm:pt-16 pb-20 sm:pb-28 overflow-hidden"
          ref={heroRef}
        >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-primary dark:text-white rounded-full text-xs font-black mb-8 uppercase tracking-widest hero-badge shadow-sm z-10 relative">
              <Zap size={14} className="text-secondary" /> Plataforma Digital Oficial
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] mb-6 sm:mb-8 hero-title">
              Gestão Escolar <br />
              <span className="text-primary dark:text-secondary italic">Inteligente</span>
            </h1>
            <p className="text-center lg:text-left text-xl sm:text-2xl lg:text-3xl text-slate-600 dark:text-slate-400 mb-8 sm:mb-12 leading-relaxed max-w-2xl mx-auto lg:mx-0 hero-desc">
              Bem-vindo à plataforma digital oficial do IMEL. Aceda às suas informações académicas, recursos didáticos e serviços administrativos num único lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start hero-btn">
              <Link
                to="/login"
                className="flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-primary text-white rounded-2xl text-base sm:text-lg font-black shadow-2xl hover:translate-y-[-2px] transition-all group"
              >
                {t('start_now')}{' '}
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                onClick={(e) => scrollToSection(e, 'features')}
                className="px-8 sm:px-10 py-4 sm:py-5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl text-base sm:text-lg font-black hover:bg-slate-50 transition-all text-center"
              >
                Saber Mais
              </a>
            </div>
          </div>
          <div className="relative hidden lg:block animate-fade hero-img-wrapper">
            <div className="relative rounded-[3rem] overflow-hidden border-[12px] border-white dark:border-slate-800 shadow-2xl rotate-2 hover:rotate-0 transition-all duration-1000">
              <img
                src="https://tecpleta.com/midias/noticias/584979.jpg"
                alt={settings.schoolName}
                className="w-full h-[460px] xl:h-[600px] object-cover"
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.setAttribute('style', 'display:flex');
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-blue-800/10 items-center justify-center">
                <GraduationCap className="w-32 h-32 text-white/20" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Funcionalidades */}
      <section
        id="features"
        className="py-20 sm:py-24 bg-slate-50 dark:bg-slate-800/20 transition-colors scroll-mt-20"
        ref={featuresRef}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
              {t('features')}
            </h2>
            <p className="text-slate-500 max-w-3xl mx-auto text-lg italic">
              Uma infraestrutura digital completa para suprir as necessidades de toda a comunidade
              académica.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: CheckCircle,
                title: 'Notas Online',
                desc: 'Consulte avaliações em tempo real',
              },
              { icon: MessageSquare, title: 'Comunicação', desc: 'Mensagens internas e avisos' },
              { icon: Users, title: 'Assiduidade', desc: 'Acompanhe suas presenças' },
              {
                icon: Database,
                title: 'Documentos',
                desc: 'Acesso a guias e certificados para estarem mais em baixo da iamgen',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 p-6 rounded-[1.75rem] shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all hover:translate-y-[-4px] feature-card"
              >
                <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center mb-4">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-base font-black mb-2 dark:text-white uppercase tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-slate-500 text-[13px] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vantagens */}
      <section
        id="advantages"
        className="py-20 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20"
        ref={advantagesRef}
      >
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-secondary/10 px-4 py-1.5 rounded-full text-xs font-black mb-6 text-primary uppercase">
              <Lightbulb size={16} className="text-primary" /> {t('why_use_title')}
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-8 leading-tight">
              Excelência na Gestão de Informação.
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-10">
              {t('why_text')}
            </p>

            <div className="space-y-6">
              {[
                {
                  title: 'Segurança de Dados',
                  desc: 'Protocolos de auditoria que registam cada alteração no sistema.',
                },
                {
                  title: 'Eficiência Operacional',
                  desc: 'Redução de 80% no uso de papel e processos burocráticos.',
                },
                {
                  title: 'Transparência',
                  desc: 'Pais acompanham o progresso dos filhos instantaneamente.',
                },
              ].map((adv, i) => (
                <div key={i} className="flex gap-5 adv-item">
                  <div className="shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    <CheckCircle size={18} />
                  </div>
                  <div>
                    <h4 className="font-black dark:text-white uppercase text-sm tracking-widest">
                      {adv.title}
                    </h4>
                    <p className="text-slate-500 text-sm">{adv.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-6 pt-12">
              <div className="bg-primary p-8 rounded-[2rem] text-white shadow-xl stat-card">
                <p className="text-4xl font-black mb-2">94%</p>
                <p className="text-sm font-bold opacity-70">Aumento de Assiduidade</p>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-[2rem] dark:text-white stat-card">
                <p className="text-4xl font-black mb-2">+2k</p>
                <p className="text-sm font-bold text-slate-500 uppercase">Utilizadores</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-secondary p-8 rounded-[2rem] text-primary shadow-xl stat-card">
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
      <section
        id="location"
        className="py-20 sm:py-24 bg-slate-50 dark:bg-slate-800/40 transition-colors scroll-mt-20"
        ref={locationRef}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-7">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-8">
                {t('find_us')}
              </h2>
              <div className="h-[280px] sm:h-[360px] md:h-[420px] lg:h-[450px] w-full rounded-[3rem] overflow-hidden bg-slate-200 dark:bg-slate-700 shadow-2xl border-8 border-white dark:border-slate-800">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4866.569986532973!2d13.2437764758746!3d-8.829424891224166!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1a51f37df86fc64f%3A0xa06f4031efd37cd0!2sINSTITUTO%20M%C3%89DIO%20DE%20ECONOMIA%20DE%20LUANDA%20-%20IMEL!5e1!3m2!1spt-PT!2sao!4v1778235900681!5m2!1spt-PT!2sao"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              <div className="mt-8 flex items-center gap-6 p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-sm">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="font-black dark:text-white uppercase tracking-widest text-sm">
                    Sede Institucional
                  </p>
                  <p className="text-slate-500">Largo da Independência, Luanda, Angola</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-slate-800 p-8 sm:p-10 md:p-14 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-700 lg:sticky lg:top-28">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3">
                  {t('contact_form_title')}
                </h3>
                <p className="text-slate-500 mb-10 text-sm leading-relaxed">
                  {t('contact_form_subtitle')}
                </p>

                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em]">
                      {t('name_label')}
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Nome Completo"
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-primary outline-none transition-all dark:text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em]">
                      {t('email_label')}
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="exemplo@imel.edu.ao"
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-primary outline-none transition-all dark:text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em]">
                      {t('message_label')}
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Como podemos ajudar?"
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-primary outline-none transition-all dark:text-white resize-none font-medium"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-4"
                  >
                    {t('send_message_btn')} <Send size={22} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-slate-100 dark:border-slate-800 text-center bg-white dark:bg-slate-900">
        <div className="flex flex-col items-center gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <GraduationCap className="text-primary w-8 h-8" />
            <span className="font-black text-2xl text-slate-900 dark:text-white">
              {settings.schoolAcronym}
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
            <Link
              to="/termos"
              className="text-sm font-bold text-slate-500 hover:text-primary transition-colors"
            >
              Termos de Utilização
            </Link>
            <Link
              to="/privacidade"
              className="text-sm font-bold text-slate-500 hover:text-primary transition-colors"
            >
              Privacidade
            </Link>
            <a
              href="https://wa.me/244938229459"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-slate-500 hover:text-primary transition-colors"
            >
              Suporte Técnico
            </a>
            <a
              href="https://acessoetp.ao"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-slate-500 hover:text-primary transition-colors"
            >
              Portal Governamental
            </a>
          </div>

          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 w-full">
            <p className="text-slate-400 text-xs font-medium">
              © {new Date().getFullYear()} {settings.schoolName}. <br className="sm:hidden" /> Todos
              os direitos reservados.
            </p>
          </div>
        </div>
       </footer>
      </div>
    );
  };

export default LandingPage;
