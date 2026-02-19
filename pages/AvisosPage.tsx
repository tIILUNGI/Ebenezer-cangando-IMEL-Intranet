import React, { useState, useMemo } from 'react';
import { useAuth, useDatabase } from '../App';
import { UserRole } from '../types';
import { Megaphone, Plus, X, Send, User, Users, Check } from 'lucide-react';

const AvisosPage: React.FC = () => {
  const { user } = useAuth();
  const { notifications, addNotification, markNotificationRead } = useDatabase();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<UserRole.ALUNO | UserRole.PROFESSOR>(UserRole.ALUNO);

  const canCreate = user?.role === UserRole.DIRETOR || user?.role === UserRole.PROFESSOR;

  const myAnnouncements = useMemo(() => {
    if (!user) return [];
    return notifications
      .filter(n => 
        n.type === 'announcement' &&
        (n.targetAudience === user.role || n.targetAudience === 'Todos')
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [notifications, user]);

  const handleCreateAviso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    const audience = user?.role === UserRole.DIRETOR ? targetAudience : UserRole.ALUNO;

    addNotification({
      title,
      message,
      type: 'announcement',
      targetAudience: audience,
      authorName: user?.name || 'Sistema',
    });

    setIsModalOpen(false);
    setTitle('');
    setMessage('');
  };

  const handleMarkAsRead = (id: string) => {
    markNotificationRead(id);
  };

  return (
    <div className="space-y-8 animate-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Megaphone className="text-primary" />
            Mural de Avisos
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Comunicados importantes da Direção e Coordenação.</p>
        </div>
        {canCreate && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg hover:scale-105 transition-all"
          >
            <Plus size={18} /> Criar Aviso
          </button>
        )}
      </div>

      <div className="space-y-6">
        {myAnnouncements.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
            <Megaphone size={48} className="mx-auto text-slate-300" />
            <p className="mt-4 text-slate-500 font-bold">Nenhum aviso para si no momento.</p>
          </div>
        ) : (
          myAnnouncements.map(aviso => (
            <div key={aviso.id} className={`p-8 rounded-3xl border-l-8 ${aviso.read ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700' : 'bg-primary/5 border-primary'}`}>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black uppercase">{aviso.targetAudience}</span>
                    {!aviso.read && <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase">Novo</span>}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{aviso.title}</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Por <span className="font-bold">{aviso.authorName}</span> em {new Date(aviso.timestamp).toLocaleDateString()}
                  </p>
                </div>
                {!aviso.read && (
                  <button onClick={() => handleMarkAsRead(aviso.id)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50">
                    <Check size={14} /> Marcar como lido
                  </button>
                )}
              </div>
              <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">{aviso.message}</p>
            </div>
          ))
        )}
      </div>

      {isModalOpen && canCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-fade">
            <div className="px-8 py-6 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3"><Megaphone /> Novo Aviso</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateAviso} className="p-8 space-y-6">
              {user?.role === UserRole.DIRETOR && (
                <div>
                  <label className="block text-sm font-black text-slate-500 mb-3">Enviar para:</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setTargetAudience(UserRole.ALUNO)} className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${targetAudience === UserRole.ALUNO ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700'}`}><Users className={targetAudience === UserRole.ALUNO ? 'text-primary' : 'text-slate-400'} /><span className="font-bold">Alunos</span></button>
                    <button type="button" onClick={() => setTargetAudience(UserRole.PROFESSOR)} className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${targetAudience === UserRole.PROFESSOR ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700'}`}><User className={targetAudience === UserRole.PROFESSOR ? 'text-primary' : 'text-slate-400'} /><span className="font-bold">Professores</span></button>
                  </div>
                </div>
              )}
              <div><label htmlFor="aviso-title" className="block text-sm font-black text-slate-500 mb-2">Título do Aviso</label><input id="aviso-title" type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Reunião Geral de Pais" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary" /></div>
              <div><label htmlFor="aviso-message" className="block text-sm font-black text-slate-500 mb-2">Mensagem</label><textarea id="aviso-message" required rows={6} value={message} onChange={e => setMessage(e.target.value)} placeholder="Detalhes do comunicado..." className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary resize-none" /></div>
              <div className="pt-4 flex justify-end gap-3"><button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">Cancelar</button><button type="submit" className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2"><Send size={16} /> Publicar Aviso</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvisosPage;