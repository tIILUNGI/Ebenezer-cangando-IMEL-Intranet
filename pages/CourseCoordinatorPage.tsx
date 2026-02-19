import React, { useState } from 'react';
import { useDatabase, useAuth } from '../App';
import { UserRole } from '../types';
import { Briefcase, Users, BookOpen, AlertTriangle, Send, X, MessageSquare } from 'lucide-react';

const CourseCoordinatorPage: React.FC = () => {
  const { user } = useAuth();
  const { users, sendMessage } = useDatabase();
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);

  if (user?.coordinatorType !== 'curso') {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertTriangle size={64} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-black">Acesso Negado</h2>
        <p>Você não tem permissão de Coordenador de Curso.</p>
      </div>
    );
  }

  const courseName = user.coordinatedEntity || '';
  const allStudents = users.filter(u => u.role === UserRole.ALUNO);
  const classes = Array.from(new Set(allStudents.map(s => s.turma).filter(Boolean)));
  const relevantClasses = classes.filter(c => c?.toLowerCase().includes(courseName.toLowerCase()));
  const displayClasses = relevantClasses.length > 0 ? relevantClasses : classes;
  const courseStudents = allStudents.filter(s => displayClasses.includes(s.turma));

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim()) return;
    
    setSending(true);
    
    for (const student of courseStudents) {
      sendMessage(student.id, `[COMUNICADO COORDENAÇÃO] ${messageContent}`);
    }

    setTimeout(() => {
      setSending(false);
      setIsMsgModalOpen(false);
      setMessageContent('');
      alert(`Mensagem enviada para ${courseStudents.length} alunos com sucesso.`);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade">
      <div className="bg-primary p-8 rounded-[2.5rem] text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl">
                <Briefcase size={32} />
            </div>
            <div>
                <h1 className="text-3xl font-black">Coordenação de Curso</h1>
                <p className="opacity-80">Curso: <span className="font-bold underline">{courseName}</span></p>
            </div>
            </div>
            <button 
                onClick={() => setIsMsgModalOpen(true)}
                className="px-6 py-3 bg-white text-primary rounded-xl font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2"
            >
                <MessageSquare size={20} /> Comunicado Geral
            </button>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="bg-white/10 p-4 rounded-2xl">
            <p className="text-xs font-bold uppercase opacity-70">Total de Turmas</p>
            <p className="text-2xl font-black">{displayClasses.length}</p>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl">
            <p className="text-xs font-bold uppercase opacity-70">Total de Alunos</p>
            <p className="text-2xl font-black">{courseStudents.length}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayClasses.map(turma => (
            <div key={turma} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm">
              <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">{turma}</h3>
              <button className="w-full py-3 border border-slate-200 dark:border-slate-600 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                Ver Detalhes
              </button>
            </div>
        ))}
      </div>

      {isMsgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-fade">
            <div className="px-8 py-6 bg-primary text-white flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2"><Send size={20}/> Enviar Comunicado</h3>
              <button onClick={() => setIsMsgModalOpen(false)}><X /></button>
            </div>
            <form onSubmit={handleBroadcast} className="p-8 space-y-4">
              <textarea required rows={5} value={messageContent} onChange={(e) => setMessageContent(e.target.value)} placeholder="Escreva o comunicado aqui..." className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-primary dark:text-white resize-none" />
              <button type="submit" disabled={sending} className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2">
                  {sending ? 'Enviando...' : <><Send size={18}/> Enviar Agora</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCoordinatorPage;