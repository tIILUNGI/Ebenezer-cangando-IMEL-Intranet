import React, { useState, useEffect, useRef } from 'react';
import { Megaphone, Plus, X, Send, Check, User as UserIcon } from 'lucide-react';
import { useAuth, useDatabase } from '../App';
import { UserRole } from '../types';
import { createAnnouncement, fetchNotifications } from '../src/api/index';
import Swal from 'sweetalert2';
import gsap from 'gsap';

const AvisosPage: React.FC = () => {
  const { user } = useAuth();
  const { notifications, addNotification } = useDatabase();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [restrictedToMyStudents, setRestrictedToMyStudents] = useState(false);

  const isProfessor = user?.role === UserRole.PROFESSOR;
  const isDiretor = user?.role === UserRole.DIRETOR;
  const canCreate = user?.role === UserRole.DIRETOR || user?.role === UserRole.PROFESSOR;
  const avisosRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    setIsRefreshing(true);
    try {
      const { data } = await fetchNotifications();
      data.forEach((n: any) => {
        if (!notifications.find((ln) => ln.id === n.id)) {
          addNotification({
            title: n.titulo,
            message: n.mensagem,
            type: n.tipo || 'announcement',
            targetAudience: n.target_audience || 'Todos',
            authorName: n.author_name || 'Sistema',
          });
        }
      });
    } catch (err) {
      console.warn('Using cached notifications');
    } finally {
      setIsRefreshing(false);
    }
  };

  const myAnnouncements = notifications
    .filter(
      (n) =>
        n.type === 'announcement' &&
        (n.targetAudience === 'Todos' || 
         n.targetAudience === 'Aluno' || 
         n.targetAudience === user?.role ||
         (user?.role === UserRole.ALUNO && n.targetAudience === 'Aluno'))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    if (isProfessor) setRestrictedToMyStudents(true);
  }, [isProfessor]);

  useEffect(() => {
    if (avisosRef.current && myAnnouncements.length > 0) {
      const items = avisosRef.current.children;
      gsap.fromTo(
        items,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, stagger: 0.08, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, [myAnnouncements]);

  useEffect(() => {
    if (avisosRef.current && myAnnouncements.length > 0) {
      const items = avisosRef.current.children;
      gsap.fromTo(
        items,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, stagger: 0.08, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, [myAnnouncements]);

  const handleCreateAviso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    const audience = isDiretor ? 'Aluno' : 'Aluno';

    try {
      await createAnnouncement({ title, message, targetAudience: audience });
      Swal.fire({
        icon: 'success',
        title: 'Publicado!',
        text: 'Aviso criado com sucesso.',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.warn('API failed, using local');
    }

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
    // handled by DatabaseContext
  };

  return (
    <div className="space-y-8 animate-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Megaphone className="text-primary" />
            Mural de Avisos
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Comunicados importantes da Direção e Coordenação.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadNotifications}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {isRefreshing ? 'Atualizando...' : 'Sincronizar'}
          </button>
          {canCreate && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg hover:scale-105 transition-all"
            >
              <Plus size={18} /> Criar Aviso
            </button>
          )}
        </div>
      </div>

       {/* Professor scope warning */}
       {isProfessor && (
         <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400 rounded-lg flex items-center gap-3 text-blue-800 dark:text-blue-300 shadow-sm">
           <UserIcon size={22} className="flex-shrink-0" />
           <div>
             <span className="text-sm font-medium">
               Avisos enviados por si são distribuídos 
             </span>
             <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
               apenas para os alunos das suas turmas
             </span>
           </div>
         </div>
       )}

      {isModalOpen && canCreate && (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-md animate-fade mb-8 max-w-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 mb-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <Megaphone className="text-primary" /> Novo Comunicado Escolar
            </h3>
            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
              <X size={18} className="text-slate-500" />
            </button>
          </div>
          <form onSubmit={handleCreateAviso} className="space-y-6">
            {/* Director audience picker */}
            {isDiretor && !isProfessor && (
              <div>
                <label className="block text-sm font-black text-slate-500 mb-3">
                  Enviar para:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Aluno', 'Professor'].map((aud) => (
                    <button
                      type="button"
                      key={aud}
                      onClick={() => setRestrictedToMyStudents(false)}
                      className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all border-primary bg-primary/5`}
                    >
                      <UserIcon className="text-primary" />
                      <span className="font-bold">{aud}s</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Professor: unable to change audience, show readonly badge */}
            {isProfessor && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/15 rounded-2xl border border-blue-200 dark:border-blue-800 flex items-center gap-3">
                <UserIcon className="text-primary" size={20} />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Público-alvo: <span className="text-primary">Alunos das minhas turmas</span>
                </span>
              </div>
            )}

            <div>
              <label htmlFor="aviso-title" className="block text-sm font-black text-slate-500 mb-2">
                Título do Aviso
              </label>
              <input
                id="aviso-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Reunião Geral de Pais"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary dark:text-white text-sm"
              />
            </div>
            <div>
              <label htmlFor="aviso-message" className="block text-sm font-black text-slate-500 mb-2">
                Mensagem
              </label>
              <textarea
                id="aviso-message"
                required
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Detalhes do comunicado..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary resize-none dark:text-white text-sm"
              />
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2"
              >
                <Send size={16} /> Publicar Aviso
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6" ref={avisosRef}>
        {myAnnouncements.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
            <Megaphone size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="mt-4 text-slate-500 font-bold">Nenhum aviso para si no momento.</p>
          </div>
        ) : (
          myAnnouncements.map((aviso) => (
            <div
              key={aviso.id}
              className={`p-8 rounded-3xl border-l-8 ${aviso.read ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700' : 'bg-primary/5 border-primary'}`}
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase">
                      {aviso.targetAudience}
                    </span>
                    {!aviso.read && (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase">
                        Novo
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {aviso.title}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Por <span className="font-bold">{aviso.authorName}</span> em{' '}
                    {new Date(aviso.timestamp).toLocaleDateString()}
                  </p>
                </div>
                {!aviso.read && (
                  <button
                    onClick={() => handleMarkAsRead(aviso.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                  >
                    <Check size={14} /> Marcar como lido
                  </button>
                )}
              </div>
              <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                {aviso.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AvisosPage;
