import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, ChevronLeft, ChevronRight, X, GraduationCap } from 'lucide-react';
import { useAuth, useSettings, useSystemAdmin } from '../App';
import { SIDEBAR_LINKS } from '../constants';
import { UserRole } from '../types';
import Swal from 'sweetalert2';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle }) => {
  const { user, logout } = useAuth();
  const { t } = useSettings();
  const { settings } = useSystemAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Deseja realmente sair do sistema?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sim, sair',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/login');
      }
    });
  };

  const filteredLinks = SIDEBAR_LINKS.filter((link) =>
    user ? link.roles.includes(user.role) : false
  );

  return (
    <>
      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={toggle}
        ></div>
      )}

      <aside
        className={`fixed left-0 top-0 h-screen z-40 bg-primary text-white transition-all duration-300 shadow-xl overflow-hidden flex flex-col 
          ${isOpen ? 'w-64 translate-x-0' : 'w-20 lg:translate-x-0 -translate-x-full'}`}
      >
        {/* Brand */}
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3 overflow-hidden w-full">
            <div className="p-2 bg-white/10 rounded-xl shrink-0">
              <GraduationCap className="w-6 h-6 text-secondary" />
            </div>
            {isOpen && (
              <div className="flex flex-col truncate flex-1">
                <span className="font-bold text-lg leading-tight truncate">
                  {settings.schoolAcronym}
                </span>
                <span className="text-[10px] text-white/50 tracking-widest uppercase font-black">
                  Sistema Interno
                </span>
              </div>
            )}
          </div>
          {/* Close button for mobile inside sidebar */}
          <button
            onClick={toggle}
            className="lg:hidden p-2 text-white/50 hover:text-white transition-colors ml-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-6 space-y-1 overflow-y-auto scrollbar-hide px-2">
          {filteredLinks.map((link, idx) => (
            <NavLink
              key={`${link.path}-${idx}`}
              to={link.path}
              onClick={() => {
                if (window.innerWidth < 1024) toggle();
              }}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3 transition-all duration-200 rounded-xl
                ${isActive ? 'sidebar-item-active text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'}
              `}
            >
              <link.icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && (
                <span className="text-sm font-bold uppercase tracking-wide truncate">
                  {link.label}
                </span>
              )}
              {!isOpen && (
                <div className="hidden lg:block absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {link.label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-4">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 px-4 py-3 text-white/60 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all
              ${!isOpen ? 'justify-center' : ''}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="text-sm font-bold uppercase tracking-wide">Sair</span>}
          </button>
        </div>

        {/* Toggle Button for Desktop - Floating */}
        <button
          onClick={toggle}
          className="absolute bottom-6 right-4 hidden lg:flex items-center justify-center bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition-all"
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
