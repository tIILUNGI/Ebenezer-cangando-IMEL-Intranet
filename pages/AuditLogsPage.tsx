
import React from 'react';
import { useDatabase, useSystemAdmin } from '../App';
import { Activity, User, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

const AuditLogsPage: React.FC = () => {
  const { auditLogs } = useDatabase();
  const { settings } = useSystemAdmin();

  const getActionColor = (action: string) => {
    if (action.includes('REMOVEU')) return 'text-red-500 bg-red-50 dark:bg-red-900/20';
    if (action.includes('ALTEROU') || action.includes('EDITOU')) return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
    return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
  };

  return (
    <div className="space-y-8 animate-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Auditoria de Segurança</h1>
          <p className="text-slate-500 dark:text-slate-400">Rastreabilidade completa de todas as ações no {settings.schoolAcronym}.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs uppercase">
          <ShieldCheck size={16} /> Sistema Monitorado
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Usuário</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Ação</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Alvo / Detalhes</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Data/Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-slate-400 italic">Nenhuma atividade registrada ainda.</td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 text-primary rounded-full flex items-center justify-center">
                          <User size={14} />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{log.user}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getActionColor(log.action)}`}>
                        {log.action.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{log.target}</p>
                      <p className="text-xs text-slate-500">{log.details}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 text-xs font-mono text-slate-400">
                        <Clock size={12} /> {log.timestamp}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-3xl flex items-start gap-4">
        <AlertTriangle className="text-primary shrink-0" size={20} />
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <strong>Aviso de Auditoria:</strong> Estes registros são imutáveis e servem como prova institucional de modificações na base de dados (Notas, Usuários e Configurações).
        </p>
      </div>
    </div>
  );
};

export default AuditLogsPage;

