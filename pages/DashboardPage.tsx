
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  Users, GraduationCap, TrendingUp, AlertCircle, CheckCircle2, 
  Activity, Globe, Calendar, BrainCircuit, MessageSquare, Send, ShieldCheck, Server, Key, Database, FileText, Zap
} from 'lucide-react';
import { useAuth, useSettings, useSystemAdmin, useDatabase } from '../App';
import { UserRole, AIInsight } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

const StatCard: React.FC<{ icon: any, label: string, value: string, trend?: string, color: string }> = ({ icon: Icon, label, value, trend, color }) => (
  <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-lg">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2 sm:p-3 rounded-2xl`} style={{ backgroundColor: `${color}15`, color: color }}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      {trend && (
        <span className={`text-[10px] font-black ${trend.startsWith('+') || trend === 'Estável' ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'} px-2 py-1 rounded-full uppercase`}>
          {trend}
        </span>
      )}
    </div>
    <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mb-1 truncate">{label}</p>
    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">{value}</h3>
  </div>
);

const DashboardPage: React.FC = () => {
  const { user, activeStudent } = useAuth();
  const { theme, t } = useSettings();
  const { settings } = useSystemAdmin();
  const { grades, users, auditLogs } = useDatabase();
  const navigate = useNavigate();
  
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const isDiretor = user?.role === UserRole.DIRETOR;
  const isAdmin = user?.role === UserRole.ADMIN;
  const isEncarregado = user?.role === UserRole.ENCARREGADO;
  const isProfessor = user?.role === UserRole.PROFESSOR;
  const isAluno = user?.role === UserRole.ALUNO;
  
  const currentGrades = grades.filter(g => g.studentId === activeStudent?.id);
  const avgGrade = currentGrades.length > 0 
    ? (currentGrades.reduce((acc, g) => acc + (g.t1.average || 0), 0) / currentGrades.length).toFixed(1)
    : '0.0';
  const totalFaltas = currentGrades.reduce((acc, g) => acc + g.faltas, 0);

  const generateAIInsight = async () => {
    setIsAiLoading(true);
    try {
      if (!geminiApiKey) throw new Error('Chave GEMINI_API_KEY em falta.');
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      const context = isDiretor 
        ? "Análise estratégica global: 2450 alunos, 88% aprovação, 154 alunos em risco."
        : isProfessor 
        ? "Análise de turma: Alunos com dificuldade em TLP e Redes."
        : `Aluno: ${activeStudent?.name}, Média: ${avgGrade}, Faltas: ${totalFaltas}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Como um consultor pedagógico do IMEL, analise estes dados e forneça um insight de UMA frase curta e encorajadora ou de alerta. Dados: ${context}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              content: { type: Type.STRING, description: "A frase do insight" },
              severity: { type: Type.STRING, description: "low, medium, ou high" },
              title: { type: Type.STRING, description: "Título curto" }
            },
            required: ["content", "severity", "title"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setAiInsight(data);
    } catch (error) {
      console.error("AI Error:", error);
      setAiInsight({
        title: "Relatório de IA",
        content: isDiretor ? "O índice de aprovação na 12ª classe subiu 4.2% este mês." : "Foco em reforçar os conceitos de Programação no 2º trimestre.",
        severity: "medium"
      });
    } finally {
      setIsAiLoading(false);
    }
  };


  useEffect(() => {
    generateAIInsight();
  }, [user, activeStudent]);

  const handleSecretaria = () => {
    navigate('/mensagens?to=sec-1');
  };

  const renderDirectorKPIs = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 animate-fade">
      <StatCard icon={Users} label="Matrículas" value="2.450" trend="+12%" color={settings.primaryColor} />
      <StatCard icon={CheckCircle2} label="Aprovação" value="88.4%" trend="+4.2%" color="#10b981" />
      <StatCard icon={Activity} label="Índice Ped." value="94.2%" trend="-0.5%" color="#6366f1" />
      <StatCard icon={AlertCircle} label="Abandono" value="1.2%" trend="-0.2%" color="#ef4444" />
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 w-full">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="p-3 sm:p-5 bg-primary text-white rounded-3xl shadow-xl shadow-primary/20 shrink-0">
             {isDiretor ? <Globe className="w-6 h-6 sm:w-8 sm:h-8" /> : isAdmin ? <Zap className="w-6 h-6 sm:w-8 sm:h-8" /> : <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8" />}
          </div>
          <div className="overflow-hidden">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight truncate">
              {isDiretor ? 'Gabinete Estratégico' : isAdmin ? 'Consola de Gestão' : isEncarregado ? 'Portal do Encarregado' : `${t('welcome')}, ${user?.name}`}
            </h1>
            <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium truncate">
              {isDiretor ? 'Monitorização institucional e análise de indicadores.' : 
               isAdmin ? 'Administração de infraestrutura e serviços.' :
               'Acesso centralizado às suas informações académicas.'}
            </p>
          </div>
        </div>

        {aiInsight && (
          <div className={`p-4 rounded-[1.5rem] sm:rounded-[2rem] border-2 flex items-center gap-3 sm:gap-4 animate-fade max-w-full xl:max-w-sm shadow-sm transition-all hover:scale-[1.02] ${
            aiInsight.severity === 'high' ? 'bg-red-50 border-red-100 text-red-700 dark:bg-red-900/10' : 
            aiInsight.severity === 'medium' ? 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-900/10' : 
            'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/10'
          }`}>
            <div className={`p-1.5 sm:p-2 rounded-xl shrink-0 ${isAiLoading ? 'animate-spin' : ''}`}>
              <BrainCircuit className="text-primary dark:text-secondary w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Insights IA</p>
              <p className="text-[10px] sm:text-xs font-black leading-tight line-clamp-2">{aiInsight.content}</p>
            </div>
          </div>
        )}
      </div>

      {isDiretor && renderDirectorKPIs()}
      {isAdmin && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 animate-fade">
          <StatCard icon={Server} label="Servidor" value="99.9%" color="#10b981" />
          <StatCard icon={Key} label="Contas" value={users.length.toString()} color={settings.primaryColor} />
          <StatCard icon={Database} label="Backup SIG" value="OK" color="#6366f1" />
          <StatCard icon={ShieldCheck} label="Atividade" value={auditLogs.length.toString()} color="#f59e0b" />
        </div>
      )}
      {isAluno && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 animate-fade">
          <StatCard icon={TrendingUp} label="Média" value={avgGrade} color={settings.primaryColor} />
          <StatCard icon={CheckCircle2} label="Presença" value="98%" color="#10b981" />
          <StatCard icon={Calendar} label="Provas" value="3" color="#6366f1" />
          <StatCard icon={AlertCircle} label="Faltas" value={totalFaltas.toString()} color="#ef4444" />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <div className="bg-white dark:bg-slate-800 p-4 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
             <div className="flex items-center justify-between mb-6 sm:mb-8">
               <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 sm:gap-3">
                 <Activity className="text-primary w-5 h-5" />
                 {isDiretor ? 'Desempenho por Curso' : 'Evolução Trimestral'}
               </h3>
             </div>
             <div className="h-60 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {isDiretor ? (
                    <BarChart data={[
                      { name: 'INF', val: 78 }, { name: 'CONT', val: 92 }, { name: 'ECON', val: 85 }, { name: 'GEST', val: 80 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} style={{fontSize: '10px'}} />
                      <YAxis axisLine={false} tickLine={false} style={{fontSize: '10px'}} />
                      <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="val" fill={settings.primaryColor} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  ) : (
                    <AreaChart data={[
                      { name: 'Jan', val: 75 }, { name: 'Fev', val: 82 }, { name: 'Mar', val: 80 }, { name: 'Abr', val: 88 }, { name: 'Mai', val: 92 }
                    ]}>
                      <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={settings.primaryColor} stopOpacity={0.1}/>
                          <stop offset="95%" stopColor={settings.primaryColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} style={{fontSize: '10px'}} />
                      <YAxis axisLine={false} tickLine={false} style={{fontSize: '10px'}} />
                      <Tooltip contentStyle={{borderRadius: '12px', border: 'none'}} />
                      <Area type="monotone" dataKey="val" stroke={settings.primaryColor} fillOpacity={1} fill="url(#colorVal)" strokeWidth={4} />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
             </div>
          </div>

          {(isDiretor || isAdmin) && (
            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-6">Auditoria Recente</h3>
              <div className="space-y-3 sm:space-y-4">
                {auditLogs.slice(0, 3).map(log => (
                  <div key={log.id} className="flex items-center justify-between p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-transparent hover:border-primary transition-all overflow-hidden">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 truncate">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-primary shadow-sm shrink-0">
                        <ShieldCheck size={18} />
                      </div>
                      <div className="truncate">
                        <p className="text-[11px] sm:text-sm font-black truncate">{log.user}</p>
                        <p className="text-[9px] sm:text-xs text-slate-500 truncate">{log.action}: {log.target}</p>
                      </div>
                    </div>
                    <span className="text-[8px] sm:text-[10px] font-mono text-slate-400 shrink-0 ml-2">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6 sm:space-y-8">
          <div className="bg-primary p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] text-white shadow-xl shadow-primary/20">
            <h3 className="text-lg sm:text-xl font-bold mb-6 flex items-center gap-2">
              <MessageSquare size={20} /> Gabinete Online
            </h3>
            <div className="space-y-3">
               <button onClick={handleSecretaria} className="w-full p-4 bg-white/10 rounded-2xl flex items-center justify-between hover:bg-white/20 transition-all border border-white/5">
                 <span className="text-[10px] font-black uppercase tracking-widest truncate mr-2">Secretaria Académica</span>
                 <Send size={14} className="shrink-0" />
               </button>
               <a href="https://wa.me/244938229459" target="_blank" rel="noopener noreferrer" className="w-full p-4 bg-white/10 rounded-2xl flex items-center justify-between hover:bg-white/20 transition-all border border-white/5">
                 <span className="text-[10px] font-black uppercase tracking-widest truncate mr-2">Apoio Técnico (TI)</span>
                 <Send size={14} className="shrink-0" />
               </a>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm text-center">
             <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={32} />
             </div>
             <h4 className="font-bold text-slate-800 dark:text-white mb-2 uppercase tracking-tight text-sm sm:text-base">Mapas Gerenciais</h4>
             <p className="text-[9px] sm:text-[10px] text-slate-500 mb-6 uppercase tracking-widest font-black">Emissão de listagens oficiais</p>
             <button className="w-full py-4 bg-slate-50 dark:bg-slate-700 rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest text-primary dark:text-secondary hover:bg-primary hover:text-white transition-all shadow-sm">Relatórios</button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
