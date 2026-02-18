import React, { useMemo, useState } from 'react';
import { useDatabase, useAuth } from '../App';
import { Send, MessageCircle } from 'lucide-react';

const MessagesPage: React.FC = () => {
  const { messages, sendMessage, markMessageRead, users } = useDatabase();
  const { user } = useAuth();
  const [targetId, setTargetId] = useState('');
  const [content, setContent] = useState('');

  const availableTargets = useMemo(() => {
    if (!user) return [];
    return users.filter(u => {
      if (u.id === user.id) return false;
      if (user.turma) return u.turma === user.turma;
      return true;
    });
  }, [users, user]);

  const relatedMessages = useMemo(() => {
    if (!user) return [];
    return messages.filter(m => m.toId === user.id || m.fromId === user.id);
  }, [messages, user]);

  const inboxMessages = useMemo(() => {
    if (!user) return [];
    return relatedMessages.filter(m => m.toId === user.id);
  }, [relatedMessages, user]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId || !content.trim()) return;
    sendMessage(targetId, content.trim());
    setContent('');
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8 animate-fade h-[calc(100vh-160px)]">
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 p-8 flex flex-col">
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8">Nova Mensagem</h3>
        <form onSubmit={handleSend} className="space-y-6 flex-1">
          <div>
            <label className="text-xs font-black text-slate-400 uppercase mb-2 block">Destinatário</label>
            <select value={targetId} onChange={(e) => setTargetId(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-none outline-none font-bold text-slate-700 dark:text-slate-200">
              <option value="">Seleccione um usuário</option>
              {availableTargets.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
            {availableTargets.length === 0 && (
              <p className="text-[10px] font-bold text-slate-400 mt-2">Nenhum usuário da mesma turma disponível.</p>
            )}
          </div>
          <div className="flex-1 flex flex-col">
            <label className="text-xs font-black text-slate-400 uppercase mb-2 block">Conteúdo</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Escreva aqui..." className="w-full flex-1 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-none outline-none font-medium text-slate-700 dark:text-slate-200 resize-none min-h-[200px]" />
          </div>
          <button type="submit" className="w-full py-5 bg-[#003366] text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl hover:bg-blue-900 transition-all">
            <Send size={20} /> Enviar Mensagem
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 p-8 flex flex-col">
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8">Caixa de Entrada</h3>
        <div className="space-y-4 overflow-y-auto flex-1 pr-2">
          {inboxMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-300">
              <MessageCircle size={64} className="mb-4 opacity-20" />
              <p className="font-bold italic">Nenhuma mensagem recente</p>
            </div>
          ) : (
            inboxMessages.map(msg => (
              <button
                key={msg.id}
                onClick={() => markMessageRead(msg.id)}
                className={`w-full text-left p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all ${!msg.read ? 'ring-2 ring-primary/20' : ''}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white dark:bg-slate-800 text-[#003366] rounded-full flex items-center justify-center font-bold">
                      {msg.from.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 dark:text-white">{msg.from}</p>
                      <p className="text-[10px] text-slate-400">Enviado em {msg.timestamp}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-[#FFD700] uppercase tracking-widest">Para: {msg.to}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{msg.content}</p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
