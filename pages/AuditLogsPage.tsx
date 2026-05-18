import React, { useState, useEffect } from 'react';
import { useDatabase, useSystemAdmin } from '../App';
import { Activity, User, Clock, AlertTriangle, ShieldCheck, Download } from 'lucide-react';
import { fetchAuditLogs, exportAuditLogs } from '../src/api/index';
import Swal from 'sweetalert2';

const AuditLogsPage: React.FC = () => {
  const { auditLogs, addAuditLog, replaceAuditLogs } = useDatabase();
  const { settings } = useSystemAdmin();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState({ action: '', user: '' });
  const [page, setPage] = useState(1);
  const limit = 50;

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setIsRefreshing(true);
    try {
      const { data } = await fetchAuditLogs({ page, limit });
      // Replace local logs with server data directly
      replaceAuditLogs(data.logs || []);
    } catch (err) {
      console.warn('Using cached audit logs');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportLogs = async () => {
    try {
      await exportAuditLogs();
      Swal.fire({
        icon: 'success',
        title: 'Exportado!',
        text: 'Logs exportados com sucesso.',
        timer: 1500,
      });
    } catch (err) {
      // Fallback CSV export
      const header = 'ID;Utilizador;Ação;Módulo;Alvo;Detalhes;IP;Data/Hora\n';
      const rows = auditLogs
        .map((log) =>
          [
            log.id,
            log.user,
            log.action,
            log.modulo || '',
            log.target,
            log.details || '',
            log.ip || '',
            log.timestamp,
          ].join(';')
        )
        .join('\n');
      const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('REMOVEU')) return 'text-red-500 bg-red-50 dark:bg-red-900/20';
    if (action.includes('ALTEROU') || action.includes('EDITOU'))
      return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
    if (action.includes('LOGIN') || action.includes('LOGOUT'))
      return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
    return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchAction =
      !filters.action || log.action.toLowerCase().includes(filters.action.toLowerCase());
    const matchUser = !filters.user || log.user.toLowerCase().includes(filters.user.toLowerCase());
    return matchAction && matchUser;
  });

  return (
    <div className="space-y-8 animate-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Auditoria de Segurança
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Rastreabilidade completa de todas as ações no {settings.schoolAcronym}.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadLogs}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            <Download size={16} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Sincronizando...' : 'Sincronizar'}
          </button>
          <button
            onClick={handleExportLogs}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            <Download size={16} /> Exportar CSV
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs uppercase">
            <ShieldCheck size={16} /> Sistema Monitorado
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Filtrar por ação..."
          value={filters.action}
          onChange={(e) => setFilters({ ...filters, action: e.target.value })}
          className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-primary dark:text-white"
        />
        <input
          type="text"
          placeholder="Filtrar por utilizador..."
          value={filters.user}
          onChange={(e) => setFilters({ ...filters, user: e.target.value })}
          className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-primary dark:text-white"
        />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  ID
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Utilizador
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Ação
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Alvo / Detalhes
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Data/Hora
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-400 italic">
                    Nenhuma atividade registada ainda.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-8 py-5 text-[10px] font-mono text-slate-400">
                      {log.id.slice(0, 12)}...
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                          <User size={14} />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                          {log.user}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${getActionColor(log.action)}`}
                      >
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {log.target}
                      </p>
                      <p className="text-[9px] text-slate-500">{log.details}</p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 text-[9px] font-mono text-slate-400">
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

      {auditLogs.length > 0 && (
        <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-3xl flex items-start gap-4">
          <AlertTriangle className="text-primary shrink-0" size={20} />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <strong>Aviso de Auditoria:</strong> Estes registos são imutáveis e servem como prova
            institucional de todas as modificações na base de dados.
          </p>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;
