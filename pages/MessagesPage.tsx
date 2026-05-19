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
  Paperclip,
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
  const isDiretor = user?.role === UserRole.DIRETOR;
  const userRole = user?.role;
  const userTurma = user?.turma;

  // ---------------------------------------------------------------------------
  // Allowed peers filter (scope enforcement per role)
  // ADMIN: can message DIRETOR, PROFESSOR, SECRETARIA (ADMIN role for secretaria)
  // DIRETOR: can message PROFESSOR, SECRETARIA, ADMIN
  // PROFESSOR: can message own students, ADMIN, DIRETOR, SECRETARIA
  // ALUNO: can message classmates, SECRETARIA, own professors
  // ENCARREGADO: can message ADMIN, DIRETOR, PROFESORES dos filhos, SECRETARIA
  // ---------------------------------------------------------------------------
const allowedPeers = useMemo(() => {
      if (!user) return [];
      const excludedIds = new Set<string>([user.id]);
      
      return users.filter((u) => {
        if (excludedIds.has(u.id)) return false;
        
        // ADMIN: can message DIRETOR, PROFESSOR, SECRETARIA (ADMIN role for secretaria)
        if (isAdmin) {
          return u.role === UserRole.DIRETOR || u.role === UserRole.PROFESSOR || 
                 (u.role === UserRole.ADMIN && u.id !== '3'); // Secretaria has ADMIN role but different id
        }
        
        // DIRETOR: can message PROFESSOR, SECRETARIA, ADMIN
        if (isDiretor) {
          return u.role === UserRole.PROFESSOR || 
                 (u.role === UserRole.ADMIN && u.id !== '3') || // Secretaria (ADMIN role)
                 u.role === UserRole.ADMIN && u.id === '3'; // Include main admin
        }
        
        // PROFESSOR: can message own students, ADMIN, DIRETOR, SECRETARIA
        if (isProfessor) {
          if (u.role === UserRole.ALUNO) {
            // Only students in the same turma as the professor
            return u.turma && userTurma && u.turma === userTurma;
          }
          if (u.role === UserRole.ADMIN) {
            // ADMIN includes secretaria - exclude main admin, include secretaria
            return u.id === 'sec-1' || u.id === '3'; // Both admin and secretaria users
          }
          if (u.role === UserRole.DIRETOR) return true;
          return false;
        }
        
        // ALUNO: can message classmates, SECRETARIA, own professors
        if (isAluno) {
          if (u.role === UserRole.ALUNO) {
            // Same turma classmates
            return u.turma && userTurma && u.turma === userTurma;
          }
          if (u.role === UserRole.PROFESSOR) {
            // Own professors (same turma)
            return u.turma && userTurma && u.turma === userTurma;
          }
          if (u.role === UserRole.ADMIN && u.id === 'sec-1') return true; // Secretaria
          return false;
        }
        
        // ENCARREGADO: can message ADMIN, DIRETOR, PROFESSORES dos filhos, SECRETARIA
        if (isEncarregado) {
          const linkedStudentIds = user.studentIds || [];
          const linkedStudents = users.filter(u => linkedStudentIds.includes(u.id));
          const linkedTurmas = new Set(linkedStudents.map(s => s.turma).filter(Boolean));
          
          if (u.role === UserRole.ADMIN) {
            return u.id === 'sec-1' || u.id === '3'; // Secretaria or main admin
          }
          if (u.role === UserRole.DIRETOR) return true;
          if (u.role === UserRole.PROFESSOR && u.turma && linkedTurmas.has(u.turma)) return true;
          if (u.role === UserRole.ALUNO && linkedStudentIds.includes(u.id)) return true;
          return false;
        }
        
        return false;
      });
    }, [users, user, isProfessor, isAluno, isEncarregado, isDiretor, isAdmin, userTurma]);

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

  const [attachment, setAttachment] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const getAttachmentType = (file: File): 'image' | 'pdf' | 'audio' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type === 'application/pdf') return 'pdf';
    return 'audio';
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePeer) return;
    const hasText = content.trim().length > 0;
    if (!hasText && !attachment) return;
    try {
      if (attachment) {
        const url = URL.createObjectURL(attachment);
        const type = getAttachmentType(attachment);
        // send as a special message with attachment metadata in content JSON string
        await ctxSend(activePeer.id, JSON.stringify({ attachmentUrl: url, attachmentType: type }));
        setAttachment(null);
      }
      if (hasText) {
        await ctxSend(activePeer.id, content.trim());
      }
      setContent('');
    } catch (err) {
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
         <div className="flex-1 overflow-y-auto scrollbar-hide">
           {searchablePeers.length === 0 ? (
             <div className="p-10 text-center">
               <MessageCircle size={40} className="mx-auto text-slate-200 mb-3" />
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 Nenhum contacto encontrado
               </p>
               {isProfessor && (
                 <p className="text-[10px] text-slate-300 mt-1">
                   Os alunos aparecerão aqui.
                 </p>
               )}
             </div>
           ) : (
Object.entries(
                searchablePeers.reduce((acc, peer) => {
                  const turma = peer.turma || 'Administração / Outros';
                  if (!acc[turma]) acc[turma] = [];
                  acc[turma].push(peer);
                  return acc;
                }, {} as Record<string, User[]>)
              ).map(([turma, peers]) => (
                <div key={turma} className="mb-2">
                  <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/80 sticky top-0 z-10 border-y border-slate-100 dark:border-slate-700/80 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      {turma !== 'Administração / Outros' ? `Sala: ${turma}` : turma}
                    </span>
                  </div>
                  <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                    {(peers as User[]).map((peer) => {
                     // Find conversation for this peer
                     const conv = conversations.find(c => c.peerId === peer.id);
                     const isActive = activePeer?.id === peer.id;
                     const unread = conv ? conv.unreadCount > 0 : false;
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
                             {conv && (
                               <span className={`text-[10px] shrink-0 ${unread ? 'text-primary font-black' : 'text-slate-400'}`}>
                                 {formatTime(conv.lastMessage.timestamp)}
                               </span>
                             )}
                           </div>
                           <div className="flex items-center gap-1.5 mt-0.5">
                             {conv ? (
                               <>
                                 {conv.lastMessage.fromId === user?.id && (
                                   <CheckCheck size={11} className="text-primary shrink-0" />
                                 )}
                                 <p className={`text-[11px] truncate ${unread ? 'font-bold text-slate-800 dark:text-slate-100' : 'text-slate-400'}`}>
                                   {conv.lastMessage.fromId === user?.id ? 'Você: ' : ''}
                                   {conv.lastMessage.content}
                                 </p>
                               </>
                             ) : (
                               <p className="text-[11px] text-slate-400 italic">
                                 Iniciar conversa...
                               </p>
                             )}
                           </div>
                         </div>

                         {unread && conv && conv.unreadCount > 0 && (
                           <span className="shrink-0 min-w-[20px] h-5 px-1.5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center">
                             {conv.unreadCount}
                           </span>
                         )}
                       </button>
                     );
                   })}
                 </div>
               </div>
             ))
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
                <p className="text-sm font-black text-slate-800 dark:text-white truncate">
                  {activePeer.name}
                </p>
                {attachment && (
                  <div className="mt-2 text-xs text-slate-500">
                    Anexo: {attachment.name}
                  </div>
                )}
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
            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent scroll-smooth" id="msg-area">
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
                  // Parse possible attachment JSON
                  let attachment = null;
                  let textContent = msg.content;
                  try {
                    const parsed = JSON.parse(msg.content);
                    if (parsed && parsed.attachmentUrl && parsed.attachmentType) {
                      attachment = parsed;
                      textContent = '';
                    }
                  } catch (_) { }
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
{attachment ? (
                             attachment.attachmentType === 'image' ? (
                               <img src={attachment.attachmentUrl} alt="attachment" className="max-w-full h-auto rounded" />
                             ) : attachment.attachmentType === 'pdf' ? (
                               <div className="flex flex-col items-center gap-2">
                                 <embed 
                                   src={attachment.attachmentUrl} 
                                   type="application/pdf" 
                                   className="w-full h-64 border border-slate-200 dark:border-slate-600 rounded-lg"
                                 />
                                 <a 
                                   href={attachment.attachmentUrl} 
                                   download 
                                   className="text-xs text-primary hover:underline"
                                 >
                                   Baixar PDF
                                 </a>
                               </div>
                             ) : (
                               <audio controls className="w-full">
                                 <source src={attachment.attachmentUrl} type="audio/mpeg" />
                                 Seu navegador não suporta áudio.
                               </audio>
                             )
                           ) : (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{textContent}</p>
                          )}
                          <div className={`flex items-center gap-1 mt-1 ${mine ? 'justify-end text-white/60' : 'text-slate-400'}`}>
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
                <div className="flex-1 flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Escreva uma mensagem…"
                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-2xl text-sm outline-none dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-600"
                  />
                  <label className="cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                    <input type="file" accept="image/*,audio/*,application/pdf" className="hidden" onChange={handleFileChange} />
                    <Paperclip size={18} className="text-slate-500" />
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={!content.trim() && !attachment}
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
