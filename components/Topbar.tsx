
import React, { useState } from 'react';
import { Bell, Search, Menu, Sun, Moon, Languages, MessageSquare, AlertCircle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useSettings, useDatabase } from '../App';

interface TopbarProps {
  toggleSidebar: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const { theme, lang, toggleTheme, toggleLang, t } = useSettings();
  const { notifications, markNotificationRead } = useDatabase();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotifIcon = (type: string) => {
    switch(type) {
      case 'message': return <MessageSquare size={16} className="text-blue-500" />;
      case 'grade': return <FileText size={16} className="text-emerald-500" />;
      case 'announcement': return <AlertCircle size={16} className="text-orange-500" />;
      default: return <Bell size={16} className="text-slate-400" />;
    }
  };

  const handleSearchNavigation = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const value = searchValue.trim().toLowerCase();
    if (!value) return;

    const routeMap: Record<string, string> = {
      dashboard: '/dashboard',
      painel: '/dashboard',
      notas: '/notas',
      frequencia: '/frequencia',
      horario: '/horario',
      biblioteca: '/biblioteca',
      mensagens: '/mensagens',
      perfil: '/perfil',
      usuarios: '/admin/usuarios',
      branding: '/admin/branding',
      suporte: '/suporte'
    };

    const target = routeMap[value];
    if (target) navigate(target);
  };

  return (
    <header className="h-16 md:h-20 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm transition-colors duration-300">
      <div className="flex items-center gap-2 md:gap-4">
        <button onClick={toggleSidebar} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 transition-colors">
          <Menu size={20} />
        </button>
        <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-xl w-64 xl:w-80">
          <Search size={18} className="text-slate-400" />
          <input type="text" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} onKeyDown={handleSearchNavigation} placeholder={t('search')} className="bg-transparent border-none focus:outline-none text-sm ml-3 w-full text-slate-600 dark:text-slate-200" />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
        <div className="hidden xs:flex items-center gap-2">
          <button onClick={toggleLang} className="flex items-center gap-1.5 p-1.5 md:p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-500 dark:text-slate-400">
            <Languages size={18} />
            <span className="text-[10px] md:text-xs font-black uppercase">{lang}</span>
          </button>

          <button onClick={toggleTheme} className="p-1.5 md:p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-500 dark:text-slate-400">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-1.5 md:p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 md:w-4 md:h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-slate-800">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-4 w-72 md:w-80 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-fade">
              <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notificações</span>
                <span className="text-[9px] bg-primary text-white px-2 py-0.5 rounded-full">{unreadCount} Novas</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center text-slate-300 italic text-sm font-bold">Sem notificações</div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-4 md:p-5 border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors ${!n.read ? 'bg-blue-50/20 dark:bg-blue-900/10' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className="mt-1 shrink-0">{getNotifIcon(n.type)}</div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-xs font-black text-slate-800 dark:text-white leading-tight truncate">{n.title}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug line-clamp-2">{n.message}</p>
                        </div>
                        {!n.read && <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1 shrink-0"></div>}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button className="w-full py-3 md:py-4 text-[9px] font-black uppercase tracking-widest text-primary bg-white dark:bg-slate-800 hover:bg-slate-50 transition-colors">Limpar tudo</button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 md:gap-4 pl-2 md:pl-6 border-l border-slate-200 dark:border-slate-700">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] md:text-sm font-black text-slate-800 dark:text-slate-100 truncate max-w-[120px] md:max-w-none">{user?.name}</p>
            <p className="text-[9px] md:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">{user?.role}</p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 bg-primary text-white rounded-xl flex items-center justify-center font-bold ring-2 ring-blue-50 dark:ring-slate-700 text-xs md:text-sm">
            {user?.name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;

