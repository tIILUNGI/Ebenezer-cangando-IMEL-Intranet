import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Send,
  MessageCircle,
  Search,
  User as UserIcon,
  Phone,
  MoreVertical,
  ArrowLeft,
  Check,
  CheckCheck,
  Image as ImageIcon,
} from 'lucide-react';
import { useDatabase, useAuth } from '../App';
import { User, UserRole } from '../types';
import Swal from 'sweetalert2';

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { messages, users, sendMessage: ctxSend, markMessageRead, refreshData } = useDatabase();
  const [activePeer, setActivePeer] = useState<User | null>(null);
  const [content, setContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isProfessor = user?.role === UserRole.PROFESSOR;
  const isAdmin = user?.role === UserRole.ADMIN;
  const isAluno = user?.role === UserRole.ALUNO;
  const isEncarregado = user?.role === UserRole.ENCARREGADO;
  const userRole = user?.role;
  const userTurma = user?.turma;

  // ---------------------------------------------------------------------------
  // Allowed peers filter (scope enforcement)
  // Professor → only their students; Aluno → same class mates; Encarregado → linked students; others → all
  // ---------------------------------------------------------------------------
  const allowedPeers = useMemo(() => {
    if (!user) return [];
    const excludedIds = new Set<string>([user.id]);
    return users.filter((u) => {
      if (excludedIds.has(u.id)) return false;
      
      // Professor: can message students from their classes (TODO: implement proper class association)
      // For now, allow messaging all students (will be refined with actual class data)
      if (isProfessor) {
        if (u.role !== UserRole.ALUNO) return false;
        // TODO: Replace with actual class association logic when available
        // e.g., check if u.turma is in user's taught classes from ClassSchedule
        return true; // Temporary: allow all students
      }
      
      // Aluno/Encarregado: only same turma
      if (isAluno || isEncarregado) {
        return u.turma && userTurma && u.turma === userTurma;
      }
      
      // Other roles (ADMIN, DIRETOR, etc.): can message everyone
      return true;
    });
  }, [users, user, isProfessor, isAluno, isEncarregado, userTurma]);

  // Searchable peers (allowed peers that match search term)
  const searchablePeers = useMemo(() => {
    if (!searchTerm) return allowedPeers;
    const term = searchTerm.toLowerCase();
    return allowedPeers.filter(u => u.name.toLowerCase().includes(term));
  }, [allowedPeers, searchTerm]);

  // ---------------------------------------------------------------------------
  // Conversation threads — one per (user + peerId)
  // ---------------------------------------------------------------------------
  const conversations = useMemo(() => {
    const map: Record<string, any> = {};
    (messages as any[]).forEach((msg) => {
      // Only keep relevant threads
      if (user && (msg.fromId !== user.id && msg.toId !== user.id)) return;
      const peerId = msg.fromId === user?.id ? msg.toId : msg.fromId;
      if (!map[peerId]) {
        map[peerId] = {
          peerId,
          messages: [],
          lastMessage: msg,
          unreadCount: 0,
        };
      }
      map[peerId].messages.push(msg);
      if (new Date(msg.timestamp).getTime() > new Date(map[peerId].lastMessage.timestamp).getTime()) {
        map[peerId].lastMessage = msg;
      }
      if (msg.fromId !== user?.id && !msg.read) {
        map[peerId].unreadCount++;
      }
    });
    return Object.values(map).sort(
      (a: any, b: any) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
    );
  }, [messages, user]);

  // Build active conversation's messages
  const activeThread = useMemo(() => {
    if (!activePeer || !user) return [];
    const relevant = (messages as any[]).filter(
      (m) =>
        (m.fromId === user.id && m.toId === activePeer.id) ||
        (m.toId === user.id && m.fromId === activePeer.id)
    );
    return relevant.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [messages, activePeer, user]);

  // Mark messages as read when opening chat
  useEffect(() => {
    if (!activePeer || !user) return;
    (messages as any[])
      .filter((m) => m.toId === user.id && m.fromId === activePeer.id && !m.read)
      .forEach((m) => {
        markMessageRead(m.id);
      });
  }, [activePeer, messages, user, markMessageRead]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread]);

  const handleSelectPeer = (peer: User) => {
    setActivePeer(peer);
    setMobileView('chat');
  };

  const handleBackToList = () => setMobileView('list');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePeer || !content.trim()) return;
    const trimmed = content.trim();
    setContent('');
    // ctxSend writes to local state immediately (setMessages), so the message is
    // visible in the chat right away. The backend sync (apiSendMessage) happens
    // asynchronously in the background and does not block the UI.
    try {
      await ctxSend(activePeer.id, trimmed);
    } catch (err) {
      // If even the local write failed, inform the user
      Swal.fire({
        icon: 'error',
        title: 'Erro ao enviar mensagem',
        text: (err as any)?.message || 'Tente novamente.',
      });
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ── format timestamp ────────────────────────────────────────────────────
  const formatTime = (ts: string) => {
    try { return new Date(ts).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }); }
    catch { return ts; }
  };
  const formatDateLabel = (ts: string) => {
    try { return new Date(ts).toLocaleDateString('pt-PT', { weekday: 'long', day: '2-digit', month: 'short' }); }
    catch { return ts; }
  };

  // ── need to load messages from API on mount ─────────────────────────────
  useEffect(() => {
    // Ensure messages/users are hydrated for this page.
    refreshData();
  }, []);

  // ── empty state ─────────────────────────────────────────────────────────
  const renderEmptyState = () => (
    <div className="flex-1 flex flex-col items-center justify-center h-full text-slate-300 gap-3 p-8">
      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
        <MessageCircle size={36} className="text-slate-300" />
      </div>
      <p className="font-bold text-slate-400 text-center">
        {isProfessor
          ? 'Seus alunos aparecerão aqui assim que iniciarem uma conversa.'
          : 'Selecione uma conversa para começar.'}
      </p>
    </div>
  );

  // ── Subject Pick Filter Modal ───────────────────────────────────────────
  const SubjectPicker = () => {
    const [pin, setPin] = useState('');
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-4 text-center p-8">
        <MessageCircle size={48} className="text-slate-200" />
        <p className="font-black text-slate-400 text-sm">
          {isProfessor
            ? 'As mensagens com os seus alunos surgirão aqui.'
            : 'Escolha um contato na barra lateral para enviar mensagens.'}
        </p>
      </div>
    );
  };

   // ── Main layout ─────────────────────────────────────────────────────────
   return (
     <div className="flex h-[calc(100vh-8rem)] lg:h-[calc(100vh-9rem)] bg-slate-100 dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg">
       {/* ═════════════════════════════════════════════
           LEFT PANEL — Conversation List
       ═══════════════════════════════════════════════ */}
       <div
         className={`w-full sm:w-80 lg:w-96 flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
           ${mobileView === 'chat' ? 'hidden sm:flex' : 'flex'}`}
       >
         {/* Header */}
         <div className="p-4 border-b border-slate-100 dark:border-slate-700 shrink-0">
           <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
             <MessageCircle size={20} className="text-primary" />
             Mensagens
           </h2>
           <div className="mt-3 relative">
             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input
               type="text"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Pesquisar conversa…"
               className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none dark:text-white placeholder:text-slate-400"
             />
           </div>
         </div>

         {/* Conversation list */}
         <div className="flex-1 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700/50 scrollbar-hide">
           {searchablePeers.length === 0 && conversations.length === 0 ? (
             <div className="p-10 text-center">
               <MessageCircle size={40} className="mx-auto text-slate-200 mb-3" />
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 Nenhuma conversa ainda
               </p>
               {isProfessor && (
                 <p className="text-[10px] text-slate-300 mt-1">
                   Aguarde um aluno enviar uma mensagem.
                 </p>
               )}
             </div>
           ) : (
             searchablePeers.map((peer) => {
               // Find conversation for this peer
               const conv = conversations.find(c => c.peerId === peer.id);
               if (!conv) return null;
               const isActive = activePeer?.id === peer.id;
               const unread = conv.unreadCount > 0;
               return (
                 <button
                   key={peer.id}
                   onClick={() => handleSelectPeer(peer)}
                   className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left
                     ${isActive
                       ? 'bg-blue-50/60 dark:bg-blue-900/15'
                       : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}
                 >
                   {/* Avatar */}
                   <div className="relative shrink-0">
                     <div className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-white text-sm
                       ${isActive ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200'}`}>
                       {peer.name.charAt(0).toUpperCase()}
                     </div>
                     {unread && (
                       <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />
                     )}
                   </div>

                   {/* Name + last message */}
                   <div className="flex-1 min-w-0">
                     <div className="flex items-center justify-between gap-2">
                       <span className={`text-[13px] font-black truncate ${unread ? 'text-slate-800 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                         {peer.name}
                       </span>
                       <span className={`text-[10px] shrink-0 ${unread ? 'text-primary font-black' : 'text-slate-400'}`}>
                         {formatTime(conv.lastMessage.timestamp)}
                       </span>
                     </div>
                     <div className="flex items-center gap-1.5 mt-0.5">
                       {conv.lastMessage.fromId === user?.id && (
                         <CheckCheck size={11} className="text-primary shrink-0" />
                       )}
                       <p className={`text-[11px] truncate ${unread ? 'font-bold text-slate-800 dark:text-slate-100' : 'text-slate-400'}`}>
                         {conv.lastMessage.fromId === user?.id ? 'Você: ' : ''}
                         {conv.lastMessage.content}
                       </p>
                     </div>
                   </div>

                   {conv.unreadCount > 0 && (
                     <span className="shrink-0 min-w-[20px] h-5 px-1.5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center">
                       {conv.unreadCount}
                     </span>
                   )}
                 </button>
               );
             })
           )}
         </div>
       </div>

      {/* ══════════════════════════════════════════════
          RIGHT PANEL — Chat
      ══════════════════════════════════════════════ */}
      <div
        className={`flex-1 flex flex-col bg-slate-50 dark:bg-slate-900/50
          ${mobileView === 'list' ? 'hidden sm:flex' : 'flex'}`}
      >
        {!activePeer ? (
          renderEmptyState()
        ) : (
          <>
            {/* ─── Chat Header ─── */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center gap-3 shrink-0 shadow-sm">
              <button
                onClick={handleBackToList}
                className="sm:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowLeft size={18} className="text-slate-500" />
              </button>
              <div className="w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center font-black text-sm">
                {activePeer.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-800 dark:text-white truncate">{activePeer.name}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                  {activePeer.role} {activePeer.turma ? `· ${activePeer.turma}` : ''}
                </p>
              </div>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400">
                <Phone size={16} />
              </button>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400">
                <MoreVertical size={16} />
              </button>
            </div>

            {/* ─── Messages Area ─── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide scroll-smooth" id="msg-area">
              {activeThread.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-2">
                  <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <ImageIcon size={24} />
                  </div>
                  <p className="text-[11px] font-bold text-slate-400">
                    Inicie a conversa com <span className="text-slate-600 dark:text-slate-300 font-black">{activePeer.name}</span>
                  </p>
                </div>
              ) : (
                activeThread.map((msg: any, idx: number) => {
                  const mine = msg.fromId === user?.id;
                  const showDate = idx === 0 ||
                    formatDateLabel(msg.timestamp) !== formatDateLabel(activeThread[idx - 1]?.timestamp);
                  return (
                    <React.Fragment key={msg.id}>
                      {showDate && (
                        <div className="flex items-center gap-2 py-2">
                          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                            {formatDateLabel(msg.timestamp)}
                          </span>
                          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                        </div>
                      )}
                      <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl shadow-sm ${
                          mine
                            ? 'bg-primary text-white rounded-br-md'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-md border border-slate-200 dark:border-slate-600'
                        }`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                          <div className={`flex items-center gap-1 mt-1
                            ${mine ? 'justify-end text-white/60' : 'text-slate-400'}`}>
                            <span className="text-[9px]">{formatTime(msg.timestamp)}</span>
                            {mine && <CheckCheck size={12} className="text-white/80" />}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ─── Message Input ─── */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escreva uma mensagem…"
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-2xl text-sm outline-none dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-600"
                />
                <button
                  type="submit"
                  disabled={!content.trim()}
                  className="p-3 bg-primary text-white rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
